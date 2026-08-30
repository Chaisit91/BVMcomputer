/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e2001a',
          light: '#ff2d3f',
          dark: '#b3000f',
        },
        ink: {
          DEFAULT: '#0b1220',
          light: '#141d33',
          lighter: '#1c2742',
        },
      },
      fontFamily: {
        sans: ['"Prompt"', 'system-ui', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(11, 18, 32, 0.12)',
      },
    },
  },
  plugins: [],
};