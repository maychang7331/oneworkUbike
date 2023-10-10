/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF9D18',
        // secondary: '#ecc94b',
        // ...
      },
    },
  },
  plugins: [],
};
