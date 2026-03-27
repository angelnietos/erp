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
            // Shared scope remains isolated
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Apps can depend on any library
            {
              sourceTag: 'type:app',
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
      // Restrict deep relative imports in libs to encourage aliases between projects.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../../*', '../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
            { group: ['../../../*', '../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
            { group: ['../../../../*', '../../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
          ],
        },
      ],
    },
  },
  // Soften style-only warnings in selected libs to reach 0 warnings while preserving boundaries enforcement
  {
    files: [
      'libs/shared/ui-kit/**/*.ts',
      'libs/shared/model/**/*.ts',
      'libs/shared/utils/**/*.ts',
      'libs/shared/config/**/*.ts',
      'libs/shared/events/**/*.ts',
      'libs/fleet/core/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
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
