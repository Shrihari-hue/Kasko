"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav, NotifBell } from "@/components/Bits";
import { Sparkles, ArrowRight, ArrowUp, ArrowDown, Plus, Clock, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const { limit, outstanding, refresh } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []); // eslint-disable-line
  const hasLoan = !!outstanding && outstanding.owed > 0;
  return (
    <Shell>
      <PhoneFrame>
        <div className="pb-32">
          <div className="px-6 pt-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-ink3">Good morning</p>
              <p className="font-semibold text-[18px] tracking-tight">Shree</p>
            </div>
            <NotifBell />
          </div>

          <div className="mx-5 mt-5 rounded-[28px] relative overflow-hidden anim-in"
            style={{ background: "linear-gradient(180deg, #0F1419 0%, #1A2030 100%)", padding: "28px 24px 24px" }}>
            <p className="text-paper/55 text-[11px] tracking-[0.18em] uppercase font-semibold relative">Available to borrow</p>
            <div className="flex items-baseline gap-1 mt-2 relative">
              <span className="text-paper/60 font-display text-[28px]">₹</span>
              <span className="text-paper font-display text-[60px] leading-none tracking-tighter num">{limit.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-paper/55 text-[12px] mt-1 relative">CIBIL 742 · Limit refreshed today</p>
            <Link href="/borrow" className="relative mt-7 w-full bg-paper text-ink py-4 rounded-full font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition">
              Borrow now <ArrowRight size={20} />
            </Link>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(184,145,92,.18) 0%, transparent 70%)" }} />
          </div>

          {hasLoan && (
            <Link href="/repay" className="mx-5 mt-3 card p-4 flex items-center justify-between active:scale-[0.99] transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amberSoft flex items-center justify-center">
                  <Clock size={18} className="text-amber" />
                </div>
                <div>
                  <p className="text-[12px] text-ink3">Repay before midnight</p>
                  <p className="font-semibold tracking-tight num">₹{outstanding!.owed.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-ink4" />
            </Link>
          )}

          <div className="px-5 mt-6">
            <div className="grid grid-cols-3 gap-3">
              {([["Borrow", Plus, "/borrow"], ["Repay", ArrowUp, "/repay"], ["History", Clock, "/history"]] as const).map(([label, Icon, href]) => (
                <Link key={label} href={href} className="card-flat py-4 flex flex-col items-center gap-2 active:scale-[0.97] transition">
                  <div className="w-9 h-9 rounded-xl bg-paperWarm flex items-center justify-center"><Icon size={18} /></div>
                  <span className="text-[12px] font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="px-5 mt-7">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold tracking-tight">Recent activity</h2>
              <Link href="/history" className="text-[13px] text-ink3 font-medium">See all</Link>
            </div>
            <div className="card divide-y divide-line2">
              <TxnRow type="borrow" amount={900} when="Yesterday" status="Disbursed" />
              <TxnRow type="repay"  amount={1000} when="3 days ago" status="Repaid" />
              <TxnRow type="borrow" amount={900} when="5 days ago" status="Repaid" />
            </div>
          </div>

          <div className="mx-5 mt-5 rounded-2xl px-4 py-3.5 flex items-start gap-3" style={{ background: "#F5EBDA" }}>
            <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-gold" />
            <p className="text-[12px] text-ink2 leading-relaxed">
              Repay your next loan on time and your limit moves to <span className="font-semibold">₹1,500</span>.
            </p>
          </div>
        </div>
        <BottomNav />
      </PhoneFrame>
    </Shell>
  );
}

function TxnRow({ type, amount, when, status }: { type: "borrow" | "repay"; amount: number; when: string; status: string }) {
  const isBorrow = type === "borrow";
  const Icon = isBorrow ? ArrowDown : ArrowUp;
  return (
    <div className="p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isBorrow ? "bg-mint" : "bg-amberSoft"}`}>
        <Icon size={16} className={isBorrow ? "text-forest" : "text-amber"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] tracking-tight">{isBorrow ? "Cash advance" : "Repayment"}</p>
        <p className="text-[11px] text-ink3">{when} · {status}</p>
      </div>
      <p className={`font-semibold num text-[14px] tracking-tight ${isBorrow ? "text-forest" : "text-ink2"}`}>
        {isBorrow ? "+" : "−"}₹{amount.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
