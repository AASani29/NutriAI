/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: 'rgb(16 185 129 / <alpha-value>)',
          secondary: 'rgb(249 115 22 / <alpha-value>)',
          background: '#ffffff',
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