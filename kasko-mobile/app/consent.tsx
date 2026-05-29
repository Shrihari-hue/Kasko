import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Eyebrow, Display, T, Card, Button, Row, IconCircle } from "@/components/ui";
import { TopBar } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

const POINTS: [string, string][] = [
  ["Fetch your CIBIL score", "From TransUnion CIBIL, India's RBI-regulated bureau."],
  ["Check your repayment history", "To set your borrowing limit and interest fairly."],
  ["Run a soft inquiry", "This does not hurt your credit score."],
];

export default function Consent() {
  const { consentAndCheck, busy, error } = useApp();
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const can = a1 && a2 && !busy;

  async function authorize() {
    try { await consentAndCheck(); router.replace("/kyc"); } catch {}
  }

  return (
    <Screen>
      <TopBar back title="Consent" />
      <IconCircle name="shield" bg={C.mint} color={C.forest} dim={56} size={24} />
      <Display size={28} style={{ marginTop: 18, lineHeight: 32 }}>A quick credit check, with your permission.</Display>
      <T style={{ color: C.ink3, marginTop: 12, lineHeight: 22 }}>
        Before we lend, we check your CIBIL score. This helps us offer you the right limit at the right cost.
      </T>

      <Card style={{ marginTop: 24 }}>
        <Eyebrow style={{ marginBottom: 12 }}>What we&apos;ll do</Eyebrow>
        {POINTS.map(([t, d]) => (
          <Row key={t} style={{ alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <IconCircle name="check" bg={C.mint} color={C.forest} dim={24} size={12} />
            <View style={{ flex: 1 }}>
              <T w="semibold" style={{ fontSize: 14 }}>{t}</T>
              <T style={{ fontSize: 12, color: C.ink3, lineHeight: 17 }}>{d}</T>
            </View>
          </Row>
        ))}
      </Card>

      {[[a1, setA1, "I authorize Kasko to fetch my CIBIL credit information to underwrite this loan application."] as const,
        [a2, setA2, "I confirm the details I provide belong to me and are accurate."] as const,
      ].map(([on, set, label], i) => (
        <Pressable key={i} onPress={() => set(!on)}
          style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: 18, padding: 16, marginTop: 12 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, marginTop: 2, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.ink : C.paperWarm, borderWidth: on ? 0 : 1, borderColor: C.line }}>
            {on ? <Feather name="check" size={12} color={C.paper} /> : null}
          </View>
          <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13, color: C.ink2, lineHeight: 19 }}>{label}</Text>
        </Pressable>
      ))}

      {error ? <T style={{ color: C.rust, fontSize: 13, marginTop: 14 }}>{error}</T> : null}
      <Button label={busy ? "Checking your credit…" : "Authorize & continue"} icon={busy ? undefined : "arrow-right"} onPress={authorize} disabled={!can} busy={busy} style={{ marginTop: 22 }} />
    </Screen>
  );
}
