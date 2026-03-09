import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Status colours — consistent with ask.py terminal palette
        status: {
          pending: "#6b7280",   // gray-500
          running: "#3b82f6",   // blue-500
          completed: "#22c55e", // green-500
          failed: "#ef4444",    // red-500
          cancelled: "#f59e0b", // amber-500
          deleted: "#6b7280",   // gray-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
