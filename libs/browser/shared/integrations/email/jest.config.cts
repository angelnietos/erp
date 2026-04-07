export default {
  displayName: 'shared-integrations-email',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'json'],
  coverageDirectory: '../../../../coverage/libs/shared/integrations/email',
  testMatch: ['**/+([(?!.|-)[^_ih]|^[^_])*.spec.ts'],
};



