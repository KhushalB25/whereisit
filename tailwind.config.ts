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
      fontFamily: {
        display: ['"Instrument Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        body: ['"DM Sans"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        crimson: {
          950: '#0A0806',
          900: '#121212',
          800: '#1c1c1c',
          700: '#262626',
          600: '#333333',
          500: '#404040',
        },
        blood: {
          DEFAULT: '#dc2626',
          deep: '#991b1b',
          dark: '#450a0a',
          muted: 'rgba(220, 38, 38, 0.1)',
          glow: 'rgba(220, 38, 38, 0.3)',
        },
        gold: {
          DEFAULT: '#C8A84E',
          light: '#E8D4A0',
          deep: '#A8882E',
          dim: 'rgba(200, 168, 78, 0.1)',
        },
        ink: {
          DEFAULT: '#1A1410',
          light: '#2A2420',
        },
        parchment: '#F0EDE8',
        burgundy: '#7A1A1A',
      },
      backgroundImage: {
        'gradient-blood': 'linear-gradient(135deg, #dc2626, #991b1b)',
        'gradient-gold': 'linear-gradient(135deg, #C8A84E, #A8882E)',
        'gradient-gold-subtle': 'linear-gradient(180deg, rgba(200,168,78,0.08), transparent)',
        'gradient-card': 'linear-gradient(180deg, rgba(220,38,38,0.08), transparent)',
        'gradient-glow': 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.12) 0%, transparent 70%)',
        'gradient-gold-glow': 'radial-gradient(ellipse at 50% 0%, rgba(200,168,78,0.08) 0%, transparent 70%)',
        'gradient-ember': 'radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(200, 168, 78, 0.18), 0 18px 60px rgba(0, 0, 0, 0.35)',
        'red-glow': '0 0 20px rgba(220,38,38,0.3), 0 0 40px rgba(220,38,38,0.1)',
        'red-sm': '0 0 10px rgba(220,38,38,0.2)',
        'gold-glow': '0 0 20px rgba(200,168,78,0.25), 0 0 40px rgba(200,168,78,0.08)',
        'gold-sm': '0 0 10px rgba(200,168,78,0.15)',
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
        'card-hover': '0 0 0 1px rgba(220,38,38,0.3), 0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(220,38,38,0.08)',
        'card-gold-hover': '0 0 0 1px rgba(200,168,78,0.3), 0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(200,168,78,0.08)',
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
          "0%": { backgroundColor: "rgba(200, 168, 78, 0.15)", boxShadow: "0 0 0 1px rgba(200, 168, 78, 0.3)" },
          "30%": { backgroundColor: "rgba(200, 168, 78, 0.10)", boxShadow: "0 0 0 1px rgba(200, 168, 78, 0.15)" },
          "100%": { backgroundColor: "transparent", boxShadow: "0 0 0 0px transparent" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        pulseRed: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" }
        },
        pulseGold: {
          "0%, 100%": { opacity: "0.4", boxShadow: "0 0 0 0 rgba(200,168,78,0.4)" },
          "50%": { opacity: "1", boxShadow: "0 0 8px rgba(200,168,78,0.6)" }
        },
        drift: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "33%": { transform: "translateY(-8px) translateX(4px)" },
          "66%": { transform: "translateY(4px) translateX(-4px)" }
        },
        ember: {
          "0%, 100%": { opacity: "0.2", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.08)" }
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(2px, -2px)" },
          "60%": { transform: "translate(-1px, -1px)" },
          "80%": { transform: "translate(1px, 1px)" }
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
        shimmer: "shimmer 1.5s linear infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-red": "pulseRed 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
        ember: "ember 6s ease-in-out infinite",
        glitch: "glitch 0.3s ease-in-out",
      }
    }
  },
  plugins: []
};

export default config;
