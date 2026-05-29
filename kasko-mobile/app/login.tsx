import { View, Text } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Screen, Logo, Eyebrow, Display, T, Field, Button, Row } from "@/components/ui";
import { useApp } from "@/lib/store";
import { C, F } from "@/lib/theme";

export default function Login() {
  const { phone, setPhone, requestOtp, busy, error } = useApp();
  const valid = phone.replace(/\D/g, "").length === 10;

  async function submit() {
    try { await requestOtp(); router.push("/otp"); } catch {}
  }

  return (
    <Screen>
      <View style={{ paddingTop: 8 }}>
        <Logo />
        <View style={{ marginTop: 52 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Step 1 of 2</Eyebrow>
          <Display size={34} style={{ lineHeight: 38 }}>Welcome.{"\n"}Let&apos;s get you in.</Display>
          <T style={{ color: C.ink3, marginTop: 12, lineHeight: 22 }}>
            We&apos;ll send a one-time code to your mobile to verify it&apos;s really you.
          </T>
        </View>

        <View style={{ marginTop: 40 }}>
          <Eyebrow>Mobile number</Eyebrow>
          <Row style={{ marginTop: 12, gap: 8 }}>
            <View style={{ backgroundColor: C.paperWarm, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, justifyContent: "center" }}>
              <Text style={{ fontFamily: F.semibold, fontSize: 16, color: C.ink }}>+91</Text>
            </View>
            <Field
              style={{ flex: 1 }}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, ""))}
            />
          </Row>
        </View>

        {error ? <T style={{ color: C.rust, fontSize: 13, marginTop: 12 }}>{error}</T> : null}

        <Button label="Send verification code" icon="arrow-right" onPress={submit} disabled={!valid} busy={busy} style={{ marginTop: 28 }} />

        <Row style={{ marginTop: 36, gap: 10, alignItems: "flex-start" }}>
          <Feather name="lock" size={15} color={C.ink3} style={{ marginTop: 2 }} />
          <T style={{ flex: 1, fontSize: 12, color: C.ink3, lineHeight: 18 }}>
            By continuing you agree to Kasko&apos;s Terms of Service and Privacy Policy. We never share your number.
          </T>
        </Row>
      </View>
    </Screen>
  );
}
