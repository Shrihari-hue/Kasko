"use client";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar, BottomNav } from "@/components/Bits";
import { Search, MessageCircle, Phone, Mail, HelpCircle, ChevronRight } from "lucide-react";

const TOPICS = [
  "How does Kasko make money?",
  "What happens if I miss the due date?",
  "Why do you check my CIBIL score?",
  "When will my limit increase?",
  "How do I close my account?",
  "Is my data safe?",
];

export default function HelpPage() {
  return (
    <Shell>
      <PhoneFrame>
        <div className="pb-32">
          <TopBar title="Help & support" />
          <div className="px-5">
            <div className="relative">
              <input className="field pl-11" placeholder="Search how-to articles…" />
              <Search size={18} className="absolute left-4 top-[18px] text-ink4" />
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <ContactCard Icon={MessageCircle} label="Chat"  sub="2 min wait" />
              <ContactCard Icon={Phone}         label="Call"  sub="10am–7pm" />
              <ContactCard Icon={Mail}          label="Email" sub="< 24 hrs" />
            </div>

            <p className="eyebrow mt-7 mb-3 px-1">Popular questions</p>
            <div className="card divide-y divide-line2">
              {TOPICS.map((t) => (
                <button key={t} className="w-full p-4 flex items-center gap-3 text-left active:bg-paperWarm transition">
                  <HelpCircle size={18} className="text-ink3 flex-shrink-0" />
                  <span className="flex-1 text-[14px] font-medium tracking-tight">{t}</span>
                  <ChevronRight size={18} className="text-ink4" />
                </button>
              ))}
            </div>

            <div className="card p-5 mt-5">
              <p className="eyebrow mb-2">Grievance redressal</p>
              <p className="text-[13px] text-ink2 leading-relaxed">
                <span className="font-semibold">Anjali Sharma</span>, Nodal Officer<br />
                grievance@kasko.in · 1800-XXX-XXXX
              </p>
              <p className="text-[11px] text-ink3 mt-3 leading-relaxed">
                If unresolved within 30 days, you may escalate to the RBI Integrated Ombudsman at <u>cms.rbi.org.in</u>.
              </p>
            </div>
          </div>
        </div>
        <BottomNav />
      </PhoneFrame>
    </Shell>
  );
}
function ContactCard({ Icon, label, sub }: any) {
  return (
    <button className="card-flat p-4 flex flex-col items-center gap-2 active:scale-95 transition">
      <div className="w-10 h-10 rounded-xl bg-ink text-paper flex items-center justify-center"><Icon size={18} /></div>
      <span className="text-[13px] font-semibold">{label}</span>
      <span className="text-[10px] text-ink3">{sub}</span>
    </button>
  );
}
