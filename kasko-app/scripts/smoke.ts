/**
 * End-to-end smoke test of the Kasko backend — no HTTP, no server.
 * Exercises the real service layer + Prisma against the dev SQLite DB:
 *   signup (OTP) → consent → credit check → KYC ×4 → borrow → repay → assertions
 * Run:  npm run smoke
 */
import { PrismaClient } from "@prisma/client";
import {
  requestOtp, verifyOtp, recordConsent, runCreditCheck,
  submitKycStep, createLoan, getOutstanding, repayLoan, listTransactions,
} from "../lib/services";
import { quote } from "../lib/money";

const db = new PrismaClient();
const PHONE = "9876500000";

function assert(cond: unknown, msg: string) {
  if (!cond) { console.error("  ✗ " + msg); process.exitCode = 1; throw new Error(msg); }
  console.log("  ✓ " + msg);
}

async function main() {
  // Clean slate for this phone
  const existing = await db.user.findUnique({ where: { phone: PHONE } });
  if (existing) {
    await db.transaction.deleteMany({ where: { userId: existing.id } });
    await db.repayment.deleteMany({ where: { loan: { userId: existing.id } } });
    await db.loan.deleteMany({ where: { userId: existing.id } });
    await db.kycRecord.deleteMany({ where: { userId: existing.id } });
    await db.creditCheck.deleteMany({ where: { userId: existing.id } });
    await db.consent.deleteMany({ where: { userId: existing.id } });
    await db.limitHistory.deleteMany({ where: { userId: existing.id } });
    await db.user.delete({ where: { id: existing.id } });
  }
  await db.otpChallenge.deleteMany({ where: { phone: PHONE } });

  console.log("\n1. AUTH");
  const { devCode } = await requestOtp(db, PHONE);
  assert(devCode && /^\d{6}$/.test(devCode), `OTP issued (${devCode})`);
  const user = await verifyOtp(db, PHONE, devCode!);
  assert(user.phone === PHONE, "User created & verified");

  console.log("\n2. CONSENT + CREDIT CHECK");
  await recordConsent(db, user.id, "cibil_pull", { agreedAt: new Date().toISOString() });
  const credit = await runCreditCheck(db, user.id);
  assert(credit.score >= 600, `CIBIL pulled: ${credit.score} (${credit.band}), limit ₹${credit.limit}`);
  assert(credit.limit > 0, "Limit assigned from score");

  console.log("\n3. KYC");
  await submitKycStep(db, user.id, "pan", { pan: "ABCDE1234F" });
  await submitKycStep(db, user.id, "aadhaar", { aadhaar: "123456789012" });
  await submitKycStep(db, user.id, "selfie", {});
  const kyc = await submitKycStep(db, user.id, "bank", { account: "1234567890", ifsc: "HDFC0001234" });
  assert(kyc.kycComplete, "All 4 KYC steps verified");

  console.log("\n4. BORROW");
  // Guard: borrowing over limit must fail
  let overLimitFailed = false;
  try { await createLoan(db, user.id, 99999); } catch { overLimitFailed = true; }
  assert(overLimitFailed, "Over-limit borrow rejected");

  const principal = Math.min(1000, credit.limit);
  const q = quote(principal);
  const { loan } = await createLoan(db, user.id, principal);
  assert(loan.netDisbursed === principal - 100, `Disbursed ₹${loan.netDisbursed} (= ₹${principal} − ₹100 fees)`);
  assert(loan.repayAmount === principal, `Repay due ₹${loan.repayAmount}`);
  assert(q.aprAnnualPct > 1000, `KFS shows annualized APR ${q.aprAnnualPct}%`);

  // Guard: can't take a second loan with one open
  let secondFailed = false;
  try { await createLoan(db, user.id, 500); } catch { secondFailed = true; }
  assert(secondFailed, "Second concurrent loan rejected");

  const out = await getOutstanding(db, user.id);
  assert(out && out.owed === principal && out.lateFee === 0, `Outstanding ₹${out!.owed}, no late fee (on time)`);

  console.log("\n5. REPAY");
  const limitBefore = (await db.user.findUniqueOrThrow({ where: { id: user.id } })).limit;
  const repayRes = await repayLoan(db, user.id, "upi");
  assert(repayRes.onTime && repayRes.lateFee === 0, `Repaid ₹${repayRes.paid} on time`);
  const userAfter = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  assert(userAfter.limit >= limitBefore, `Limit after on-time repay: ₹${userAfter.limit} (was ₹${limitBefore})`);
  const cleared = await getOutstanding(db, user.id);
  assert(cleared === null, "No outstanding loan after repayment");

  console.log("\n6. LEDGER");
  const txns = await listTransactions(db, user.id);
  const disbursal = txns.find((t) => t.type === "disbursal");
  const repayment = txns.find((t) => t.type === "repayment");
  assert(disbursal?.amount === principal - 100, "Disbursal transaction recorded (+net)");
  assert(repayment?.amount === -principal, "Repayment transaction recorded (−principal)");

  console.log("\n7. LATE-FEE MATH (unit)");
  const { lateFee } = await import("../lib/money");
  const due = new Date(); due.setDate(due.getDate() - 3); // 3 days ago
  assert(lateFee(due) === 150, "3 days late = ₹150");
  const due20 = new Date(); due20.setDate(due20.getDate() - 20);
  assert(lateFee(due20) === 500, "20 days late = ₹500 (capped)");

  console.log("\n✅ ALL CHECKS PASSED\n");
}

main()
  .catch((e) => { console.error("\n❌ SMOKE TEST FAILED:", e.message); process.exitCode = 1; })
  .finally(() => db.$disconnect());
