import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'
],
          depConstraints: [
            // Core domain libraries
            {
              sourceTag: 'type:core',
              onlyDependOnLibsWithTags: [
                'type:core',
                'type:model',
                'type:utils',
                'type:events',
                'type:config',
                'type:cqrs',
                'scope:shared',
              ],
            },
            // Data access and integrations
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:core',
                'type:api',
                'type:model',
                'type:utils',
                'type:events',
                'type:config',
                'type:cqrs',
                'type:integrations',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:integrations',
              onlyDependOnLibsWithTags: ['type:integrations', 'type:utils', 'type:config', 'type:model', 'scope:shared'],
            },
            // Feature and shell layers
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:data-access',
                'type:api',
                'type:core',
                'type:model',
                'type:ui',
                'type:utils',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:shell',
              onlyDependOnLibsWithTags: [
                'type:shell',
                'type:feature',
                'type:data-access',
                'type:api',
                'type:core',
                'type:model',
                'type:ui',
                'type:utils',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'type:api',
              onlyDependOnLibsWithTags: ['type:api', 'type:model', 'type:utils', 'scope:shared'],
            },
            {
              sourceTag: 'type:backend',
              onlyDependOnLibsWithTags: [
                'type:backend',
                'type:core',
                'type:model',
                'type:data-access',
                'type:cqrs',
                'type:api',
                'type:utils',
                'type:events',
                'type:config',
                'type:integrations',
                'type:adapters',
                'scope:shared',
              ],
            },
            // Shared scope remains isolated
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Apps and Backend-scoped projects can depend on any library
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'scope:backend',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['libs/**/*.ts', 'libs/**/*.tsx', 'libs/**/*.js', 'libs/**/*.jsx'],
    rules: {
      // Allow internal relative imports within libs but prevent deep cross-project imports.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../../../../*', '../../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
            { group: ['../../../../../*', '../../../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
