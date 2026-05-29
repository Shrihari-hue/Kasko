import { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Screen, Eyebrow, Display, T, Card, Button, Row, Divider } from "@/components/ui";
import { TopBar } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { C, F, tomorrow } from "@/lib/theme";

const INTEREST = 50, PROCESSING = 50;

export default function Borrow() {
  const { borrow, refresh, busy } = useApp();
  const [amount, setAmount] = useState(1000);
  const [showKfs, setShowKfs] = useState(false);
  const youGet = Math.max(0, amount - INTEREST - PROCESSING);

  useEffect(() => { refresh().catch(() => {}); }, []);

  async function confirm() {
    try { await borrow(amount); setShowKfs(false); router.replace("/disbursed"); }
    catch (e: any) { setShowKfs(false); Alert.alert("Couldn’t borrow", e?.message ?? "Try again"); }
  }

  return (
    <Screen>
      <TopBar back title="New advance" />
      <Eyebrow>How much do you need?</Eyebrow>
      <Row style={{ alignItems: "flex-end", marginTop: 12 }}>
        <Text style={{ fontFamily: F.display, fontSize: 36, color: C.ink3 }}>₹</Text>
        <Text style={{ fontFamily: F.display, fontSize: 84, lineHeight: 88, color: C.ink, letterSpacing: -2 }}>{amount.toLocaleString("en-IN")}</Text>
      </Row>
      <T style={{ color: C.ink3, fontSize: 13, marginTop: 2 }}>Max ₹1,000 · 1-day tenure</T>

      <Slider
        style={{ marginTop: 24, height: 40 }}
        minimumValue={200} maximumValue={1000} step={50}
        value={amount} onValueChange={setAmount}
        minimumTrackTintColor={C.ink} maximumTrackTintColor={C.line} thumbTintColor={C.ink}
      />
      <Row style={{ justifyContent: "space-between" }}>
        <T style={{ fontSize: 11, color: C.ink3 }}>₹200</T>
        <T style={{ fontSize: 11, color: C.ink3 }}>₹1,000</T>
      </Row>

      <Row style={{ gap: 8, marginTop: 16 }}>
        {[200, 500, 750, 1000].map((p) => (
          <Pressable key={p} onPress={() => setAmount(p)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: amount === p ? C.ink : C.paperWarm, alignItems: "center" }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 12, color: amount === p ? C.paper : C.ink2 }}>₹{p}</Text>
          </Pressable>
        ))}
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Cost breakdown</Eyebrow>
        <Row style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <View>
            <T style={{ fontSize: 12, color: C.ink3 }}>You&apos;ll receive</T>
            <Text style={{ fontFamily: F.display, fontSize: 36, color: C.ink, letterSpacing: -1 }}>₹{youGet.toLocaleString("en-IN")}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <T style={{ fontSize: 12, color: C.ink3 }}>Repay tomorrow</T>
            <T w="semibold" style={{ fontSize: 20 }}>₹{amount.toLocaleString("en-IN")}</T>
          </View>
        </Row>
        <Divider style={{ marginVertical: 16 }} />
        <Line label="Interest" value={`₹${INTEREST}`} />
        <Line label="Processing fee" value={`₹${PROCESSING}`} />
        <Line label="Total cost" value={`₹${INTEREST + PROCESSING}`} strong />
        <Row style={{ gap: 8, marginTop: 16, backgroundColor: C.rustSoft, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" }}>
          <Feather name="alert-triangle" size={14} color={C.rust} />
          <T style={{ flex: 1, fontSize: 11, color: C.ink2, lineHeight: 15 }}>Late fee: ₹50/day after due date, capped at ₹500.</T>
        </Row>
      </Card>

      <Button label="Review terms & confirm" icon="arrow-right" onPress={() => setShowKfs(true)} style={{ marginTop: 24 }} />
      <T style={{ fontSize: 11, color: C.ink3, textAlign: "center", marginTop: 16, lineHeight: 16 }}>
        Lender: Northern Arc Finance (RBI-registered NBFC){"\n"}Kasko is a Lending Service Provider.
      </T>

      <Kfs visible={showKfs} amount={amount} youGet={youGet} busy={busy} onClose={() => setShowKfs(false)} onAccept={confirm} />
    </Screen>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: "space-between", marginBottom: 6 }}>
      <T w={strong ? "semibold" : "body"} style={{ fontSize: 13, color: strong ? C.ink : C.ink2 }}>{label}</T>
      <T w={strong ? "semibold" : "body"} style={{ fontSize: 13, color: strong ? C.ink : C.ink2 }}>{value}</T>
    </Row>
  );
}

