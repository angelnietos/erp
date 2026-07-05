const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join, resolve } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    resolve(__dirname, 'libs/browser/shared/josanz-ui/tailwind.config.js'),
  ],
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

