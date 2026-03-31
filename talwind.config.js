/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Important for toggling
  theme: {
    extend: {
      colors: {
        'neon-orange': '#FF4E00',
        'neon-cyan': '#00D2FF',
        'neon-magenta': '#FF00E5',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}