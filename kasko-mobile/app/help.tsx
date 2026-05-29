import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TabScreen } from "@/components/TabScreen";
import { TopBar } from "@/components/Nav";
import { T, Card, Row, Field, Eyebrow, IconCircle, Divider } from "@/components/ui";
import { C, F } from "@/lib/theme";

const TOPICS = [
  "How does Kasko make money?",
  "What happens if I miss the due date?",
  "Why do you check my CIBIL score?",
  "When will my limit increase?",
  "How do I close my account?",
  "Is my data safe?",
];

export default function Help() {
  return (
    <TabScreen>
      <TopBar title="Help & support" />
      <View style={{ position: "relative", justifyContent: "center" }}>
        <Field placeholder="Search how-to articles…" style={{ paddingLeft: 44 }} />
        <Feather name="search" size={18} color={C.ink4} style={{ position: "absolute", left: 16 }} />
      </View>

      <Row style={{ gap: 8, marginTop: 20 }}>
        {([["message-circle", "Chat", "2 min wait"], ["phone", "Call", "10am–7pm"], ["mail", "Email", "< 24 hrs"]] as const).map(([icon, label, sub]) => (
          <Card key={label} style={{ flex: 1, alignItems: "center", paddingVertical: 16, borderRadius: 18 }}>
            <IconCircle name={icon as any} bg={C.ink} color={C.paper} dim={40} size={18} />
            <T w="semibold" style={{ fontSize: 13, marginTop: 8 }}>{label}</T>
            <T style={{ fontSize: 10, color: C.ink3 }}>{sub}</T>
          </Card>
        ))}
      </Row>

      <Eyebrow style={{ marginTop: 28, marginBottom: 12, marginLeft: 4 }}>Popular questions</Eyebrow>
      <Card style={{ padding: 0 }}>
        {TOPICS.map((t, i) => (
          <View key={t}>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
              <Feather name="help-circle" size={18} color={C.ink3} />
              <Text style={{ flex: 1, fontFamily: F.medium, fontSize: 14, color: C.ink }}>{t}</Text>
              <Feather name="chevron-right" size={18} color={C.ink4} />
            </Pressable>
            {i < TOPICS.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: 20 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Grievance redressal</Eyebrow>
        <T style={{ fontSize: 13, color: C.ink2, lineHeight: 19 }}>
          Anjali Sharma, Nodal Officer{"\n"}grievance@kasko.in · 1800-XXX-XXXX
        </T>
        <T style={{ fontSize: 11, color: C.ink3, marginTop: 12, lineHeight: 16 }}>
          If unresolved within 30 days, escalate to the RBI Integrated Ombudsman at cms.rbi.org.in.
        </T>
      </Card>
    </TabScreen>
  );
}
