import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/angular',
    options: {
      enableI18nLegacyMessageIdFormat: false,
    },
  },
  docs: {
    autodocs: true,
    defaultName: 'Documentación',
  },
};

export default config;
