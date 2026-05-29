"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Bits";
import { ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { phone, setPhone, requestOtp, busy, error } = useApp();
  const valid = phone.replace(/\D/g, "").length === 10;

  async function submit() {
    try { await requestOtp(); router.push("/otp"); } catch {}
  }

  return (
    <Shell>
      <PhoneFrame>
        <div className="px-6 pt-2 pb-10 anim-in">
          <Logo />
          <div className="mt-14">
            <p className="eyebrow mb-3">Step 1 of 2</p>
            <h1 className="font-display text-[34px] leading-[1.05] tracking-tighter">Welcome.<br />Let&apos;s get you in.</h1>
            <p className="text-ink3 mt-3 text-[15px] leading-relaxed">We&apos;ll send a one-time code to your mobile to verify it&apos;s really you.</p>
          </div>
          <div className="mt-10">
            <label className="eyebrow">Mobile number</label>
            <div className="mt-3 flex items-stretch gap-2">
              <div className="field flex items-center justify-center w-[80px] font-semibold num">+91</div>
              <input
                type="tel" inputMode="numeric" maxLength={10}
                className="field flex-1 num tracking-tight"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          {error && <p className="text-rust text-[13px] mt-3">{error}</p>}
          <button disabled={!valid || busy} onClick={submit} className="btn btn-primary w-full mt-8">
            {busy ? "Sending…" : <>Send verification code <ArrowRight size={20} /></>}
          </button>
          <div className="mt-10 flex items-start gap-2.5 text-[12px] text-ink3 leading-relaxed">
            <Lock size={16} className="mt-0.5 flex-shrink-0" />
            <span>By continuing you agree to Kasko&apos;s <u>Terms of Service</u> and <u>Privacy Policy</u>. We never share your number.</span>
          </div>
        </div>
      </PhoneFrame>
    </Shell>
  );
}
