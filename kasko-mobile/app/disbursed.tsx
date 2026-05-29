import { View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Display, T, Card, Button, Row, Divider, Eyebrow } from "@/components/ui";
import { useApp } from "@/lib/store";
import { C } from "@/lib/theme";
import { tomorrow } from "@/lib/theme";

export default function Disbursed() {
  const { lastDisbursed, outstanding } = useApp();
  const sent = lastDisbursed ?? 900;
  const due = outstanding?.owed ?? sent + 100;

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, paddingTop: 30, paddingBottom: 16 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.mint, alignItems: "center", justifyContent: "center" }}>
            <Feather name="check" size={44} color={C.forest} />
          </View>
          <Display size={36} style={{ marginTop: 28 }}>All set.</Display>
          <T style={{ color: C.ink3, marginTop: 12, textAlign: "center", lineHeight: 22, maxWidth: 280 }}>
            ₹{sent.toLocaleString("en-IN")} is on its way to your bank account. Usually under 2 minutes.
          </T>
        </View>

        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <View>
              <Eyebrow>Repay by</Eyebrow>
              <Display size={24} style={{ marginTop: 4 }}>{tomorrow()}</Display>
              <T style={{ fontSize: 12, color: C.ink3 }}>11:59 PM</T>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Eyebrow>Amount due</Eyebrow>
              <Display size={24} style={{ marginTop: 4 }}>₹{due.toLocaleString("en-IN")}</Display>
              <T style={{ fontSize: 12, color: C.ink3 }}>1-day tenure</T>
            </View>
          </Row>
          <Divider style={{ marginVertical: 16 }} />
          <Row style={{ gap: 10, alignItems: "flex-start" }}>
            <Feather name="info" size={16} color={C.ink2} style={{ marginTop: 2 }} />
            <T style={{ flex: 1, fontSize: 12, color: C.ink2, lineHeight: 18 }}>
              We&apos;ll remind you at 6 PM tomorrow. Pay any time before the deadline to keep your credit healthy.
            </T>
          </Row>
        </Card>

        <Button label="Set up auto-debit" variant="soft" onPress={() => router.replace("/repay")} style={{ marginTop: 16 }} />
        <Button label="Done" icon="check" onPress={() => router.replace("/dashboard")} style={{ marginTop: 8 }} />
      </View>
    </Screen>
  );
}
