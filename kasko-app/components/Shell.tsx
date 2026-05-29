"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SCREENS: Array<[string, string]> = [
  ["/",           "Splash"],
  ["/login",      "Sign in"],
  ["/otp",        "OTP"],
  ["/consent",    "CIBIL consent"],
  ["/kyc",        "KYC"],
  ["/dashboard",  "Dashboard"],
  ["/borrow",     "Borrow"],
  ["/disbursed",  "Disbursed"],
  ["/repay",      "Repay"],
  ["/repaid",     "Repaid"],
  ["/history",    "Activity"],
  ["/profile",    "Profile"],
  ["/help",       "Help"],
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = SCREENS.find(([p]) => p === pathname)?.[1] ?? "Splash";
  return (
    <div className="min-h-screen w-full flex flex-col items-center" style={{ background: "#EDEAE3" }}>
      <div className="w-full max-w-6xl px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-ink text-paper flex items-center justify-center font-display text-[20px] font-medium">K</div>
          <div>
            <p className="font-display text-[20px] tracking-tighter leading-none">Kasko</p>
            <p className="text-[11px] text-ink3 mt-0.5">Production app · Next.js + Tailwind</p>
          </div>
        </div>
        <details className="relative">
          <summary className="list-none cursor-pointer px-4 py-2 rounded-full bg-ink text-paper text-[13px] font-semibold flex items-center gap-2">
            {current} ▾
          </summary>
          <div className="absolute right-0 mt-2 card p-3 z-50 min-w-[260px]">
            <p className="eyebrow mb-2 px-1">Jump to a screen</p>
            <div className="flex flex-wrap gap-1.5">
              {SCREENS.map(([path, name]) => (
                <Link key={path} href={path}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition
                    ${pathname === path ? "bg-ink text-paper" : "bg-paperWarm text-ink2"}`}>
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>

      <div className="py-6 px-6 w-full flex items-center justify-center flex-1">
        {children}
      </div>

      <p className="text-[10px] text-ink3 text-center mt-2 mb-6 max-w-[440px] leading-relaxed px-6">
        Demo data — not connected to real banking or CIBIL. Lender disclosure on the Borrow screen names Northern Arc Finance as a placeholder NBFC partner; replace with your actual lender before launch.
      </p>
    </div>
  );
}

/* helper hooks */
export const useGo = () => {
  const r = useRouter();
  return (path: string) => r.push(path);
};
