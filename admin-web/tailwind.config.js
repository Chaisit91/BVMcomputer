/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Post-login transition: an opaque panel slides fully up to cover the
        // screen before navigate() fires, so the hand-off to the dashboard
        // happens while the viewport is solid-covered — no ghosted form
        // showing through underneath, no hard cut the eye catches mid-motion.
        "slide-cover": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        "welcome-content-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "welcome-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-cover": "slide-cover 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "welcome-content-in": "welcome-content-in 500ms ease-out 450ms forwards",
        "welcome-zoom": "welcome-zoom 1800ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
