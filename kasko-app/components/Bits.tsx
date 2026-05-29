"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bell, Clock, Home, User, HelpCircle } from "lucide-react";

export function TopBar({ title, backHref, right }: { title: string; backHref?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-1 pb-4">
      {backHref ? (
        <Link href={backHref} className="w-10 h-10 rounded-full bg-paperWarm flex items-center justify-center active:scale-95 transition">
          <ArrowLeft size={20} />
        </Link>
      ) : <div className="w-10" />}
      <div className="font-semibold text-base tracking-tight">{title}</div>
      <div className="w-10 flex justify-end">{right ?? null}</div>
    </div>
  );
}

export function Logo({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center font-display"
        style={{
          width: size, height: size, borderRadius: size / 3.2,
          background: dark ? "#FAFAF7" : "#0F1419",
          color: dark ? "#0F1419" : "#FAFAF7",
          fontWeight: 700, fontSize: size * 0.6, lineHeight: 1,
        }}
      >K</div>
      <span className="font-display text-[26px] font-medium tracking-tight" style={{ color: dark ? "#FAFAF7" : "#0F1419" }}>
        Kasko
      </span>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items: Array<{ href: string; label: string; Icon: any }> = [
    { href: "/dashboard", label: "Home",     Icon: Home },
    { href: "/history",   label: "Activity", Icon: Clock },
    { href: "/profile",   label: "Profile",  Icon: User },
    { href: "/help",      label: "Help",     Icon: HelpCircle },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2"
      style={{ background: "rgba(250,250,247,0.92)", backdropFilter: "blur(10px)", borderTop: "1px solid #EFEBE3" }}>
      <div className="flex items-center justify-around">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-1 px-3 ${active ? "text-ink" : "text-ink4"}`}>
              <Icon size={22} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
              <div className={`w-1 h-1 rounded-full mt-0.5 ${active ? "bg-ink opacity-100" : "opacity-0"}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function NotifBell() {
  return (
    <button className="w-10 h-10 rounded-full bg-paperWarm flex items-center justify-center relative">
      <Bell size={20} />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rust" />
    </button>
  );
}
