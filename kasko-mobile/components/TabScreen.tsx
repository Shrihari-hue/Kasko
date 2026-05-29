import React from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "./Nav";
import { C } from "@/lib/theme";

/** Screen layout for the 4 bottom-tab pages: scrollable body + fixed nav. */
export function TabScreen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.paper }} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {children}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}
