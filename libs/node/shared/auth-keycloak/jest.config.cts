export default {
  displayName: 'auth-keycloak',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  coverageDirectory: '../../coverage/libs/node/shared/auth-keycloak',
  passWithNoTests: true,
};