"use client";
import { create } from "zustand";
import { api, type Outstanding, type Quote, type Txn } from "./api-client";

interface AppState {
  // session / server-synced
  phone: string;
  limit: number;
  creditScore: number | null;
  kycComplete: boolean;
  completedKyc: string[];
  outstanding: Outstanding | null;
  lastDisbursed: number | null;
  lastRepay: { paid: number; onTime: boolean } | null;
  devOtp?: string;
  busy: boolean;
  error: string | null;

  setPhone: (v: string) => void;
  clearError: () => void;
  requestOtp: () => Promise<string | undefined>;
  verifyOtp: (code: string) => Promise<void>;
  consentAndCheck: () => Promise<{ score: number; limit: number; eligible: boolean }>;
  loadKyc: () => Promise<void>;
  submitKyc: (step: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  getQuote: (principal: number) => Promise<Quote>;
  borrow: (principal: number) => Promise<void>;
  repay: (method?: "upi" | "auto_debit" | "qr") => Promise<{ onTime: boolean; paid: number }>;
  transactions: () => Promise<Txn[]>;
  logout: () => Promise<void>;
}

async function guard<T>(set: any, fn: () => Promise<T>): Promise<T> {
  set({ busy: true, error: null });
  try { return await fn(); }
  catch (e: any) { set({ error: e?.message ?? "Something went wrong" }); throw e; }
  finally { set({ busy: false }); }
}

export const useApp = create<AppState>()((set, get) => ({
  phone: "",
  limit: 0,
  creditScore: null,
  kycComplete: false,
  completedKyc: [],
  outstanding: null,
  lastDisbursed: null,
  lastRepay: null,
  busy: false,
  error: null,

  setPhone: (phone) => set({ phone }),
  clearError: () => set({ error: null }),

  requestOtp: () => guard(set, async () => {
    const r = await api.requestOtp(get().phone);
    set({ devOtp: r.devCode });
    return r.devCode;
  }),

  verifyOtp: (code) => guard(set, async () => {
    const u = await api.verifyOtp(get().phone, code);
    set({ limit: u.limit, kycComplete: u.kycComplete });
  }),

  consentAndCheck: () => guard(set, async () => {
    await api.consent("cibil_pull", { agreedAt: new Date().toISOString() });
    const res = await api.creditCheck();
    set({ creditScore: res.score, limit: res.limit });
    return res;
  }),

  loadKyc: () => guard(set, async () => {
    const r = await api.kycStatus();
    set({ completedKyc: r.completedSteps, kycComplete: r.kycComplete });
  }),

  submitKyc: (step) => guard(set, async () => {
    const r = await api.kycSubmit(step, {});
    set({ completedKyc: r.completedSteps, kycComplete: r.kycComplete });
    return r.kycComplete;
  }),

  refresh: () => guard(set, async () => {
    const me = await api.me();
    set({
      phone: me.phone, limit: me.limit, creditScore: me.creditScore,
      kycComplete: me.kycComplete, outstanding: me.outstanding,
    });
  }),

  getQuote: (principal) => guard(set, async () => (await api.quote(principal)).quote),

  borrow: (principal) => guard(set, async () => {
    const r = await api.borrow(principal);
    set({ lastDisbursed: r.netDisbursed });
    await get().refresh();
  }),

  repay: (method = "upi") => guard(set, async () => {
    const r = await api.repay(method);
    set({ lastRepay: { paid: r.paid, onTime: r.onTime } });
    await get().refresh();
    return { onTime: r.onTime, paid: r.paid };
  }),

  transactions: () => guard(set, async () => (await api.transactions()).transactions),

  logout: () => guard(set, async () => {
    await api.logout();
    set({ phone: "", limit: 0, creditScore: null, kycComplete: false, completedKyc: [], outstanding: null });
  }),
}));
