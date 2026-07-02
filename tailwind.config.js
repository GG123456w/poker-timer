/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          gold: '#ffd700',
          bronze: '#cd7f32',
        }
      },
    },
  },
  plugins: [],
}
