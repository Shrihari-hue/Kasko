"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Check } from "lucide-react";

export default function RepaidPage() {
  const { lastRepay, limit } = useApp();
  const paid = lastRepay?.paid ?? 1000;
  return (
    <Shell>
      <PhoneFrame>
        <div className="h-full flex flex-col px-6 pt-10 pb-8 anim-in">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-forest flex items-center justify-center pop-in">
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#FAFAF7" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline className="check-path" points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-display text-[36px] tracking-tighter mt-7 leading-none">Paid in full.</h1>
            <p className="text-ink3 mt-3 text-[15px] leading-relaxed max-w-[280px]">Thank you. Your repayment of ₹{paid.toLocaleString("en-IN")} has been received and your account is clear.</p>
          </div>
          <div className="rounded-3xl p-6 mt-2 text-center" style={{ background: "linear-gradient(165deg, #1B5E3F, #0E4329)" }}>
            <p className="text-paper/60 eyebrow">New borrowing limit</p>
            <p className="font-display text-paper text-[44px] tracking-tighter mt-1 num">₹{(limit || 1500).toLocaleString("en-IN")}</p>
            <p className="text-paper/70 text-[12px] mt-1">Unlocked for repaying on time. Keep your streak going.</p>
          </div>
          <div className="mt-4 space-y-2">
            <Link href="/borrow" className="btn btn-soft w-full">Borrow again</Link>
            <Link href="/dashboard" className="btn btn-primary w-full">Done <Check size={16} /></Link>
          </div>
        </div>
      </PhoneFrame>
    </Shell>
  );
}
