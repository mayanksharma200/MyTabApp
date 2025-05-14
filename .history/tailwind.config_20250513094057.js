/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./(tabs)/**/*.{js,jsx,ts,tsx}", // if you have a (tabs) folder for routes/layouts
    "./screens/**/*.{js,jsx,ts,tsx}", // if you have a screens folder
    "./pages/**/*.{js,jsx,ts,tsx}", // if you have a pages folder
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
