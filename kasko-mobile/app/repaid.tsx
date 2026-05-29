import { View, Text } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Display, T, Button, Eyebrow } from "@/components/ui";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Repaid() {
  const { lastRepay, limit } = useApp();
  const paid = lastRepay?.paid ?? 1000;

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, paddingTop: 30, paddingBottom: 16 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.forest, alignItems: "center", justifyContent: "center" }}>
            <Feather name="check" size={44} color={C.paper} />
          </View>
          <Display size={36} style={{ marginTop: 28 }}>Paid in full.</Display>
          <T style={{ color: C.ink3, marginTop: 12, textAlign: "center", lineHeight: 22, maxWidth: 280 }}>
            Thank you. Your repayment of ₹{paid.toLocaleString("en-IN")} has been received and your account is clear.
          </T>
        </View>

        <View style={{ backgroundColor: C.forest, borderRadius: 24, padding: 24, alignItems: "center" }}>
          <Eyebrow style={{ color: "rgba(250,250,247,0.6)" }}>New borrowing limit</Eyebrow>
          <Text style={{ fontFamily: F.display, fontSize: 44, color: C.paper, marginTop: 4, letterSpacing: -1 }}>₹{(limit || 1000).toLocaleString("en-IN")}</Text>
          <T style={{ fontSize: 12, color: "rgba(250,250,247,0.7)", marginTop: 4, textAlign: "center" }}>
            Updated for repaying on time. Keep it up.
          </T>
        </View>

        <Button label="Borrow again" variant="soft" onPress={() => router.replace("/borrow")} style={{ marginTop: 16 }} />
        <Button label="Done" icon="check" onPress={() => router.replace("/dashboard")} style={{ marginTop: 8 }} />
      </View>
    </Screen>
  );
}
