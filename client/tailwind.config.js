/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Your existing colors (keeping these)
        primary: {
          light: "#00DC82",
          DEFAULT: "#00DC82",
          dark: "#00b368",
        },
        dark: {
          bg: "#0D1117",
          secondary: "#161B22",
          border: "#30363D",
        },
        light: {
          bg: "#FFFFFF",
          secondary: "#F6F8FA",
          border: "#D0D7DE",
        },

        // New green palette colors for the redesign
        black: {
          DEFAULT: "#020202",
          100: "#010101",
          200: "#010101",
          300: "#020202",
          400: "#020202",
          500: "#020202",
          600: "#353535",
          700: "#686868",
          800: "#9a9a9a",
          900: "#cdcdcd",
        },
        dark_green: {
          DEFAULT: "#0d2818",
          100: "#020805",
          200: "#050f09",
          300: "#07170e",
          400: "#0a1f12",
          500: "#0d2818",
          600: "#236c40",
          700: "#39b169",
          800: "#74d29a",
          900: "#bae9cc",
        },
        pakistan_green: {
          DEFAULT: "#04471c",
          100: "#010e06",
          200: "#021d0b",
          300: "#032b11",
          400: "#033a16",
          500: "#04471c",
          600: "#099a3c",
          700: "#0eec5c",
          800: "#5bf591",
          900: "#adfac8",
        },
        sea_green: {
          DEFAULT: "#058c42",
          100: "#011c0d",
          200: "#02371a",
          300: "#035327",
          400: "#046e34",
          500: "#058c42",
          600: "#08d162",
          700: "#2af787",
          800: "#71faaf",
          900: "#b8fcd7",
        },
        malachite: {
          DEFAULT: "#16db65",
          100: "#042c14",
          200: "#095728",
          300: "#0d833c",
          400: "#11af50",
          500: "#16db65",
          600: "#3aec81",
          700: "#6bf0a1",
          800: "#9df5c0",
          900: "#cefae0",
        },
      },

      // Add custom animations
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
      },

      // Add custom keyframes for animations
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(22, 219, 101, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(22, 219, 101, 0.6)" },
        },
        "slide-in-right": {
          from: {
            opacity: "0",
            transform: "translateX(30px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-left": {
          from: {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
