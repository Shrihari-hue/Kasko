import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { TabScreen } from "@/components/TabScreen";
import { TopBar } from "@/components/Nav";
import { T, Card, Row, IconCircle, Eyebrow } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { Txn } from "@/lib/api";
import { C, F } from "@/lib/theme";

export default function History() {
  const { transactions } = useApp();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [tab, setTab] = useState<"all" | "in" | "out">("all");

  useEffect(() => { transactions().then(setTxns).catch(() => {}); }, []);

  const totals = useMemo(() => {
    let borrowed = 0, repaid = 0;
    for (const t of txns) {
      if (t.type === "disbursal") borrowed += t.amount;
      if (t.type === "repayment") repaid += Math.abs(t.amount);
    }
    return { borrowed, repaid };
  }, [txns]);

  const filtered = txns.filter((t) => (tab === "all" ? true : tab === "in" ? t.amount > 0 : t.amount < 0));
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <TabScreen>
      <TopBar title="Activity" right={<Feather name="search" size={18} color={C.ink} />} />
      <Row style={{ gap: 8 }}>
        <Stat label="Borrowed" value={`₹${totals.borrowed.toLocaleString("en-IN")}`} />
        <Stat label="Repaid" value={`₹${totals.repaid.toLocaleString("en-IN")}`} />
        <Stat label="Outstanding" value="₹0" tone />
      </Row>

      <Row style={{ gap: 8, marginTop: 20 }}>
        {(["all", "in", "out"] as const).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: tab === k ? C.ink : C.paperWarm }}>
            <Text style={{ fontFamily: F.semibold, fontSize: 12, color: tab === k ? C.paper : C.ink2 }}>
              {k === "all" ? "All" : k === "in" ? "Advances" : "Repayments"}
            </Text>
          </Pressable>
        ))}
      </Row>

      <View style={{ marginTop: 16, gap: 8 }}>
        {filtered.length === 0 ? (
          <Card><T style={{ textAlign: "center", color: C.ink3, fontSize: 13 }}>No transactions yet. Borrow once to see activity here.</T></Card>
        ) : filtered.map((t) => {
          const isIn = t.amount > 0;
          const isLate = t.type === "late_fee";
          const label = t.type === "disbursal" ? "Cash advance" : t.type === "late_fee" ? "Late fee" : "Repayment";
          return (
            <Card key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
              <IconCircle name={isIn ? "arrow-down-left" : "arrow-up-right"} bg={isIn ? C.mint : isLate ? C.rustSoft : C.amberSoft} color={isIn ? C.forest : isLate ? C.rust : C.amber} dim={40} size={16} />
              <View style={{ flex: 1 }}>
                <T w="semibold" style={{ fontSize: 14 }}>{label}</T>
                <T style={{ fontSize: 11, color: C.ink3 }}>{fmtDate(t.createdAt)}{t.note ? ` · ${t.note}` : ""}</T>
              </View>
              <T w="semibold" style={{ fontSize: 14, color: isIn ? C.forest : isLate ? C.rust : C.ink2 }}>
                {isIn ? "+" : "−"}₹{Math.abs(t.amount).toLocaleString("en-IN")}
              </T>
            </Card>
          );
        })}
      </View>
    </TabScreen>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: tone ? C.rustSoft : C.surface, borderWidth: 1, borderColor: tone ? "#F1D4CD" : C.line2, borderRadius: 18, padding: 12 }}>
      <Eyebrow style={{ fontSize: 10, color: tone ? "#8B3324" : C.ink3 }}>{label}</Eyebrow>
      <Text style={{ fontFamily: F.display, fontSize: 20, marginTop: 4, letterSpacing: -0.5, color: tone ? "#8B3324" : C.ink }}>{value}</Text>
    </View>
  );
}
