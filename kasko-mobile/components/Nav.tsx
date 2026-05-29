import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { C, F } from "@/lib/theme";

export function TopBar({ title, back, right }: { title?: string; back?: boolean; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 }}>
      {back ? (
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.paperWarm, alignItems: "center", justifyContent: "center" }}>
          <Feather name="arrow-left" size={20} color={C.ink} />
        </Pressable>
      ) : <View style={{ width: 40 }} />}
      <Text style={{ fontFamily: F.semibold, fontSize: 16, color: C.ink }}>{title ?? ""}</Text>
      <View style={{ width: 40, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

const TABS: { href: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { href: "/dashboard", label: "Home", icon: "home" },
  { href: "/history", label: "Activity", icon: "clock" },
  { href: "/profile", label: "Profile", icon: "user" },
  { href: "/help", label: "Help", icon: "help-circle" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-around", alignItems: "center",
      paddingVertical: 10, paddingBottom: 22, borderTopWidth: 1, borderTopColor: C.line2, backgroundColor: C.paper,
    }}>
      {TABS.map((t) => {
        const active = path === t.href;
        return (
          <Pressable key={t.href} onPress={() => router.replace(t.href as any)} style={{ alignItems: "center", gap: 3 }}>
            <Feather name={t.icon} size={22} color={active ? C.ink : C.ink4} />
            <Text style={{ fontFamily: F.semibold, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase", color: active ? C.ink : C.ink4 }}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
