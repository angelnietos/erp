import type { StorybookConfig } from '@storybook/angular';

/**
 * Nx runs Storybook via `@nx/storybook:storybook` (CLI), not the Angular architect builder.
 * `angularBrowserTarget` + `tsConfig` must live here so `@storybook/angular` can merge Angular CLI
 * webpack options (styles, TS path mappings) from the library's `build` target.
 */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {
      enableI18nLegacyMessageIdFormat: false,
    },
  },
  angularBrowserTarget: 'ui-kit:build',
  tsConfig: 'libs/browser/shared/ui-kit/tsconfig.lib.json',
} satisfies StorybookConfig;

export default config;
