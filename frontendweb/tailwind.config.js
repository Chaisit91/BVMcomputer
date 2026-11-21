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
        sans: ['"Noto Sans Thai"', 'system-ui', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(11, 18, 32, 0.12)',
      },
      // Enter/exit animations for Radix dialogs (driven by data-[state=open|closed]).
      // Radix keeps the element mounted until the exit animation ends.
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out',
        'fade-out': 'fade-out 300ms ease-out forwards',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-out-right': 'slide-out-right 300ms ease-out forwards',
      },
    },
  },
  plugins: [],
};