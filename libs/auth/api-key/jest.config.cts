export default {
  displayName: 'auth-api-key',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'json'],
  coverageDirectory: '../../../../coverage/libs/auth/api-key',
  testMatch: ['**/+([(?!.|-)[^_ih]|^[^_])*.spec.ts'],
};
