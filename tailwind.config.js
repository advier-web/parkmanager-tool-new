/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        'even': '0 0 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}; 