import { useEffect, useRef, useState } from "react";
import { View, TextInput } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Eyebrow, Display, T, Row } from "@/components/ui";
import { TopBar } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Otp() {
  const { phone, devOtp, verifyOtp, error } = useApp();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [checking, setChecking] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);

  const filled = digits.every((d) => d !== "");
  useEffect(() => {
    if (filled && !checking) {
      setChecking(true);
      verifyOtp(digits.join(""))
        .then(() => router.replace("/consent"))
        .catch(() => { setChecking(false); setDigits(["", "", "", "", "", ""]); refs.current[0]?.focus(); });
    }
  }, [filled]);

  const update = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = val; setDigits(next);
    if (val && refs.current[i + 1]) refs.current[i + 1]?.focus();
  };

  const masked = phone ? `+91 ${phone.slice(0, 2)}··· ··${phone.slice(-2)}` : "+91 ··· ··· ··10";

  return (
    <Screen>
      <TopBar back />
      <Eyebrow style={{ marginBottom: 12 }}>Step 2 of 2</Eyebrow>
      <Display size={30} style={{ lineHeight: 34 }}>Enter the 6-digit code we sent to {masked}</Display>

      <Row style={{ marginTop: 40, justifyContent: "space-between" }}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={d}
            onChangeText={(v) => update(i, v)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={i === 0}
            style={{
              width: 46, height: 56, borderRadius: 14, backgroundColor: C.paperWarm,
              textAlign: "center", fontSize: 22, fontFamily: F.bold, color: C.ink,
              borderWidth: 1.5, borderColor: d ? C.ink : "transparent",
            }}
          />
        ))}
      </Row>

      {error ? <T style={{ color: C.rust, fontSize: 13, marginTop: 16, textAlign: "center" }}>{error}</T> : null}

      {devOtp ? (
        <Row style={{ marginTop: 40, gap: 12, backgroundColor: C.paperWarm, borderRadius: 16, padding: 16, alignItems: "flex-start" }}>
          <Feather name="info" size={16} color={C.ink2} style={{ marginTop: 2 }} />
          <T style={{ flex: 1, fontSize: 12, color: C.ink2, lineHeight: 18 }}>
            Dev mode: your code is {devOtp}. In production it&apos;s sent over SMS only.
          </T>
        </Row>
      ) : null}
    </Screen>
  );
}
