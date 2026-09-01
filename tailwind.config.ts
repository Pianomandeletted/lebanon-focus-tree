import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"]
      },
      colors: {
        cedar: {
          950: "#070c12",
          900: "#0b1420",
          800: "#0f2436",
          700: "#16324a",
          600: "#1f4460"
        },
        flag: {
          red: "#A32638",
          redlight: "#C8465A"
        },
        gold: {
          DEFAULT: "#C9A24B",
          light: "#E4C878"
        },
        ink: {
          100: "#E8EDF2",
          300: "#B7C3D0",
          500: "#6E8299"
        },
        status: {
          complete: "#3FA772",
          completing: "#C9A24B",
          incomplete: "#3E5872",
          impossible: "#8A3A45"
        }
      },
      boxShadow: {
        node: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.45)",
        glow: "0 0 24px rgba(201,162,75,0.35)"
      }
    }
  },
  plugins: []
};
export default config;
