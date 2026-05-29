"use client";
/**
 * Tiny typed fetch wrapper for the browser. Every endpoint returns
 * { ok: true, data } or { ok: false, error }. Throws on error so callers
 * can try/catch. Cookies (session) are sent automatically (same-origin).
 */
async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message ?? `Request failed (${res.status})`);
  }
  return body.data as T;
}

export const api = {
  requestOtp: (phone: string) =>
    call<{ sent: boolean; devCode?: string }>("/api/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) =>
    call<{ id: string; phone: string; kycComplete: boolean; limit: number }>("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, code }) }),
  me: () => call<Me>("/api/auth/me"),
  logout: () => call("/api/auth/logout", { method: "POST" }),

  consent: (kind: string, payload?: object) =>
    call("/api/consent", { method: "POST", body: JSON.stringify({ kind, payload }) }),
  creditCheck: () =>
    call<{ score: number; band: string; limit: number; eligible: boolean }>("/api/credit-check", { method: "POST" }),

  kycStatus: () => call<{ completedSteps: string[]; kycComplete: boolean }>("/api/kyc"),
  kycSubmit: (step: string, payload: Record<string, string>) =>
    call<{ verified: boolean; kycComplete: boolean; completedSteps: string[] }>("/api/kyc", { method: "POST", body: JSON.stringify({ step, payload }) }),

  quote: (principal: number) =>
    call<{ quote: Quote }>(`/api/loans?quote=${principal}`),
  borrow: (principal: number) =>
    call<{ loanId: string; netDisbursed: number; repayAmount: number; dueAt: string }>("/api/loans", { method: "POST", body: JSON.stringify({ principal }) }),
  loans: () => call<{ loans: Loan[]; outstanding: Outstanding | null }>("/api/loans"),
  repay: (method: "upi" | "auto_debit" | "qr" = "upi") =>
    call<{ paid: number; lateFee: number; onTime: boolean }>("/api/repayments", { method: "POST", body: JSON.stringify({ method }) }),

  transactions: () => call<{ transactions: Txn[] }>("/api/transactions"),
};

/* types mirrored from the server */
export interface Me {
  id: string; phone: string; name: string | null;
  creditScore: number | null; limit: number; kycComplete: boolean;
  outstanding: Outstanding | null;
}
export interface Outstanding { owed: number; lateFee: number; overdue: boolean; dueAt?: string; }
export interface Quote {
  principal: number; interest: number; processingFee: number; totalCost: number;
  netDisbursed: number; repayAmount: number; tenureDays: number; aprAnnualPct: number;
}
export interface Loan {
  id: string; principal: number; netDisbursed: number; repayAmount: number;
  status: string; disbursedAt: string; dueAt: string;
}
export interface Txn {
  id: string; type: string; amount: number; note: string | null; createdAt: string;
}
