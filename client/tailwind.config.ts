/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    theme: {
      extend: {
        colors: {
          primary: '#D2E823',
          secondary: '#82CBE6',
          background: '#EAF6FA',
        },
      },
    },
    safelist: [
      'from-primary',
      'to-orange-900',
      'bg-gradient-to-r',
    ],
  }