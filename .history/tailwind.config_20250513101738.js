/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", // all files inside app folder (routes, layouts, screens)
    "./components/**/*.{js,jsx,ts,tsx}", // all component files
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