function Kfs({ visible, amount, youGet, busy, onClose, onAccept }: {
  visible: boolean; amount: number; youGet: number; busy: boolean; onClose: () => void; onAccept: () => void;
}) {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const apr = Math.round((100 / Math.max(1, youGet)) * 365 * 100);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,20,25,0.45)" }}>
        <View style={{ backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "88%" }}>
          <View style={{ paddingHorizontal: 22, paddingTop: 12 }}>
            <View style={{ width: 48, height: 4, borderRadius: 999, backgroundColor: C.line, alignSelf: "center" }} />
            <Row style={{ justifyContent: "space-between", marginTop: 12 }}>
              <Text style={{ fontFamily: F.displaySemi, fontSize: 22, color: C.ink }}>Key Facts Statement</Text>
              <Pressable onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.paperWarm, alignItems: "center", justifyContent: "center" }}>
                <Feather name="x" size={20} color={C.ink} />
              </Pressable>
            </Row>
            <T style={{ fontSize: 11, color: C.ink3, marginTop: 4 }}>As required by RBI Digital Lending Guidelines, 2022</T>
          </View>
          <ScrollView contentContainerStyle={{ padding: 22 }}>
            <Card>
              <KRow label="Loan amount (sanctioned)" value={`₹${amount.toLocaleString("en-IN")}`} />
              <KRow label="Net amount to your bank" value={`₹${youGet.toLocaleString("en-IN")}`} strong />
              <KRow label="Tenure" value="1 day" />
              <KRow label="Repayment date" value={tomorrow()} />
              <KRow label="Interest" value={`₹${INTEREST}`} />
              <KRow label="Processing fee" value={`₹${PROCESSING}`} />
              <KRow label="Total interest & charges" value="₹100" strong />
            </Card>
            <Card style={{ marginTop: 12, backgroundColor: C.paperWarm, borderColor: C.line2 }}>
              <Eyebrow style={{ color: C.rust }}>Annualized cost of credit</Eyebrow>
              <Text style={{ fontFamily: F.display, fontSize: 32, color: C.ink, marginTop: 4, letterSpacing: -1 }}>{apr}% APR</Text>
              <T style={{ fontSize: 12, color: C.ink3, lineHeight: 18, marginTop: 8 }}>
                Short-tenure advances carry a high annualized rate because the principal turns over quickly. The actual amount you pay above what you receive is ₹100.
              </T>
            </Card>
            <Card style={{ marginTop: 12 }}>
              <Eyebrow style={{ marginBottom: 8 }}>Late payment</Eyebrow>
              <T style={{ fontSize: 13, color: C.ink2, lineHeight: 20 }}>• ₹50 added per day after the due date{"\n"}• Late fee capped at ₹500 (10 days){"\n"}• After 30 days the loan is reported to CIBIL</T>
            </Card>
            <Card style={{ marginTop: 12 }}>
              <Eyebrow style={{ marginBottom: 6 }}>Grievance redressal</Eyebrow>
              <T style={{ fontSize: 13, color: C.ink2, lineHeight: 19 }}>Anjali Sharma · Nodal Officer{"\n"}grievance@kasko.in · 1800-XXX-XXXX{"\n"}RBI Ombudsman: cms.rbi.org.in</T>
            </Card>

            {[[a1, setA1, "I have read and understood the Key Facts Statement including all charges and the late fee policy."] as const,
              [a2, setA2, `I authorize Northern Arc Finance to disburse ₹${youGet.toLocaleString("en-IN")} to my bank and debit ₹${amount.toLocaleString("en-IN")} on the due date.`] as const,
            ].map(([on, set, label], i) => (
              <Pressable key={i} onPress={() => set(!on)} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start", marginTop: 14 }}>
                <View style={{ width: 20, height: 20, borderRadius: 6, marginTop: 2, alignItems: "center", justifyContent: "center", backgroundColor: on ? C.ink : C.paperWarm, borderWidth: on ? 0 : 1, borderColor: C.line }}>
                  {on ? <Feather name="check" size={12} color={C.paper} /> : null}
                </View>
                <Text style={{ flex: 1, fontFamily: F.body, fontSize: 13, color: C.ink2, lineHeight: 19 }}>{label}</Text>
              </Pressable>
            ))}

            <Button label={`Accept & receive ₹${youGet.toLocaleString("en-IN")}`} icon="arrow-right" variant="forest" disabled={!(a1 && a2)} busy={busy} onPress={onAccept} style={{ marginTop: 22 }} />
            <Button label="Cancel" variant="ghost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
function KRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <Row style={{ justifyContent: "space-between", paddingVertical: 6 }}>
      <T style={{ fontSize: 13, color: C.ink3 }}>{label}</T>
      <T w={strong ? "semibold" : "body"} style={{ fontSize: 14, color: strong ? C.ink : C.ink2 }}>{value}</T>
    </Row>
  );
}
