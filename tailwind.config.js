import { colors } from "@/assets/colors.ts";
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#039855",
        secondary: "#F6FFF3",
      },
    },
  },
  plugins: [],
};
