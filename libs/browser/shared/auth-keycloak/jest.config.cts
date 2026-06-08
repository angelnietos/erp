export default {
  displayName: 'shared-auth-keycloak',
  preset: '../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', stringifyContentPathRegex: '\\.html$' }],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs', 'json'],
  coverageDirectory: '../../coverage/libs/browser/shared/auth-keycloak',
  passWithNoTests: true,
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
};