export default {
  displayName: 'shared-integrations-storage',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'json'],
  coverageDirectory: '../../../../coverage/libs/shared/integrations/storage',
  testMatch: ['**/+([(?!.|-)[^_ih]|^[^_])*.spec.ts'],
};
