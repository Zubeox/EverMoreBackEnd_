/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        boho: {
          cream: '#f5f1eb',
          sand: '#ede4d3',
          terracotta: '#d2691e',
          rust: '#cd853f',
          brown: '#8b4513',
          sage: '#9caf88',
          dusty: '#c4a484',
          warm: '#deb887',
        }
      },
      fontFamily: {
        'boho': ['Comfortaa', 'cursive'],
        'script': ['Dancing Script', 'cursive'],
      },
      borderRadius: {
        'boho': '25px',
      }
    },
  },
  plugins: [],
};
