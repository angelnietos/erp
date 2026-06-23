/** @type {import('jest').Config} */
module.exports = {
  displayName: 'shared-browser-data-access',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../../../coverage/libs/browser/shared/data-access',
};
