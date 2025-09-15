/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
};
