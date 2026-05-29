"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { tomorrow } from "@/lib/format";
import { Info, Check } from "lucide-react";

export default function DisbursedPage() {
  const { lastDisbursed, outstanding } = useApp();
  const sent = lastDisbursed ?? 900;
  const due = outstanding?.owed ?? sent + 100;
  return (
    <Shell>
      <PhoneFrame>
        <div className="h-full flex flex-col px-6 pt-10 pb-8 anim-in">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-mint flex items-center justify-center pop-in">
              <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#1B5E3F" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline className="check-path" points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-display text-[36px] tracking-tighter mt-7 leading-none">All set.</h1>
            <p className="text-ink3 mt-3 text-[15px] leading-relaxed max-w-[280px]">
              ₹{sent.toLocaleString("en-IN")} is on its way to your HDFC account ····3456. Usually under 2 minutes.
            </p>
          </div>
          <div className="card p-5 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Repay by</p>
                <p className="font-display text-[24px] tracking-tighter mt-1">{tomorrow()}</p>
                <p className="text-[12px] text-ink3 num">11:59 PM</p>
              </div>
              <div className="text-right">
                <p className="eyebrow">Amount due</p>
                <p className="font-display text-[24px] tracking-tighter mt-1 num">₹{due.toLocaleString("en-IN")}</p>
                <p className="text-[12px] text-ink3">1-day tenure</p>
              </div>
            </div>
            <div className="divider my-4" />
            <div className="flex items-start gap-2.5 text-[12px] text-ink2">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p>We'll send a reminder at 6 PM tomorrow. Pay any time before the deadline to keep your credit healthy.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Link href="/repay" className="btn btn-soft w-full">Set up auto-debit</Link>
            <Link href="/dashboard" className="btn btn-primary w-full">Done <Check size={16} /></Link>
          </div>
        </div>
      </PhoneFrame>
    </Shell>
  );
}
