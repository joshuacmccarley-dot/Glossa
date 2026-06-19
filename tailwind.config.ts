import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black:  "#080808",
          surface: "#111111",
          card:   "#161616",
          border: "#222222",
          red:    "#c41230",
          "red-bright": "#e01535",
          blue:   "#1a3a8f",
          "blue-bright": "#2248b0",
          silver: "#c0c0c0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "glow-pulse":  "glowPulse 6s ease-in-out infinite",
        "float":       "float 4s ease-in-out infinite",
        "fade-up":     "fadeUp 0.6s ease-out forwards",
        "shimmer":     "shimmer 2s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%":      { opacity: "0.9", transform: "scale(1.08)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to:   { backgroundPosition: "-200% 0" },
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid": "32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
