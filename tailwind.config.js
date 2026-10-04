/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D0E",
        charcoal: "#15181A",
        ivory: "#F9F8F6",
        sand: "#E8E4DC",
        gold: {
          DEFAULT: "#C5A880",
          deep: "#9E7E50",
          muted: "#DFCBB5",
        },
        muted: "#71717A",
        success: "#10B981",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
