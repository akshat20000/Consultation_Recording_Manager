/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        astrology: {
          50: '#f5f3ff',
          100: '#edd8ff',
          200: '#d9b6ff',
          300: '#c084fc',
          400: '#a855f7',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1e1b4b', // Deep night indigo
        },
        accent: {
          gold: '#fbbf24', // Sun / Gold accent
          silver: '#e2e8f0',
          bronze: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
