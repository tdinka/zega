import type { Config } from "tailwindcss";

// Zega look: civic stationery. Navy ink on cool paper, marigold for progress
// and achievement, green (good) / red (wrong) only for right and wrong answers.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "#F5F7FA", 50: "#FBFCFD", 200: "#E8ECF2" },
        ink: { DEFAULT: "#13213A", soft: "#46536A", faint: "#7B869A" },
        line: "#D7DDE7",
        navy: { DEFAULT: "#1D3A6B", dark: "#152B51", 50: "#E8EEF8" },
        marigold: { DEFAULT: "#D9961A", dark: "#A8720F", 50: "#FBF1DE" },
        good: { DEFAULT: "#1E7B4F", 50: "#E4F3EB" }, // right answers (not "right": that name clashes with text-right alignment)
        wrong: { DEFAULT: "#B3261E", 50: "#FCEBEA" },
      },
      fontFamily: {
        display: ['"Source Serif 4 Variable"', '"Noto Sans Ethiopic"', "Georgia", "serif"],
        sans: ['"Public Sans Variable"', '"Noto Sans Ethiopic"', "ui-sans-serif", "system-ui", "sans-serif"],
        ethi: ['"Noto Sans Ethiopic"', '"Public Sans Variable"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
