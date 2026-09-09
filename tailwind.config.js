/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0D1A2F",
        porcelain: "#F3EFE7",
        crimson: "#9C1D2D",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
