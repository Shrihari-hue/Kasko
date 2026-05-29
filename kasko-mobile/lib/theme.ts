/** Kasko design tokens — mirrors the web app. */
export const C = {
  paper: "#FAFAF7",
  paperWarm: "#F4F1EC",
  surface: "#FFFFFF",
  ink: "#0F1419",
  ink2: "#404652",
  ink3: "#6B7280",
  ink4: "#9CA3AF",
  line: "#E8E4DC",
  line2: "#EFEBE3",
  forest: "#1B5E3F",
  forestDeep: "#0E4329",
  mint: "#E8F3EE",
  gold: "#B8915C",
  goldSoft: "#F5EBDA",
  rust: "#C8553D",
  rustSoft: "#FBE9E4",
  amber: "#D9A441",
  amberSoft: "#FBF1DC",
  outerBg: "#EDEAE3",
};

export const F = {
  // loaded in app/_layout.tsx
  display: "Fraunces_500Medium",
  displaySemi: "Fraunces_600SemiBold",
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_900Black",
};

export const fmtINR = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
