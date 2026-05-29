import React from "react";
import {
  View, Text, Pressable, TextInput, ActivityIndicator,
  StyleProp, ViewStyle, TextStyle, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { C, F } from "@/lib/theme";

/* Screen wrapper: safe area + paper bg + scroll */
export function Screen({ children, dark = false, scroll = true }: { children: React.ReactNode; dark?: boolean; scroll?: boolean }) {
  const bg = dark ? C.ink : C.paper;
  const inner = (
    <View style={{ flex: 1, paddingHorizontal: 22 }}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 22 }}>
          {children}
        </ScrollView>
      ) : inner}
    </SafeAreaView>
  );
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontFamily: F.semibold, fontSize: 11, letterSpacing: 1.4, color: C.ink3, textTransform: "uppercase" }, style]}>
      {children}
    </Text>
  );
}

export function Display({ children, size = 40, style }: { children: React.ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ fontFamily: F.display, fontSize: size, color: C.ink, letterSpacing: -0.5 }, style]}>{children}</Text>;
}

export function T({ children, style, w }: { children: React.ReactNode; style?: StyleProp<TextStyle>; w?: keyof typeof F }) {
  return <Text style={[{ fontFamily: w ? F[w] : F.body, fontSize: 15, color: C.ink }, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line2, borderRadius: 22, padding: 20 }, style]}>
      {children}
    </View>
  );
}

type BtnVariant = "primary" | "forest" | "soft" | "ghost";
export function Button({
  label, onPress, variant = "primary", busy, disabled, icon, style,
}: {
  label: string; onPress?: () => void; variant?: BtnVariant; busy?: boolean; disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap; style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || busy;
  const bg = off ? C.line : variant === "forest" ? C.forest : variant === "soft" ? C.paperWarm : variant === "ghost" ? "transparent" : C.ink;
  const fg = off ? C.ink4 : variant === "soft" ? C.ink : variant === "ghost" ? C.ink3 : C.paper;
  return (
    <Pressable
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg, borderRadius: 999, paddingVertical: 17,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.99 : 1 }],
        },
        style,
      ]}
    >
      {busy ? <ActivityIndicator color={fg} /> : (
        <>
          <Text style={{ fontFamily: F.semibold, fontSize: 15, color: fg }}>{label}</Text>
          {icon ? <Feather name={icon} size={18} color={fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Field(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={C.ink4}
      {...props}
      style={[
        { backgroundColor: C.paperWarm, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, fontSize: 16, fontFamily: F.medium, color: C.ink },
        props.style,
      ]}
    />
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: C.line2 }, style]} />;
}

export function IconCircle({ name, bg = C.paperWarm, color = C.ink, size = 18, dim = 40 }: {
  name: keyof typeof Feather.glyphMap; bg?: string; color?: string; size?: number; dim?: number;
}) {
  return (
    <View style={{ width: dim, height: dim, borderRadius: dim / 3, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>{children}</View>;
}

/* Brand logo mark */
export function Logo({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <Row style={{ gap: 10 }}>
      <View style={{ width: size, height: size, borderRadius: size / 3.2, backgroundColor: dark ? C.paper : C.ink, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: F.display, fontSize: size * 0.6, color: dark ? C.ink : C.paper }}>K</Text>
      </View>
      <Text style={{ fontFamily: F.displaySemi, fontSize: 26, color: dark ? C.paper : C.ink, letterSpacing: -0.5 }}>Kasko</Text>
    </Row>
  );
}
