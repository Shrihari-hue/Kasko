import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { TabScreen } from "@/components/TabScreen";
import { T, Card, Row, IconCircle, Divider } from "@/components/ui";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Dashboard() {
  const { limit, outstanding, refresh } = useApp();
  useEffect(() => { refresh().catch(() => {}); }, []);
  const hasLoan = !!outstanding && outstanding.owed > 0;

  return (
    <TabScreen>
      <Row style={{ justifyContent: "space-between", paddingTop: 8 }}>
        <View>
          <T style={{ fontSize: 13, color: C.ink3 }}>Good morning</T>
          <T w="semibold" style={{ fontSize: 18 }}>Shree</T>
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.paperWarm, alignItems: "center", justifyContent: "center" }}>
          <Feather name="bell" size={20} color={C.ink} />
          <View style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: C.rust }} />
        </View>
      </Row>

      {/* Hero limit card */}
      <View style={{ backgroundColor: C.ink, borderRadius: 28, padding: 24, marginTop: 18, overflow: "hidden" }}>
        <Text style={{ fontFamily: F.semibold, fontSize: 11, letterSpacing: 1.6, color: "rgba(250,250,247,0.55)" }}>AVAILABLE TO BORROW</Text>
        <Row style={{ alignItems: "flex-end", marginTop: 8 }}>
          <Text style={{ fontFamily: F.display, fontSize: 28, color: "rgba(250,250,247,0.6)" }}>₹</Text>
          <Text style={{ fontFamily: F.display, fontSize: 58, color: C.paper, lineHeight: 60, letterSpacing: -1 }}>{limit.toLocaleString("en-IN")}</Text>
        </Row>
        <Text style={{ fontFamily: F.body, fontSize: 12, color: "rgba(250,250,247,0.55)", marginTop: 2 }}>
          CIBIL-assessed · Limit refreshed today
        </Text>
        <Pressable onPress={() => router.push("/borrow")}
          style={({ pressed }) => ({ backgroundColor: C.paper, borderRadius: 999, paddingVertical: 16, marginTop: 24, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, opacity: pressed ? 0.9 : 1 })}>
          <Text style={{ fontFamily: F.semibold, fontSize: 15, color: C.ink }}>Borrow now</Text>
          <Feather name="arrow-right" size={18} color={C.ink} />
        </Pressable>
      </View>

      {hasLoan ? (
        <Pressable onPress={() => router.push("/repay")}>
          <Card style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, padding: 16 }}>
            <Row style={{ gap: 12 }}>
              <IconCircle name="clock" bg={C.amberSoft} color={C.amber} />
              <View>
                <T style={{ fontSize: 12, color: C.ink3 }}>Repay before midnight</T>
                <T w="semibold">₹{outstanding!.owed.toLocaleString("en-IN")}</T>
              </View>
            </Row>
            <Feather name="chevron-right" size={18} color={C.ink4} />
          </Card>
        </Pressable>
      ) : null}

      {/* Quick actions */}
      <Row style={{ marginTop: 24, gap: 12 }}>
        {([["Borrow", "plus", "/borrow"], ["Repay", "arrow-up", "/repay"], ["History", "clock", "/history"]] as const).map(([label, icon, href]) => (
          <Pressable key={label} onPress={() => router.push(href as any)} style={{ flex: 1 }}>
            <Card style={{ alignItems: "center", paddingVertical: 16, borderRadius: 18 }}>
              <IconCircle name={icon as any} dim={36} size={18} />
              <T w="semibold" style={{ fontSize: 12, marginTop: 8 }}>{label}</T>
            </Card>
          </Pressable>
        ))}
      </Row>

      {/* Activity */}
      <Row style={{ justifyContent: "space-between", marginTop: 28, marginBottom: 12 }}>
        <T w="semibold" style={{ fontSize: 15 }}>Recent activity</T>
        <Pressable onPress={() => router.push("/history")}><T style={{ fontSize: 13, color: C.ink3 }}>See all</T></Pressable>
      </Row>
      <Card style={{ padding: 0 }}>
        <TxnRow type="borrow" amount={900} when="Yesterday" status="Disbursed" />
        <Divider />
        <TxnRow type="repay" amount={1000} when="3 days ago" status="Repaid" />
        <Divider />
        <TxnRow type="borrow" amount={900} when="5 days ago" status="Repaid" last />
      </Card>

      <Row style={{ marginTop: 20, gap: 12, alignItems: "flex-start", backgroundColor: C.goldSoft, borderRadius: 16, padding: 14 }}>
        <Feather name="award" size={16} color={C.gold} style={{ marginTop: 2 }} />
        <T style={{ flex: 1, fontSize: 12, color: C.ink2, lineHeight: 18 }}>
          Repay your next loan on time and your limit grows automatically.
        </T>
      </Row>
    </TabScreen>
  );
}

function TxnRow({ type, amount, when, status, last }: { type: "borrow" | "repay"; amount: number; when: string; status: string; last?: boolean }) {
  const isBorrow = type === "borrow";
  return (
    <Row style={{ padding: 16, gap: 12 }}>
      <IconCircle name={isBorrow ? "arrow-down-left" : "arrow-up-right"} bg={isBorrow ? C.mint : C.amberSoft} color={isBorrow ? C.forest : C.amber} dim={36} size={16} />
      <View style={{ flex: 1 }}>
        <T w="semibold" style={{ fontSize: 14 }}>{isBorrow ? "Cash advance" : "Repayment"}</T>
        <T style={{ fontSize: 11, color: C.ink3 }}>{when} · {status}</T>
      </View>
      <T w="semibold" style={{ fontSize: 14, color: isBorrow ? C.forest : C.ink2 }}>
        {isBorrow ? "+" : "−"}₹{amount.toLocaleString("en-IN")}
      </T>
    </Row>
  );
}
