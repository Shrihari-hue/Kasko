/**
 * Service layer — all business logic lives here as plain async functions that
 * take the Prisma client. API route handlers are thin wrappers around these,
 * and the smoke test exercises them directly (no HTTP needed).
 */
import type { PrismaClient } from "@prisma/client";
import { generateOtp, hashOtp, verifyOtpHash } from "./auth";
import { sms, bureau, kyc as kycVendor, upi, nbfc } from "./adapters";
import { twilioConfigured, startVerification, checkVerification } from "./twilio";
import {
  quote, amountOwed, lateFee, limitFromScore,
  CIBIL_MIN_TO_BORROW, ON_TIME_LIMIT_BUMP, TENURE_DAYS,
} from "./money";

export class DomainError extends Error {
  constructor(message: string, public code = "DOMAIN_ERROR") { super(message); }
}

/* ───────────── AUTH ───────────── */
export async function requestOtp(db: PrismaClient, phone: string) {
  if (!/^\d{10}$/.test(phone)) throw new DomainError("Enter a valid 10-digit mobile number", "BAD_PHONE");

  // Twilio Verify path: Twilio generates, sends and tracks the code for us.
  if (twilioConfigured()) {
    try {
      await startVerification(phone);
    } catch (e) {
      console.error("[twilio] start verification failed:", e);
      throw new DomainError("Could not send the verification SMS. Try again.", "SMS_SEND_FAILED");
    }
    return { sent: true }; // no devCode — the real code is delivered by SMS
  }

  // Mock/dev path: generate locally, store a hash, "send" via the mock adapter.
  const code = generateOtp();
  const codeHash = hashOtp(phone, code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  await db.otpChallenge.create({ data: { phone, codeHash, expiresAt } });
  await sms.send(phone, `${code} is your Kasko verification code. Valid 5 minutes.`);
  // In dev we return the code so the UI/test can show it. Never do this in prod.
  return { sent: true, devCode: process.env.NODE_ENV === "production" ? undefined : code };
}

export async function verifyOtp(db: PrismaClient, phone: string, code: string) {
  if (!/^\d{4,8}$/.test(code)) throw new DomainError("Enter the code from the SMS.", "BAD_CODE");

  // Twilio Verify path: ask Twilio whether the code is approved.
  if (twilioConfigured()) {
    let approved = false;
    try {
      approved = await checkVerification(phone, code);
    } catch (e) {
      console.error("[twilio] check verification failed:", e);
      throw new DomainError("Verification failed. Request a new code.", "OTP_CHECK_FAILED");
    }
    if (!approved) throw new DomainError("Incorrect or expired code.", "OTP_WRONG");
    return db.user.upsert({ where: { phone }, update: {}, create: { phone } });
  }

  // Mock/dev path: validate against the locally stored hash.
  const challenge = await db.otpChallenge.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge) throw new DomainError("Code expired or not found. Request a new one.", "OTP_EXPIRED");
  if (challenge.attempts >= 5) throw new DomainError("Too many attempts. Request a new code.", "OTP_LOCKED");

  if (!verifyOtpHash(phone, code, challenge.codeHash)) {
    await db.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    throw new DomainError("Incorrect code.", "OTP_WRONG");
  }
  await db.otpChallenge.update({ where: { id: challenge.id }, data: { consumed: true } });

  const user = await db.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });
  return user;
}

/* ───────────── CONSENT ───────────── */
export async function recordConsent(db: PrismaClient, userId: string, kind: string, payload?: object, ip?: string) {
  return db.consent.create({
    data: { userId, kind, payload: payload ? JSON.stringify(payload) : null, ipAddress: ip },
  });
}

/* ───────────── CREDIT CHECK ───────────── */
export async function runCreditCheck(db: PrismaClient, userId: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  // Consent is mandatory before a bureau pull (RBI DLG).
  const consent = await db.consent.findFirst({ where: { userId, kind: "cibil_pull" } });
  if (!consent) throw new DomainError("Credit-pull consent required first", "NO_CONSENT");

  const { score, raw } = await bureau.pull(user.phone);
  const { band, limit } = limitFromScore(score);

  await db.creditCheck.create({
    data: { userId, score, band, assignedLimit: limit, raw: JSON.stringify(raw) },
  });
  if (user.limit !== limit) {
    await db.limitHistory.create({ data: { userId, oldLimit: user.limit, newLimit: limit, reason: "credit_check" } });
  }
  await db.user.update({ where: { id: userId }, data: { creditScore: score, limit } });
  return { score, band, limit, eligible: score >= CIBIL_MIN_TO_BORROW };
}

