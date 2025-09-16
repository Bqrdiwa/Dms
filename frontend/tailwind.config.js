// tailwind.config.js
const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        default:{
          DEFAULT:"#fff"
        },
        primary: {
          DEFAULT: "#005299",
          50: "#dcf4ff",
          100: "#afdbff",
          200: "#7ec4ff",
          300: "#4dacff",
          400: "#2194fe",
          500: "#0c7be5",
          600: "#0060b3",
          700: "#004481",
          800: "#002950",
          900: "#000f20",
          foreground: "#fff",
        },
        secondary: {
          DEFAULT: "#000E1A",
          50: "#e5f3ff",
          100: "#b9dbfa",
          200: "#8bc3f7",
          300: "#5facf6",
          400: "#3d95f5",
          500: "#2f7cdc",
          600: "#2460ab",
          700: "#194579",
          800: "#0b2949",
          900: "#000e1a",
          foreground: "#fff",
        },
      },
    },
  },
  plugins: [heroui()],
};
