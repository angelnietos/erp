import baseConfig from '../../../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      // Dependencias en el package.json raíz del monorepo.
      '@nx/dependency-checks': 'off',
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
