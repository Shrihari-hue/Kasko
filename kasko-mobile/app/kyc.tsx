import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Eyebrow, Display, T, Card, Button, Row, IconCircle } from "@/components/ui";
import { TopBar } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

const STEPS: { key: string; title: string; desc: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "pan", title: "PAN card", desc: "For tax identity verification.", icon: "file-text" },
  { key: "aadhaar", title: "Aadhaar e-KYC", desc: "Verify name & address via UIDAI.", icon: "credit-card" },
  { key: "selfie", title: "Selfie", desc: "A quick live photo to match your ID.", icon: "camera" },
  { key: "bank", title: "Bank account", desc: "For instant disbursement & repayment.", icon: "home" },
];

export default function Kyc() {
  const { completedKyc, kycComplete, loadKyc, submitKyc, busy } = useApp();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => { loadKyc().catch(() => {}); }, []);
  const completed = STEPS.filter((s) => completedKyc.includes(s.key)).length;

  return (
    <Screen>
      <TopBar back title="Verify your identity" />
      <Eyebrow>Required by RBI</Eyebrow>
      <Display size={28} style={{ marginTop: 4 }}>{completed === 0 ? "4 quick steps." : `${completed} of 4 done.`}</Display>
      <T style={{ color: C.ink3, marginTop: 8, fontSize: 14 }}>Takes about 3 minutes. You can pause and resume.</T>

      <View style={{ height: 6, borderRadius: 999, backgroundColor: C.line2, marginTop: 24, overflow: "hidden" }}>
        <View style={{ height: 6, borderRadius: 999, backgroundColor: C.forest, width: `${(completed / 4) * 100}%` }} />
      </View>

      <View style={{ marginTop: 24, gap: 12 }}>
        {STEPS.map((s) => {
          const done = completedKyc.includes(s.key);
          return (
            <Pressable key={s.key} onPress={() => !done && setActive(s.key)}>
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 16, opacity: done ? 0.9 : 1 }}>
                <IconCircle name={done ? "check" : s.icon} bg={done ? C.mint : C.paperWarm} color={done ? C.forest : C.ink} dim={44} />
                <View style={{ flex: 1 }}>
                  <T w="semibold" style={{ fontSize: 15 }}>{s.title}</T>
                  <T style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>{done ? "Verified" : s.desc}</T>
                </View>
                {!done ? <Feather name="chevron-right" size={18} color={C.ink4} /> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>

      <Button label={kycComplete ? "Open my account" : "Complete all 4 steps"} icon={kycComplete ? "arrow-right" : undefined} disabled={!kycComplete} onPress={() => router.replace("/dashboard")} style={{ marginTop: 32 }} />

      <Modal visible={!!active} transparent animationType="slide" onRequestClose={() => setActive(null)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,20,25,0.45)" }}>
          <View style={{ backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
            <View style={{ width: 48, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: "center", marginBottom: 16 }} />
            <Text style={{ fontFamily: F.displaySemi, fontSize: 24, color: C.ink, textTransform: "capitalize" }}>{active}</Text>
            <T style={{ fontSize: 13, color: C.ink3, marginTop: 8, lineHeight: 19 }}>
              Demo step — the backend records a verified KYC record via the mock vendor adapter. Replace with Karza / IDfy / Hyperverge / Signzy.
            </T>
            <Button label="Mark verified" icon="check" variant="forest" busy={busy} onPress={async () => { if (active) { await submitKyc(active); setActive(null); } }} style={{ marginTop: 24 }} />
            <Button label="Cancel" variant="ghost" onPress={() => setActive(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
