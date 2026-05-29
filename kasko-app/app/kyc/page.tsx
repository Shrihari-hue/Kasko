"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar } from "@/components/Bits";
import { FileText, Contact, Camera, Landmark, ChevronRight, Check, ArrowRight } from "lucide-react";

const STEPS = [
  { key: "pan",     title: "PAN card",      desc: "For tax identity verification.",        Icon: FileText },
  { key: "aadhaar", title: "Aadhaar e-KYC", desc: "Verify name & address via UIDAI.",      Icon: Contact },
  { key: "selfie",  title: "Selfie",        desc: "A quick live photo to match your ID.",  Icon: Camera },
  { key: "bank",    title: "Bank account",  desc: "For instant disbursement & repayment.", Icon: Landmark },
] as const;

export default function KycPage() {
  const router = useRouter();
  const { completedKyc, kycComplete, loadKyc, submitKyc, busy } = useApp();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => { loadKyc().catch(() => {}); }, []); // eslint-disable-line

  const completed = STEPS.filter((s) => completedKyc.includes(s.key)).length;

  return (
    <Shell>
      <PhoneFrame>
        <TopBar backHref="/consent" title="Verify your identity" />
        <div className="px-6 anim-in">
          <p className="eyebrow">Required by RBI</p>
          <h1 className="font-display text-[28px] mt-1 leading-[1.1] tracking-tighter">{completed === 0 ? "4 quick steps." : `${completed} of 4 done.`}</h1>
          <p className="text-ink3 mt-2 text-[14px]">Takes about 3 minutes. You can pause and resume.</p>
          <div className="mt-6 h-1.5 rounded-full bg-line2 overflow-hidden">
            <div className="h-full bg-forest transition-all" style={{ width: `${(completed / 4) * 100}%` }} />
          </div>
          <div className="mt-6 space-y-3">
            {STEPS.map((s) => {
              const isDone = completedKyc.includes(s.key);
              return (
                <button key={s.key} onClick={() => !isDone && setActive(s.key)}
                  className={`w-full text-left card p-4 flex items-center gap-4 transition active:scale-[0.99] ${isDone ? "opacity-90" : ""}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? "bg-mint" : "bg-paperWarm"}`}>
                    {isDone ? <Check size={18} className="text-forest" /> : <s.Icon size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[15px]">{s.title}</p>
                    <p className="text-[12px] text-ink3 mt-0.5">{isDone ? "Verified" : s.desc}</p>
                  </div>
                  {!isDone && <ChevronRight size={18} className="text-ink4" />}
                </button>
              );
            })}
          </div>
          <button disabled={!kycComplete} onClick={() => router.push("/dashboard")} className="btn btn-primary w-full mt-8">
            {kycComplete ? <>Open my account <ArrowRight size={18} /></> : <>Complete all 4 steps</>}
          </button>
        </div>
        {active && (
          <KycSheet
            step={active}
            busy={busy}
            onClose={() => setActive(null)}
            onComplete={async (k) => { await submitKyc(k); setActive(null); }}
          />
        )}
      </PhoneFrame>
    </Shell>
  );
}

function KycSheet({ step, busy, onClose, onComplete }: { step: string; busy: boolean; onClose: () => void; onComplete: (k: string) => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(15,20,25,.45)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-paper w-full rounded-t-[28px] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1 rounded-full bg-line mx-auto mb-4" />
        <h2 className="font-display text-[24px] leading-tight tracking-tighter capitalize">{step}</h2>
        <p className="text-[13px] text-ink3 mt-2">Demo step — the backend records a verified KYC record via the mock vendor adapter. Replace with Karza / IDfy / Hyperverge / Signzy.</p>
        <button disabled={busy} onClick={() => onComplete(step)} className="btn btn-forest w-full mt-6">
          {busy ? "Verifying…" : <>Mark verified <Check size={16} /></>}
        </button>
        <button onClick={onClose} className="btn btn-ghost w-full mt-1 text-ink3">Cancel</button>
      </div>
    </div>
  );
}
