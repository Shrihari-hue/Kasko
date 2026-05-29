"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/Bits";
import { Clock, Phone, QrCode, Check, Copy, AlertTriangle } from "lucide-react";

export default function RepayPage() {
  const router = useRouter();
  const { outstanding, repay, refresh, busy } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []); // eslint-disable-line
  const due = outstanding?.owed ?? 1000;
  const [method, setMethod] = useState<"upi" | "qr">("upi");
  const [showSkip, setShowSkip] = useState(false);

  async function pay() {
    if (busy) return;
    try { await repay(method === "qr" ? "qr" : "upi"); router.push("/repaid"); }
    catch (e) { alert((e as Error).message); }
  }

  return (
    <Shell>
      <PhoneFrame>
        <TopBar title="Repay" backHref="/dashboard" />
        <div className="px-6 anim-in pb-6">
          <div className="card p-5" style={{ background: "linear-gradient(170deg, #FBF1DC 0%, #F5EBDA 100%)", borderColor: "#EFDFC0" }}>
            <p className="eyebrow" style={{ color: "#8B6A3A" }}>Amount due</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display text-[28px] text-ink3">₹</span>
              <span className="font-display text-[56px] leading-none tracking-tighter num">{due.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-ink2">
              <Clock size={14} />
              <p className="text-[12px] font-medium">Due in <span className="font-semibold num">14 hours</span> · before midnight</p>
            </div>
          </div>

          <p className="eyebrow mt-7 mb-3">Choose how to pay</p>
          <Method id="upi" current={method} setCurrent={setMethod} Icon={Phone} title="UPI — open in app" sub="GPay · PhonePe · Paytm · BHIM" />
          <div className="mt-2">
            <Method id="qr" current={method} setCurrent={setMethod} Icon={QrCode} title="Scan QR" sub="Show this in any UPI app" />
          </div>

          {method === "upi" && (
            <div className="mt-4 grid grid-cols-4 gap-2 anim-in">
              {["GPay","PhonePe","Paytm","BHIM"].map((app) => (
                <button key={app} onClick={pay} className="card-flat py-3 flex flex-col items-center gap-1.5 active:scale-95 transition">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-paper"
                    style={{ background: app === "GPay" ? "#4285F4" : app === "PhonePe" ? "#5F259F" : app === "Paytm" ? "#00BAF2" : "#00A0DC" }}>
                    {app[0]}
                  </div>
                  <span className="text-[10px] font-semibold">{app}</span>
                </button>
              ))}
            </div>
          )}

          {method === "qr" && (
            <div className="mt-4 card p-6 flex flex-col items-center anim-in">
              <div className="w-44 h-44 bg-paperWarm rounded-2xl flex items-center justify-center">
                <QrCode size={120} />
              </div>
              <p className="text-[12px] text-ink3 mt-3">Scan with any UPI app</p>
            </div>
          )}

          <div className="card-flat mt-4 p-4 flex items-center justify-between">
            <div>
              <p className="eyebrow text-[10px]">UPI ID</p>
              <p className="text-[14px] font-mono mt-1">kasko.repay@hdfcbank</p>
            </div>
            <button className="w-9 h-9 rounded-full bg-paperWarm flex items-center justify-center"><Copy size={16} /></button>
          </div>

          <button onClick={pay} className="btn btn-forest w-full mt-6">Pay ₹{due.toLocaleString("en-IN")} now</button>
          <button onClick={() => setShowSkip(true)} className="btn btn-ghost w-full mt-1 text-ink3 text-[13px]">I'll pay later</button>
        </div>

        {showSkip && (
          <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(15,20,25,.45)", backdropFilter: "blur(4px)" }} onClick={() => setShowSkip(false)}>
            <div className="bg-paper w-full rounded-t-[28px] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-1 rounded-full bg-line mx-auto mb-4" />
              <div className="w-14 h-14 rounded-2xl bg-rustSoft flex items-center justify-center">
                <AlertTriangle size={24} className="text-rust" />
              </div>
              <h2 className="font-display text-[24px] tracking-tighter mt-4">Are you sure?</h2>
              <p className="text-ink2 text-[14px] leading-relaxed mt-2">If you miss the midnight deadline:</p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-ink2">
                <li>• <span className="font-semibold">₹50/day</span> late fee, up to ₹500</li>
                <li>• You'll lose your <span className="font-semibold">on-time streak</span> (currently 7 days)</li>
                <li>• Your limit stays at ₹1,000 instead of moving to ₹1,500</li>
              </ul>
              <div className="space-y-2 mt-6">
                <button onClick={() => setShowSkip(false)} className="btn btn-forest w-full">Take me back to pay</button>
                <button onClick={() => { setShowSkip(false); router.push("/dashboard"); }} className="btn btn-ghost w-full text-ink3 text-[13px]">I understand the risk, remind me later</button>
              </div>
            </div>
          </div>
        )}
      </PhoneFrame>
    </Shell>
  );
}

function Method({ id, current, setCurrent, Icon, title, sub }: any) {
  const selected = current === id;
  return (
    <button onClick={() => setCurrent(id)}
      className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 transition border ${selected ? "bg-ink text-paper border-ink" : "bg-surface border-line"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-paper/15" : "bg-paperWarm"}`}>
        <Icon size={18} className={selected ? "text-paper" : "text-ink"} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[14px]">{title}</p>
        <p className={`text-[11px] ${selected ? "text-paper/60" : "text-ink3"}`}>{sub}</p>
      </div>
      {selected && <Check size={18} className="text-paper" />}
    </button>
  );
}
