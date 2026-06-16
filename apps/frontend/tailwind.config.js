const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** Tailwind compartido: ERP clásico + utilidades Figma (sin preflight, no pisa styles.css). */
module.exports = {
  presets: [require('../../libs/browser/shared/josanz-ui/tailwind.config.js')],
  corePlugins: {
    preflight: false,
  },
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    join(__dirname, '../josanz-web-app/src/app/pages/josanz-*.{ts,html}'),
    join(__dirname, '../../libs/browser/feature/**/josanz/**/*.{ts,html}'),
    join(__dirname, '../../libs/browser/shared/josanz-ui/**/*.{ts,html}'),
    join(__dirname, '../../libs/browser/shared/ui-shell/**/*.{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