/* ───────────── KYC ───────────── */
export async function submitKycStep(
  db: PrismaClient, userId: string,
  step: "pan" | "aadhaar" | "selfie" | "bank", payload: Record<string, string>,
) {
  const result = await kycVendor.verify(step, payload);
  if (!result.ok) throw new DomainError(`${step} verification failed`, "KYC_FAILED");

  await db.kycRecord.upsert({
    where: { userId_step: { userId, step } },
    update: { status: "verified", reference: result.reference, meta: JSON.stringify({ masked: result.masked }) },
    create: { userId, step, status: "verified", reference: result.reference, meta: JSON.stringify({ masked: result.masked }) },
  });

  const records = await db.kycRecord.findMany({ where: { userId, status: "verified" } });
  const steps = new Set(records.map((r) => r.step));
  const complete = ["pan", "aadhaar", "selfie", "bank"].every((s) => steps.has(s));
  if (complete) await db.user.update({ where: { id: userId }, data: { kycComplete: true } });
  return { step, verified: true, kycComplete: complete, completedSteps: [...steps] };
}

/* ───────────── LOANS ───────────── */
export async function createLoan(db: PrismaClient, userId: string, principal: number, ip?: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.kycComplete) throw new DomainError("Complete KYC before borrowing", "KYC_INCOMPLETE");
  if ((user.creditScore ?? 0) < CIBIL_MIN_TO_BORROW) throw new DomainError("Credit check required / score too low", "NOT_ELIGIBLE");
  if (principal > user.limit) throw new DomainError(`Amount exceeds your limit of ₹${user.limit}`, "OVER_LIMIT");

  const active = await db.loan.findFirst({ where: { userId, status: { in: ["active", "overdue"] } } });
  if (active) throw new DomainError("You already have an open loan. Repay it first.", "OPEN_LOAN");

  const q = quote(principal);

  // Record the KFS acceptance (auditable) and originate with the NBFC.
  await recordConsent(db, userId, "kfs_accept", q, ip);
  const dueAt = new Date(Date.now() + TENURE_DAYS * 24 * 60 * 60 * 1000);
  const lender = await nbfc.originate({ userId, principal: q.principal, netDisbursed: q.netDisbursed, repayAmount: q.repayAmount, dueAt });
  if (lender.status !== "disbursed") throw new DomainError("Lender declined the loan", "LENDER_DECLINED");

  const loan = await db.loan.create({
    data: {
      userId, principal: q.principal, interest: q.interest, processingFee: q.processingFee,
      netDisbursed: q.netDisbursed, repayAmount: q.repayAmount, dueAt, lenderRef: lender.lenderRef,
    },
  });
  await db.transaction.create({
    data: { userId, loanId: loan.id, type: "disbursal", amount: q.netDisbursed, note: `Advance · net of ₹${q.totalCost} fees` },
  });
  return { loan, quote: q };
}

export async function getOutstanding(db: PrismaClient, userId: string, now = new Date()) {
  const loan = await db.loan.findFirst({ where: { userId, status: { in: ["active", "overdue"] } }, orderBy: { disbursedAt: "desc" } });
  if (!loan) return null;
  return {
    loan,
    lateFee: lateFee(loan.dueAt, now),
    owed: amountOwed(loan.repayAmount, loan.dueAt, now),
    overdue: now > loan.dueAt,
  };
}

export async function repayLoan(db: PrismaClient, userId: string, method: "upi" | "auto_debit" | "qr", now = new Date()) {
  const loan = await db.loan.findFirst({ where: { userId, status: { in: ["active", "overdue"] } } });
  if (!loan) throw new DomainError("No open loan to repay", "NO_LOAN");

  const fee = lateFee(loan.dueAt, now);
  const owed = amountOwed(loan.repayAmount, loan.dueAt, now);
  const onTime = fee === 0;

  // Collect via UPI adapter (mock confirms instantly).
  const intent = await upi.createCollect(owed * 100, `Kasko loan ${loan.id}`);
  await nbfc.recordRepayment(loan.lenderRef ?? "", owed);

  await db.repayment.create({ data: { loanId: loan.id, amount: owed, method, status: "success", upiRef: intent.ref } });
  if (fee > 0) {
    await db.transaction.create({ data: { userId, loanId: loan.id, type: "late_fee", amount: -fee, note: `Late fee (${fee / 50} day(s))` } });
  }
  await db.transaction.create({ data: { userId, loanId: loan.id, type: "repayment", amount: -owed, note: `Repayment via ${method}` } });
  await db.loan.update({ where: { id: loan.id }, data: { status: "repaid", closedAt: now, lateFeeCharged: fee } });

  // Reward on-time repayment with a limit bump (cap at MAX).
  if (onTime) {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    const newLimit = Math.min(user.limit + ON_TIME_LIMIT_BUMP, 1000);
    if (newLimit !== user.limit) {
      await db.limitHistory.create({ data: { userId, oldLimit: user.limit, newLimit, reason: "on_time_repayment" } });
      await db.user.update({ where: { id: userId }, data: { limit: newLimit } });
    }
  }
  return { paid: owed, lateFee: fee, onTime };
}

export async function listTransactions(db: PrismaClient, userId: string) {
  return db.transaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}
