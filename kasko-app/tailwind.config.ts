import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper:      "#FAFAF7",
        paperWarm:  "#F4F1EC",
        surface:    "#FFFFFF",
        ink:        "#0F1419",
        ink2:       "#404652",
        ink3:       "#6B7280",
        ink4:       "#9CA3AF",
        line:       "#E8E4DC",
        line2:      "#EFEBE3",
        forest:     "#1B5E3F",
        forestDeep: "#0E4329",
        mint:       "#E8F3EE",
        mintDeep:   "#C9E4D4",
        gold:       "#B8915C",
        goldSoft:   "#F5EBDA",
        rust:       "#C8553D",
        rustSoft:   "#FBE9E4",
        amber:      "#D9A441",
        amberSoft:  "#FBF1DC",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans:    ['"Inter"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.025em",
      },
    },
  },
  plugins: [],
};
export default config;
