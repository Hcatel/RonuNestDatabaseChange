/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff4d00',
        accent: '#008080',
        background: '#fefefe'
      }
    },
  },
  plugins: [],
};