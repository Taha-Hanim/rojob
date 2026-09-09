/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        porcelain: "#F3EFE7",
        crimson: "#9C1D2D",
        midnight: "#0D1A2F",
        charcoal: "#34373A",
        black: "#111111",
      },
      fontFamily: {
        serif: ['"Libre Bodoni"', '"Cormorant Garamond"', "Georgia", "serif"],
        display: ['"Libre Bodoni"', "Georgia", "serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
