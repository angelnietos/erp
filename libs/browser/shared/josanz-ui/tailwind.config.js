const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src/**/*.{html,ts}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          muted: '#1e40af',
          glow: 'rgba(37, 99, 235, 0.2)',
        },
      },
      fontFamily: {
        main: ['Nunito', 'sans-serif'],
        display: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
