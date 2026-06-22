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
        // Identidade PBR Brasil — preto/grafite fosco + dourado/âmbar
        ink: {
          900: "#08080a", // fundo principal
          800: "#0e0e11",
          700: "#15151a", // cards
          600: "#1d1d23", // cards elevados
          500: "#272730", // bordas
        },
        gold: {
          DEFAULT: "#F5B629",
          400: "#FFCB52",
          500: "#F5B629",
          600: "#D89A12",
        },
        alert: {
          DEFAULT: "#EF4444",
          soft: "#7f1d1d",
        },
        good: {
          DEFAULT: "#22C55E",
          soft: "#14532d",
        },
        warn: {
          DEFAULT: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-oswald)", "Impact", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(245, 182, 41, 0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -15px rgba(0,0,0,0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
