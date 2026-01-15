/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: '#e6f4fb',
          secondary: '#1b5f79',
          background: '#eff3f6',
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