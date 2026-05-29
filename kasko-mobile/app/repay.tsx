import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Eyebrow, T, Card, Button, Row, IconCircle } from "@/components/ui";
import { TopBar } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Repay() {
  const { outstanding, repay, refresh, busy } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []);
  const due = outstanding?.owed ?? 1000;
  const [method, setMethod] = useState<"upi" | "qr">("upi");
  const [showSkip, setShowSkip] = useState(false);

  async function pay() {
    if (busy) return;
    try { await repay(method === "qr" ? "qr" : "upi"); router.replace("/repaid"); }
    catch (e: any) { Alert.alert("Payment failed", e?.message ?? "Try again"); }
  }

  return (
    <Screen>
      <TopBar back title="Repay" />
      <Card style={{ backgroundColor: C.goldSoft, borderColor: "#EFDFC0" }}>
        <Eyebrow style={{ color: "#8B6A3A" }}>Amount due</Eyebrow>
        <Row style={{ alignItems: "flex-end", marginTop: 4 }}>
          <Text style={{ fontFamily: F.display, fontSize: 28, color: C.ink3 }}>₹</Text>
          <Text style={{ fontFamily: F.display, fontSize: 54, lineHeight: 56, color: C.ink, letterSpacing: -1 }}>{due.toLocaleString("en-IN")}</Text>
        </Row>
        <Row style={{ gap: 6, marginTop: 12, alignItems: "center" }}>
          <Feather name="clock" size={14} color={C.ink2} />
          <T style={{ fontSize: 12, color: C.ink2 }}>Due before midnight today</T>
        </Row>
      </Card>

      <Eyebrow style={{ marginTop: 28, marginBottom: 12 }}>Choose how to pay</Eyebrow>
      <MethodRow id="upi" current={method} set={setMethod} icon="smartphone" title="UPI — open in app" sub="GPay · PhonePe · Paytm · BHIM" />
      <View style={{ height: 8 }} />
      <MethodRow id="qr" current={method} set={setMethod} icon="grid" title="Scan QR" sub="Show this in any UPI app" />

      {method === "upi" ? (
        <Row style={{ gap: 8, marginTop: 16 }}>
          {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
            <Pressable key={app} onPress={pay} style={{ flex: 1 }}>
              <Card style={{ alignItems: "center", paddingVertical: 12, borderRadius: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: app === "GPay" ? "#4285F4" : app === "PhonePe" ? "#5F259F" : app === "Paytm" ? "#00BAF2" : "#00A0DC" }}>
                  <Text style={{ fontFamily: F.bold, fontSize: 14, color: "#fff" }}>{app[0]}</Text>
                </View>
                <Text style={{ fontFamily: F.semibold, fontSize: 10, marginTop: 6, color: C.ink }}>{app}</Text>
              </Card>
            </Pressable>
          ))}
        </Row>
      ) : (
        <Card style={{ marginTop: 16, alignItems: "center", paddingVertical: 24 }}>
          <View style={{ width: 168, height: 168, borderRadius: 18, backgroundColor: C.paperWarm, alignItems: "center", justifyContent: "center" }}>
            <Feather name="grid" size={110} color={C.ink} />
          </View>
          <T style={{ fontSize: 12, color: C.ink3, marginTop: 12 }}>Scan with any UPI app</T>
        </Card>
      )}

      <Card style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 18 }}>
        <View>
          <Eyebrow style={{ fontSize: 10 }}>UPI ID</Eyebrow>
          <Text style={{ fontFamily: F.medium, fontSize: 14, marginTop: 4, color: C.ink }}>kasko.repay@hdfcbank</Text>
        </View>
        <IconCircle name="copy" dim={36} size={16} />
      </Card>

      <Button label={`Pay ₹${due.toLocaleString("en-IN")} now`} variant="forest" busy={busy} onPress={pay} style={{ marginTop: 24 }} />
      <Button label="I'll pay later" variant="ghost" onPress={() => setShowSkip(true)} />

      <Modal visible={showSkip} transparent animationType="slide" onRequestClose={() => setShowSkip(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,20,25,0.45)" }}>
          <View style={{ backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 }}>
            <View style={{ width: 48, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: "center", marginBottom: 16 }} />
            <IconCircle name="alert-triangle" bg={C.rustSoft} color={C.rust} dim={56} size={24} />
            <Text style={{ fontFamily: F.displaySemi, fontSize: 24, color: C.ink, marginTop: 16 }}>Are you sure?</Text>
            <T style={{ fontSize: 14, color: C.ink2, marginTop: 8, lineHeight: 20 }}>If you miss the midnight deadline:</T>
            <T style={{ fontSize: 13, color: C.ink2, marginTop: 8, lineHeight: 22 }}>
              • ₹50/day late fee, up to ₹500{"\n"}• You lose your on-time streak{"\n"}• Your limit won&apos;t grow this cycle
            </T>
            <Button label="Take me back to pay" variant="forest" onPress={() => setShowSkip(false)} style={{ marginTop: 22 }} />
            <Button label="I understand, remind me later" variant="ghost" onPress={() => { setShowSkip(false); router.replace("/dashboard"); }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function MethodRow({ id, current, set, icon, title, sub }: {
  id: "upi" | "qr"; current: string; set: (v: "upi" | "qr") => void;
  icon: keyof typeof Feather.glyphMap; title: string; sub: string;
}) {
  const on = current === id;
  return (
    <Pressable onPress={() => set(id)}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, backgroundColor: on ? C.ink : C.surface, borderColor: on ? C.ink : C.line }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: on ? "rgba(250,250,247,0.15)" : C.paperWarm }}>
        <Feather name={icon} size={18} color={on ? C.paper : C.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.semibold, fontSize: 14, color: on ? C.paper : C.ink }}>{title}</Text>
        <Text style={{ fontFamily: F.body, fontSize: 11, color: on ? "rgba(250,250,247,0.6)" : C.ink3 }}>{sub}</Text>
      </View>
      {on ? <Feather name="check" size={18} color={C.paper} /> : null}
    </Pressable>
  );
}
