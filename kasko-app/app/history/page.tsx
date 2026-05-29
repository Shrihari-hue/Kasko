"use client";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Txn } from "@/lib/api-client";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar, BottomNav } from "@/components/Bits";
import { Search, ArrowDown, ArrowUp } from "lucide-react";

export default function HistoryPage() {
  const { transactions } = useApp();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [tab, setTab] = useState<"all" | "in" | "out">("all");

  useEffect(() => { transactions().then(setTxns).catch(() => {}); }, []); // eslint-disable-line

  const totals = useMemo(() => {
    let borrowed = 0, repaid = 0;
    for (const t of txns) {
      if (t.type === "disbursal") borrowed += t.amount;
      if (t.type === "repayment") repaid += Math.abs(t.amount);
    }
    return { borrowed, repaid };
  }, [txns]);

  const filtered = txns.filter((t) =>
    tab === "all" ? true : tab === "in" ? t.amount > 0 : t.amount < 0
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Shell>
      <PhoneFrame>
        <div className="pb-32">
          <TopBar title="Activity" right={<button className="w-10 h-10 rounded-full bg-paperWarm flex items-center justify-center"><Search size={16} /></button>} />

          <div className="px-5 grid grid-cols-3 gap-2">
            <Stat label="Borrowed" value={`₹${totals.borrowed.toLocaleString("en-IN")}`} />
            <Stat label="Repaid"   value={`₹${totals.repaid.toLocaleString("en-IN")}`} />
            <Stat label="Outstanding" value="₹0" tone="rust" />
          </div>

          <div className="px-5 mt-5 flex gap-2">
            {(["all", "in", "out"] as const).map((k) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-full text-[12px] font-semibold transition ${tab === k ? "bg-ink text-paper" : "bg-paperWarm text-ink2"}`}>
                {k === "all" ? "All" : k === "in" ? "Advances" : "Repayments"}
              </button>
            ))}
          </div>

          <div className="px-5 mt-4 space-y-2">
            {filtered.length === 0 && (
              <div className="card p-6 text-center text-ink3 text-[13px]">No transactions yet. Borrow once to see activity here.</div>
            )}
            {filtered.map((t) => {
              const isIn = t.amount > 0;
              const isLate = t.type === "late_fee";
              const Icon = isIn ? ArrowDown : ArrowUp;
              const label = t.type === "disbursal" ? "Cash advance" : t.type === "late_fee" ? "Late fee" : "Repayment";
              return (
                <div key={t.id} className="card p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isIn ? "bg-mint" : isLate ? "bg-rustSoft" : "bg-amberSoft"}`}>
                    <Icon size={16} className={isIn ? "text-forest" : isLate ? "text-rust" : "text-amber"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[14px]">{label}</p>
                    <p className="text-[11px] text-ink3">{fmtDate(t.createdAt)}{t.note ? ` · ${t.note}` : ""}</p>
                  </div>
                  <p className={`font-semibold num text-[14px] ${isIn ? "text-forest" : isLate ? "text-rust" : "text-ink2"}`}>
                    {isIn ? "+" : "−"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <BottomNav />
      </PhoneFrame>
    </Shell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "rust" }) {
  const bg = tone === "rust" ? "bg-rustSoft border-[#F1D4CD]" : "";
  const c = tone === "rust" ? "text-[#8B3324]" : "";
  return (
    <div className={`card-flat p-3 ${bg}`}>
      <p className={`eyebrow text-[10px] ${c}`}>{label}</p>
      <p className={`font-display text-[20px] num tracking-tighter mt-1 ${c}`}>{value}</p>
    </div>
  );
}
