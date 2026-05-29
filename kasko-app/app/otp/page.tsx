"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/Bits";
import { Info } from "lucide-react";

export default function OtpPage() {
  const router = useRouter();
  const { phone, devOtp, verifyOtp, error } = useApp();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [checking, setChecking] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const filled = digits.every((d) => d !== "");
  useEffect(() => {
    if (filled && !checking) {
      setChecking(true);
      verifyOtp(digits.join(""))
        .then(() => router.push("/consent"))
        .catch(() => { setChecking(false); setDigits(["", "", "", "", "", ""]); refs.current[0]?.focus(); });
    }
  }, [filled]); // eslint-disable-line

  const update = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && refs.current[i + 1]) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && refs.current[i - 1]) refs.current[i - 1]?.focus();
  };

  const masked = phone ? `+91 ${phone.slice(0, 2)}··· ··${phone.slice(-2)}` : "+91 ··· ··· ··10";

  return (
    <Shell>
      <PhoneFrame>
        <TopBar backHref="/login" title="" />
        <div className="px-6 anim-in">
          <p className="eyebrow mb-3">Step 2 of 2</p>
          <h1 className="font-display text-[30px] leading-[1.1] tracking-tighter">Enter the 6-digit code we sent to {masked}</h1>
          <div className="mt-10 flex justify-between gap-2">
            {digits.map((d, i) => (
              <input key={i}
                ref={(el) => { refs.current[i] = el; }}
                className="otp-box" inputMode="numeric" maxLength={1}
                value={d} onChange={(e) => update(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <p className="text-rust text-[13px] mt-4 text-center">{error}</p>}
          <div className="mt-8 text-center text-sm text-ink3">
            {timer > 0
              ? <>Resend code in <span className="font-semibold text-ink num">{timer}s</span></>
              : <button className="underline font-semibold text-ink" onClick={() => setTimer(45)}>Resend code</button>}
          </div>
          {devOtp && (
            <div className="mt-10 px-5 py-4 rounded-2xl bg-paperWarm flex items-start gap-3">
              <Info size={16} className="mt-0.5 flex-shrink-0 text-ink2" />
              <p className="text-[12px] text-ink2 leading-relaxed">
                Dev mode: your code is <span className="font-mono font-semibold bg-white px-1.5 py-0.5 rounded">{devOtp}</span>. In production this is sent over SMS only.
              </p>
            </div>
          )}
        </div>
      </PhoneFrame>
    </Shell>
  );
}
