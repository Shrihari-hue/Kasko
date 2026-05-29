"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Logo } from "@/components/Bits";
import { Shield } from "lucide-react";

export default function SplashPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push("/login"), 1800);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <Shell>
      <PhoneFrame dark>
        <div className="relative" style={{ height: 800 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
            <div className="pop-in flex flex-col items-center"><Logo size={56} dark /></div>
            <div className="anim-in mt-6" style={{ animationDelay: ".3s" }}>
              <p className="text-paper/60 text-sm tracking-tight">Money when you need it.</p>
            </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-3 text-paper/40 anim-in" style={{ animationDelay: ".7s" }}>
            <Shield size={14} />
            <p className="text-[10px] tracking-[0.18em] uppercase">RBI-regulated · NBFC partner</p>
          </div>
        </div>
      </PhoneFrame>
    </Shell>
  );
}
