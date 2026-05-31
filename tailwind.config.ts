import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#5B3FFF",
          50: "#F1EEFF",
          100: "#E4DEFF",
          600: "#5B3FFF",
          700: "#4830CC",
        },
        ink: {
          900: "#0B0B10",
          700: "#26262F",
          500: "#5C5C66",
          400: "#7A7A85",
          300: "#A4A4AD",
        },
        line: "#ECECEF",
        canvas: "#F6F6F8",
        hot:  { bg: "#FFF1EC", fg: "#C8350C", bar: "#EF5A22" },
        warm: { bg: "#FFF5E0", fg: "#9A5A00", bar: "#E08A14" },
        cold: { bg: "#F2F2F4", fg: "#5C5C66", bar: "#9A9AA3" },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 15, 25, 0.04), 0 1px 3px rgba(15, 15, 25, 0.04)",
        frame:
          "0 30px 60px -20px rgba(20,20,40,0.18), 0 10px 30px -10px rgba(20,20,40,0.12)",
        tab: "0 -1px 0 #ECECEF",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      fontSize: {
        "11": ["11px", { lineHeight: "14px" }],
        "13": ["13px", { lineHeight: "18px" }],
      },
      letterSpacing: {
        tightish: "-0.005em",
      },
    },
  },
  plugins: [],
};

export default config;
