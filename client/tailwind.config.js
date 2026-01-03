/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Use Zinc for a modern, premium grey (better than standard gray)
        gray: colors.zinc,
        // Use Indigo for a professional primary brand color
        blue: colors.indigo, 
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}