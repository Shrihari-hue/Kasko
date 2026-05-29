"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/Bits";
import { Shield, Check, ArrowRight } from "lucide-react";

export default function ConsentPage() {
  const router = useRouter();
  const { consentAndCheck, busy, error } = useApp();
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const can = a1 && a2 && !busy;

  async function authorize() {
    try { await consentAndCheck(); router.push("/kyc"); } catch {}
  }
  return (
    <Shell>
      <PhoneFrame>
        <TopBar backHref="/otp" title="Consent" />
        <div className="px-6 pb-6 anim-in">
          <div className="w-14 h-14 rounded-2xl bg-mint flex items-center justify-center mb-5">
            <Shield size={24} className="text-forest" />
          </div>
          <h1 className="font-display text-[28px] leading-[1.1] tracking-tighter">A quick credit check, with your permission.</h1>
          <p className="text-ink3 mt-3 text-[15px] leading-relaxed">
            Before we lend, we check your CIBIL score. This helps us offer you the right limit at the right cost.
          </p>
          <div className="card mt-6 p-5">
            <p className="eyebrow mb-3">What we'll do</p>
            <ul className="space-y-3">
              {[
                ["Fetch your CIBIL score", "From TransUnion CIBIL, India's RBI-regulated bureau."],
                ["Check your repayment history", "To set your borrowing limit and interest fairly."],
                ["Run a soft inquiry", "This does not hurt your credit score."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-forest" />
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">{t}</p>
                    <p className="text-[12px] text-ink3 leading-relaxed">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 space-y-3">
            {[
              [a1, setA1, "I authorize Kasko to fetch my CIBIL credit information for the purpose of underwriting this loan application."],
              [a2, setA2, "I confirm the mobile number, name, and details I provide belong to me and are accurate."],
            ].map(([on, set, text]: any, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl border border-line bg-surface" onClick={() => set(!on)}>
                <div className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center transition ${on ? "bg-ink" : "bg-paperWarm border border-line"}`}>
                  {on && <Check size={12} className="text-paper" />}
                </div>
                <span className="text-[13px] leading-relaxed text-ink2">{text}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-rust text-[13px] mt-4">{error}</p>}
          <button disabled={!can} onClick={authorize} className="btn btn-primary w-full mt-6">
            {busy ? "Checking your credit…" : <>Authorize & continue <ArrowRight size={18} /></>}
          </button>
        </div>
      </PhoneFrame>
    </Shell>
  );
}
