"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/Bits";
import { tomorrow } from "@/lib/format";
import { ArrowRight, AlertTriangle, X, Check } from "lucide-react";

const INTEREST = 50;
const PROCESSING = 50;

export default function BorrowPage() {
  const router = useRouter();
  const { borrow, refresh } = useApp();
  const [amount, setAmount] = useState(1000);
  const [showKfs, setShowKfs] = useState(false);
  const youGet = Math.max(0, amount - INTEREST - PROCESSING);

  useEffect(() => { refresh().catch(() => {}); }, []); // eslint-disable-line

  async function confirm() {
    try { await borrow(amount); setShowKfs(false); router.push("/disbursed"); }
    catch (e) { alert((e as Error).message); }
  }

  return (
    <Shell>
      <PhoneFrame>
        <TopBar title="New advance" backHref="/dashboard" />
        <div className="px-6 pb-8 anim-in">
          <p className="eyebrow">How much do you need?</p>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-[36px] text-ink3">₹</span>
            <span className="font-display num text-[88px] leading-none tracking-tighter">{amount.toLocaleString("en-IN")}</span>
          </div>
          <p className="text-ink3 text-[13px] mt-1">Max ₹1,000 · 1-day tenure</p>

          <div className="mt-7">
            <input type="range" min={100} max={1000} step={50}
              value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="kasko-slider" />
            <div className="flex justify-between mt-2 num text-[11px] text-ink3">
              <span>₹100</span><span>₹1,000</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[200, 500, 750, 1000].map((p) => (
              <button key={p}
                onClick={() => setAmount(p)}
                className={`py-2 rounded-xl text-[12px] font-semibold transition border
                  ${amount === p ? "bg-ink text-paper border-ink" : "bg-paperWarm border-transparent text-ink2"}`}>
                ₹{p}
              </button>
            ))}
          </div>

          <div className="card mt-6 p-5">
            <p className="eyebrow mb-4">Cost breakdown</p>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[12px] text-ink3">You'll receive</p>
                <p className="font-display text-[36px] num tracking-tighter leading-tight">₹{youGet.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-ink3">Repay tomorrow</p>
                <p className="font-semibold num text-[20px] tracking-tight">₹{amount.toLocaleString("en-IN")}</p>
              </div>
            </div>
            <div className="divider my-4" />
            <div className="space-y-2 text-[13px]">
              <Line label="Interest"       value={`₹${INTEREST}`} />
              <Line label="Processing fee" value={`₹${PROCESSING}`} />
              <Line label="Total cost"     value={`₹${INTEREST + PROCESSING}`} strong />
            </div>
            <div className="mt-4 px-3 py-2.5 rounded-xl flex items-center gap-2 bg-rustSoft">
              <AlertTriangle size={14} className="text-rust flex-shrink-0" />
              <p className="text-[11px] text-ink2 leading-snug">Late fee: <span className="font-semibold">₹50/day</span> after due date, capped at ₹500.</p>
            </div>
          </div>

          <button onClick={() => setShowKfs(true)} className="btn btn-primary w-full mt-6">
            Review terms & confirm <ArrowRight size={18} />
          </button>
          <p className="text-[11px] text-ink3 text-center mt-4 leading-relaxed">
            Lender: <span className="font-semibold">Northern Arc Finance</span> (RBI-registered NBFC)<br />
            Kasko is a Lending Service Provider.
          </p>
        </div>

        {showKfs && (
          <Kfs amount={amount} youGet={youGet} onAccept={confirm} onClose={() => setShowKfs(false)} />
        )}
      </PhoneFrame>
    </Shell>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-ink" : "text-ink2"}`}>
      <span className={strong ? "font-semibold" : ""}>{label}</span>
      <span className={`num ${strong ? "font-semibold" : ""}`}>{value}</span>
    </div>
  );
}

