/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandOrange: "#f59e0b",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        brandOrange: "0 4px 14px rgba(245, 158, 11, 0.7)",
      },
    },
  },
  plugins: [],
};
