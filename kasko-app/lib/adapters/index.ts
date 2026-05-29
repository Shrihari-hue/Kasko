/**
 * External-partner adapters. Each has a typed interface and a Mock implementation
 * so the whole app runs end-to-end with zero credentials. Swap a mock for a real
 * client (and add its API keys to .env) when that partnership is live — nothing
 * else in the codebase needs to change.
 */

/* ============ SMS / OTP delivery ============ */
export interface SmsProvider {
  send(phone: string, message: string): Promise<{ ok: boolean; ref?: string }>;
}

export class MockSms implements SmsProvider {
  async send(phone: string, message: string) {
    // In dev we just log. Replace with MSG91 / Twilio / AWS SNS.
    console.log(`[MockSms] → +91${phone}: ${message}`);
    return { ok: true, ref: "mock-" + Date.now() };
  }
}

/* ============ Credit bureau (CIBIL / Experian / CRIF) ============ */
export interface BureauResult { score: number; raw: Record<string, unknown>; }
export interface BureauProvider {
  pull(phone: string, pan?: string): Promise<BureauResult>;
}

export class MockBureau implements BureauProvider {
  async pull(phone: string): Promise<BureauResult> {
    // Deterministic pseudo-score from the phone so demo runs are stable.
    const seed = phone.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const score = 640 + (seed % 160); // 640–799
    return { score, raw: { bureau: "MOCK-CIBIL", pulledAt: new Date().toISOString(), score } };
  }
}

/* ============ KYC (Karza / IDfy / Hyperverge / Signzy) ============ */
export interface KycResult { ok: boolean; reference: string; masked: string; }
export interface KycProvider {
  verify(step: "pan" | "aadhaar" | "selfie" | "bank", payload: Record<string, string>): Promise<KycResult>;
}

export class MockKyc implements KycProvider {
  async verify(step: "pan" | "aadhaar" | "selfie" | "bank", payload: Record<string, string>) {
    const mask = (v?: string) => (v ? v.slice(0, 2) + "····" + v.slice(-2) : "····");
    const masked =
      step === "pan" ? mask(payload.pan)
      : step === "aadhaar" ? "····" + (payload.aadhaar?.slice(-4) ?? "0000")
      : step === "bank" ? "····" + (payload.account?.slice(-4) ?? "0000")
      : "selfie-ok";
    return { ok: true, reference: `${step}-mock-${Date.now()}`, masked };
  }
}

/* ============ UPI / payment aggregator (Razorpay / Cashfree / PhonePe PG) ============ */
export interface UpiIntent { deeplink: string; ref: string; }
export interface PaymentProvider {
  /** Build a collect intent for the given amount; returns deeplink + our ref. */
  createCollect(amountPaise: number, note: string): Promise<UpiIntent>;
  /** Verify a webhook signature + status. Mock always succeeds. */
  verifyWebhook(payload: Record<string, unknown>): Promise<{ ok: boolean; ref: string }>;
}

export class MockUpi implements PaymentProvider {
  async createCollect(amountPaise: number, note: string) {
    const ref = "upi-" + Date.now();
    const amt = (amountPaise / 100).toFixed(2);
    const deeplink = `upi://pay?pa=kasko.repay@hdfcbank&pn=Kasko&am=${amt}&tn=${encodeURIComponent(note)}&cu=INR`;
    return { deeplink, ref };
  }
  async verifyWebhook(payload: Record<string, unknown>) {
    return { ok: true, ref: String(payload.ref ?? "upi-mock") };
  }
}

/* ============ NBFC lender (loan origination + escrow) ============ */
export interface LenderLoan { lenderRef: string; status: "disbursed" | "rejected"; }
export interface NbfcProvider {
  originate(args: { userId: string; principal: number; netDisbursed: number; repayAmount: number; dueAt: Date }): Promise<LenderLoan>;
  recordRepayment(lenderRef: string, amount: number): Promise<{ ok: boolean }>;
}

export class MockNbfc implements NbfcProvider {
  async originate(args: { userId: string; principal: number }) {
    return { lenderRef: `NBFC-${args.userId.slice(0, 6)}-${Date.now()}`, status: "disbursed" as const };
  }
  async recordRepayment() {
    return { ok: true };
  }
}

/* ============ Wiring ============ */
export const sms: SmsProvider = new MockSms();
export const bureau: BureauProvider = new MockBureau();
export const kyc: KycProvider = new MockKyc();
export const upi: PaymentProvider = new MockUpi();
export const nbfc: NbfcProvider = new MockNbfc();
