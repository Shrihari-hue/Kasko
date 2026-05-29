import { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Logo } from "@/components/ui";
import { getToken } from "@/lib/session";
import { C, F } from "@/lib/theme";

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(async () => {
      const token = await getToken();
      router.replace(token ? "/dashboard" : "/login");
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
      <Logo size={56} dark />
      <Text style={{ fontFamily: F.body, fontSize: 14, color: "rgba(250,250,247,0.6)", marginTop: 22 }}>
        Money when you need it.
      </Text>
      <View style={{ position: "absolute", bottom: 56, alignItems: "center", gap: 10 }}>
        <Feather name="shield" size={14} color="rgba(250,250,247,0.4)" />
        <Text style={{ fontFamily: F.semibold, fontSize: 10, letterSpacing: 1.6, color: "rgba(250,250,247,0.4)" }}>
          RBI-REGULATED · NBFC PARTNER
        </Text>
      </View>
    </View>
  );
}
