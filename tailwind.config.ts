import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — pulled from logo
        brand: {
          navy:    "#0d1b2a", // darkest background
          surface: "#0f2338", // card / nav surfaces
          border:  "#1a3a5c", // subtle borders
          cyan:    "#00d4ff", // primary accent (DNA helix / circuit lines)
          "cyan-dim": "#0ea5c9", // slightly muted cyan for hover states
          gold:    "#f59e0b", // secondary accent (circuit nodes)
          text:    "#e2f0fb", // primary text on dark
          muted:   "#93bdd4", // secondary / muted text
        },
        // Pipeline status badges
        status: {
          pending:   "#6b9ab8",
          running:   "#00d4ff",
          completed: "#22c55e",
          failed:    "#ef4444",
          cancelled: "#f59e0b",
          deleted:   "#4b5563",
        },
      },
      boxShadow: {
        cyan: "0 0 12px 0 rgba(0, 212, 255, 0.25)",
        "cyan-sm": "0 0 6px 0 rgba(0, 212, 255, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