function Kfs({ amount, youGet, onAccept, onClose }: { amount: number; youGet: number; onAccept: () => void; onClose: () => void }) {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const aprAnnual = Math.round(((100 / Math.max(1, youGet)) * 100) * 365);
  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(15,20,25,.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-paper w-full rounded-t-[28px] max-h-[85%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-paper pt-3 pb-2 px-6 z-10">
          <div className="w-12 h-1 rounded-full bg-line mx-auto" />
          <div className="flex items-center justify-between mt-3">
            <h2 className="font-display text-[22px] tracking-tighter">Key Facts Statement</h2>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-paperWarm flex items-center justify-center"><X size={20} /></button>
          </div>
          <p className="text-[11px] text-ink3 mt-1">As required by RBI Digital Lending Guidelines, 2022</p>
        </div>
        <div className="px-6 pb-6">
          <div className="card p-5 mt-4">
            <Row label="Loan amount (sanctioned)" value={`₹${amount.toLocaleString("en-IN")}`} />
            <Row label="Net amount to your bank"  value={`₹${youGet.toLocaleString("en-IN")}`} strong />
            <Row label="Tenure"                   value="1 day" />
            <Row label="Repayment date"           value={tomorrow()} />
            <Row label="Interest"                 value={`₹${INTEREST}`} />
            <Row label="Processing fee"           value={`₹${PROCESSING}`} />
            <Row label="Total interest & charges" value="₹100" strong />
          </div>
          <div className="card p-5 mt-3 bg-paperWarm border-line2">
            <p className="eyebrow text-rust">Annualized cost of credit</p>
            <p className="font-display text-[32px] tracking-tighter mt-1 num">{aprAnnual}% APR</p>
            <p className="text-[12px] text-ink3 leading-relaxed mt-2">
              Short-tenure advances have a high annualized rate because the principal turns over quickly. The actual amount you pay above what you receive is ₹100.
            </p>
          </div>
          <div className="card p-5 mt-3">
            <p className="eyebrow mb-3">Late payment</p>
            <ul className="space-y-2 text-[13px] text-ink2 leading-relaxed">
              <li>• ₹50 added per day after the due date</li>
              <li>• Late fee capped at ₹500 (10 days)</li>
              <li>• After 30 days the loan is reported to CIBIL</li>
            </ul>
          </div>
          <div className="card p-5 mt-3">
            <p className="eyebrow mb-2">Grievance redressal</p>
            <p className="text-[13px] text-ink2 leading-relaxed">
              Anjali Sharma · Nodal Officer<br />
              grievance@kasko.in · 1800-XXX-XXXX<br />
              Response within 30 days. RBI Ombudsman: cms.rbi.org.in
            </p>
          </div>
          <div className="mt-5 space-y-3">
            <Consent on={a1} setOn={setA1} text="I have read and understood the Key Facts Statement including all charges and the late fee policy." />
            <Consent on={a2} setOn={setA2} text={`I authorize Northern Arc Finance to disburse ₹${youGet.toLocaleString("en-IN")} to my bank account and to debit ₹${amount.toLocaleString("en-IN")} on the due date.`} />
          </div>
          <button disabled={!(a1 && a2)} onClick={onAccept} className="btn btn-forest w-full mt-6">
            Accept &amp; receive ₹{youGet.toLocaleString("en-IN")} <ArrowRight size={18} />
          </button>
          <button onClick={onClose} className="btn btn-ghost w-full mt-1 text-ink3">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-ink3">{label}</span>
      <span className={`text-[14px] num ${strong ? "font-semibold text-ink" : "text-ink2"}`}>{value}</span>
    </div>
  );
}

function Consent({ on, setOn, text }: { on: boolean; setOn: (v: boolean) => void; text: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer" onClick={() => setOn(!on)}>
      <div className={`w-5 h-5 mt-0.5 rounded-md flex items-center justify-center ${on ? "bg-ink" : "bg-paperWarm border border-line"}`}>
        {on && <Check size={12} className="text-paper" />}
      </div>
      <span className="text-[13px] leading-relaxed text-ink2">{text}</span>
    </label>
  );
}
