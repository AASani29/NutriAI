/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FFB88C',      // Warm peach/coral - fresh, healthy, inviting
        secondary: '#D2691E',    // Rich terracotta/chocolate - earthy, natural
        background: '#FFF8F0',   // Warm cream - soft, welcoming
      },
      fontFamily: {
        operetta: ['"operetta"', 'sans-serif'], // fallback is important
      },
    },
  },
  safelist: [
    'from-primary',
    'to-orange-900',
    'bg-gradient-to-r',
  ],
}