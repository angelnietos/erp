/* eslint-disable */
module.exports = {
  displayName: 'verifactu-adapters',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'mjs'],
  coverageDirectory: '../../../coverage/libs/verifactu/adapters',
};
