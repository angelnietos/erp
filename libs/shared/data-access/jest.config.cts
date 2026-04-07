export default {
  displayName: 'shared-data-access',
  preset: '../../../jest.preset.js',
  config: {
    transform: {
      '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/libs/shared/data-access',
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    testEnvironment: 'node',
  },
};

