import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: "#111311",
          card: "#1E201C",
          border: "#332E22",
          copper: "#D8A25E",
          sage: "#7A9D7E",
          cream: "#F5F0E8",
          greige: "#9C9589",
          mustard: "#E6B037",
          rust: "#CD5C5C"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(216, 162, 94, 0.18), 0 18px 60px rgba(0, 0, 0, 0.35)"
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "fade-in-up-sm": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(100%)" }
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "highlight-pulse": {
          "0%": { backgroundColor: "rgba(216, 162, 94, 0.15)", boxShadow: "0 0 0 1px rgba(216, 162, 94, 0.3)" },
          "30%": { backgroundColor: "rgba(216, 162, 94, 0.10)", boxShadow: "0 0 0 1px rgba(216, 162, 94, 0.15)" },
          "100%": { backgroundColor: "transparent", boxShadow: "0 0 0 0px transparent" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "fade-in-up-sm": "fade-in-up-sm 0.35s ease-out forwards",
        "fade-in-up": "fade-in-up 0.35s ease-out forwards",
        "slide-in-right": "slide-in-right 0.35s ease-out forwards",
        "slide-out-right": "slide-out-right 0.25s ease-in forwards",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "slide-out-left": "slide-out-left 0.2s ease-in forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "highlight-pulse": "highlight-pulse 3s ease-out forwards",
        shimmer: "shimmer 1.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
