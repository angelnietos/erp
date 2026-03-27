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
            // Domain cores can only depend on other domain cores or shared libs
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:shared', 'type:utils'],
            },
            // Data access can depend on domain cores and shared
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:domain', 'type:data-access', 'type:shared'],
            },
            // Feature and shell can depend on data-access and shared
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:feature', 'type:data-access', 'type:shell', 'type:shared'],
            },
            {
              sourceTag: 'type:shell',
              onlyDependOnLibsWithTags: ['type:shell', 'type:feature', 'type:shared'],
            },
            // Shared libs can only depend on other shared libs
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // Apps can depend on any library
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            // Temporary catch-all to avoid blocking projects that still have empty/missing tags.
            // Once all project.json files are tagged, this can be removed.
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      // Restrict relative imports that go too deep
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            // Permit local relative imports within the same project,
            // but block climbing multiple directories which usually crosses project boundaries
            { group: ['../../*', '../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
            { group: ['../../../*', '../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
            { group: ['../../../../*', '../../../../**/*'], message: 'Use @josanz-erp/* alias for cross-project imports' },
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
