/**
 * Single source of truth for Kasko's lending math.
 * Product spec (flagship ₹1,000 product):
 *   - Borrow up to ₹1,000, 1-day tenure
 *   - Flat ₹50 interest + ₹50 processing fee, deducted upfront
 *   - Net disbursed = principal − 100; repay = principal
 *   - Late fee ₹50/day after due date, capped at ₹500 (10 days)
 *
 * NOTE: flat fees only make sense at/near the ₹1,000 ticket. We enforce a
 * minimum principal so net disbursal is never ≤ 0. Sub-₹1,000 pricing is a
 * product + NBFC decision — change `quote()` when that's settled.
 */

export const FLAT_INTEREST = 50;
export const FLAT_PROCESSING = 50;
export const MAX_PRINCIPAL = 1000;
export const MIN_PRINCIPAL = 200; // net ≥ ₹100
export const TENURE_DAYS = 1;
export const LATE_FEE_PER_DAY = 50;
export const LATE_FEE_CAP = 500;
export const CIBIL_MIN_TO_BORROW = 600;
export const ON_TIME_LIMIT_BUMP = 500; // limit increase for an on-time repayment

export interface Quote {
  principal: number;
  interest: number;
  processingFee: number;
  totalCost: number;
  netDisbursed: number;
  repayAmount: number;
  tenureDays: number;
  aprAnnualPct: number; // for the Key Facts Statement
}

export function quote(principal: number): Quote {
  if (!Number.isInteger(principal)) throw new Error("principal must be an integer (paise-free rupees)");
  if (principal < MIN_PRINCIPAL || principal > MAX_PRINCIPAL) {
    throw new Error(`principal must be between ₹${MIN_PRINCIPAL} and ₹${MAX_PRINCIPAL}`);
  }
  const interest = FLAT_INTEREST;
  const processingFee = FLAT_PROCESSING;
  const totalCost = interest + processingFee;
  const netDisbursed = principal - totalCost;
  const repayAmount = principal;
  // APR = (cost / netDisbursed) over tenure, annualized. Disclosed in the KFS.
  const dailyRate = totalCost / netDisbursed / TENURE_DAYS;
  const aprAnnualPct = Math.round(dailyRate * 365 * 100);
  return { principal, interest, processingFee, totalCost, netDisbursed, repayAmount, tenureDays: TENURE_DAYS, aprAnnualPct };
}

/** Whole days a loan is past due, given "now". 0 if not yet due. */
export function daysLate(dueAt: Date, now: Date = new Date()): number {
  const ms = now.getTime() - dueAt.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

/** Late fee accrued so far, capped. */
export function lateFee(dueAt: Date, now: Date = new Date()): number {
  return Math.min(daysLate(dueAt, now) * LATE_FEE_PER_DAY, LATE_FEE_CAP);
}

/** Total currently owed on an active loan (principal + accrued late fee). */
export function amountOwed(repayAmount: number, dueAt: Date, now: Date = new Date()): number {
  return repayAmount + lateFee(dueAt, now);
}

/** Map a CIBIL score to a band + sanctioned limit. */
export function limitFromScore(score: number): { band: string; limit: number } {
  if (score < CIBIL_MIN_TO_BORROW) return { band: "thin", limit: 0 };
  if (score < 700) return { band: "fair", limit: 500 };
  if (score < 760) return { band: "good", limit: 1000 };
  return { band: "excellent", limit: 1000 };
}
