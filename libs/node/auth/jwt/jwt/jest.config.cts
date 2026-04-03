export default {
  displayName: 'auth-jwt',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'json'],
  coverageDirectory: '../../../../coverage/libs/auth/jwt',
  testMatch: ['**/+([(?!.|-)[^_ih]|^[^_])*.spec.ts'],
};
