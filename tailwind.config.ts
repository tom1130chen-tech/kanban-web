import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fdfbf7",
        pencil: "#2d2d2d",
        muted: "#e5e0d8",
        accent: "#ff4d4d",
        penblue: "#2d5da1",
        postit: "#fff9c4",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        hard: "4px 4px 0px 0px #2d2d2d",
        hardSm: "2px 2px 0px 0px #2d2d2d",
        hardLg: "8px 8px 0px 0px #2d2d2d",
      },
    },
  },
  plugins: [],
} satisfies Config;
