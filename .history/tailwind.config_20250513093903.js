/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"], // update paths as needed
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
