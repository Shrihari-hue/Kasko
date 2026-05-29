import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { TabScreen } from "@/components/TabScreen";
import { TopBar } from "@/components/Nav";
import { T, Card, Row, IconCircle, Divider, Eyebrow } from "@/components/ui";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Profile() {
  const { phone, limit, creditScore, refresh, logout } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []);
  const phoneDisplay = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "+91 ····· ·····";
  const stats: [string, string][] = [
    ["Limit", `₹${(limit || 0).toLocaleString("en-IN")}`],
    ["CIBIL", creditScore ? String(creditScore) : "—"],
    ["Streak", "7 days"],
  ];
  async function signOut() { try { await logout(); } finally { router.replace("/login"); } }

  return (
    <TabScreen>
      <TopBar title="Profile" />
      <Card>
        <Row style={{ gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: F.display, fontSize: 24, color: C.paper }}>S</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T w="semibold" style={{ fontSize: 17 }}>Shree</T>
            <Row style={{ gap: 6, marginTop: 2 }}>
              <Feather name="check-circle" size={12} color={C.forest} />
              <Text style={{ fontFamily: F.semibold, fontSize: 11, letterSpacing: 0.8, color: C.forest }}>VERIFIED</Text>
            </Row>
          </View>
        </Row>
        <Divider style={{ marginVertical: 16 }} />
        <Row>
          {stats.map(([l, v], i) => (
            <View key={l} style={{ flex: 1, alignItems: "center", borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: C.line }}>
              <Eyebrow style={{ fontSize: 9 }}>{l}</Eyebrow>
              <Text style={{ fontFamily: F.display, fontSize: 18, marginTop: 4, letterSpacing: -0.5, color: C.ink }}>{v}</Text>
            </View>
          ))}
        </Row>
      </Card>

      <Section title="Account">
        <RowItem icon="phone" label="Mobile number" value={phoneDisplay} />
        <Divider />
        <RowItem icon="mail" label="Email" value="shri@gmail.com" />
        <Divider />
        <RowItem icon="home" label="HDFC Bank" value="····3456" verified />
      </Section>

      <Section title="Documents">
        <RowItem icon="file-text" label="PAN" value="ABCDE····1F" verified />
        <Divider />
        <RowItem icon="credit-card" label="Aadhaar" value="····5678" verified />
        <Divider />
        <RowItem icon="camera" label="Selfie" value="Verified" verified />
      </Section>

      <Pressable onPress={signOut} style={{ marginTop: 16, padding: 16, borderRadius: 18, backgroundColor: C.paperWarm, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Feather name="log-out" size={16} color={C.rust} />
        <Text style={{ fontFamily: F.semibold, fontSize: 14, color: C.rust }}>Sign out</Text>
      </Pressable>

      <T style={{ fontSize: 10, color: C.ink4, textAlign: "center", marginTop: 24, lineHeight: 16 }}>
        Kasko Technologies Pvt Ltd{"\n"}Lender: Northern Arc Finance · NBFC-D-13.01234{"\n"}App v1.0.0
      </T>
    </TabScreen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Eyebrow style={{ marginBottom: 8, marginLeft: 4 }}>{title}</Eyebrow>
      <Card style={{ padding: 0 }}>{children}</Card>
    </View>
  );
}
function RowItem({ icon, label, value, verified }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; verified?: boolean }) {
  return (
    <Row style={{ padding: 16, gap: 12 }}>
      <IconCircle name={icon} dim={36} size={16} />
      <View style={{ flex: 1 }}>
        <T w="semibold" style={{ fontSize: 13 }}>{label}</T>
        <T style={{ fontSize: 12, color: C.ink3 }}>{value}</T>
      </View>
      {verified ? (
        <Row style={{ gap: 4, backgroundColor: C.mint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Feather name="check" size={10} color={C.forest} />
          <Text style={{ fontFamily: F.semibold, fontSize: 10, color: C.forest }}>Verified</Text>
        </Row>
      ) : null}
    </Row>
  );
}
