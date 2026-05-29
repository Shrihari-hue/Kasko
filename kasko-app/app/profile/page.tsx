"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
// (Link no longer needed — sign-out is a button)
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TopBar, BottomNav } from "@/components/Bits";
import { Check, Phone, Mail, Landmark, FileText, Contact, Camera, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { phone, limit, creditScore, refresh, logout } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []); // eslint-disable-line
  const phoneDisplay = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "+91 98765 43210";
  const stats: [string, string][] = [
    ["Limit", `₹${(limit || 0).toLocaleString("en-IN")}`],
    ["CIBIL", creditScore ? String(creditScore) : "—"],
    ["Streak", "7 days"],
  ];
  async function signOut() { try { await logout(); } finally { router.push("/"); } }
  return (
    <Shell>
      <PhoneFrame>
        <div className="pb-32">
          <TopBar title="Profile" />
          <div className="px-5">
            <div className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-ink text-paper flex items-center justify-center font-display text-[24px] font-medium">S</div>
                <div className="flex-1">
                  <p className="font-semibold text-[17px] tracking-tight">Shree</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Check size={12} className="text-forest" />
                    <span className="text-[11px] font-semibold text-forest uppercase tracking-wider">Verified</span>
                  </div>
                </div>
              </div>
              <div className="divider my-4" />
              <div className="grid grid-cols-3 text-center divide-x divide-line">
                {stats.map(([l,v]) => (
                  <div key={l} className="px-1">
                    <p className="eyebrow text-[9px]">{l}</p>
                    <p className="font-display text-[18px] num tracking-tighter mt-1">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <Section title="Account">
              <Row Icon={Phone}    label="Mobile number" value={phoneDisplay} />
              <Row Icon={Mail}     label="Email"         value="shri@gmail.com" />
              <Row Icon={Landmark} label="HDFC Bank"     value="····3456" verified />
            </Section>

            <Section title="Documents">
              <Row Icon={FileText} label="PAN"     value="ABCDE····1F" verified />
              <Row Icon={Contact}   label="Aadhaar" value="····5678" verified />
              <Row Icon={Camera}   label="Selfie"  value="Verified" verified />
            </Section>

            <button onClick={signOut} className="w-full mt-4 p-4 rounded-2xl bg-paperWarm flex items-center justify-center gap-2 text-rust font-semibold text-[14px]">
              <LogOut size={16} /> Sign out
            </button>

            <p className="text-[10px] text-ink4 text-center mt-6 leading-relaxed">
              Kasko Technologies Pvt Ltd<br />
              Lender: Northern Arc Finance · NBFC-D-13.01234<br />
              App v1.0.0
            </p>
          </div>
        </div>
        <BottomNav />
      </PhoneFrame>
    </Shell>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="eyebrow mb-2 px-1">{title}</p>
      <div className="card divide-y divide-line2">{children}</div>
    </div>
  );
}
function Row({ Icon, label, value, verified }: any) {
  return (
    <div className="p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-paperWarm flex items-center justify-center flex-shrink-0"><Icon size={18} /></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px]">{label}</p>
        <p className="text-[12px] text-ink3 truncate">{value}</p>
      </div>
      {verified && (
        <div className="px-2 py-0.5 rounded-full bg-mint flex items-center gap-1">
          <Check size={10} className="text-forest" />
          <span className="text-[10px] font-semibold text-forest">Verified</span>
        </div>
      )}
    </div>
  );
}
