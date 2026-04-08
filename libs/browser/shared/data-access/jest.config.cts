export default {
  displayName: 'shared-data-access',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/browser/shared/data-access',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  testEnvironment: 'node',
};
