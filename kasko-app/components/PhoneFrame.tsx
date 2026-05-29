"use client";

import { ReactNode } from "react";

export function PhoneFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  const color = dark ? "#FAFAF7" : "#0F1419";
  return (
    <div className="phone relative" style={{ background: dark ? "#0F1419" : "#FAFAF7" }}>
      <div className="phone-notch" />
      <div className="scroll-shell">
        <div
          className="px-7 pt-3 pb-2 flex items-end justify-between font-semibold text-sm"
          style={{ color }}
        >
          <span className="num">9:41</span>
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 10 }}>•••</span>
            <span style={{ fontSize: 11, fontWeight: 700 }}>5G</span>
            <div
              style={{
                width: 22, height: 11,
                border: `1.5px solid ${color}`, borderRadius: 3, position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 1.5, background: color, width: "75%", borderRadius: 1 }} />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
