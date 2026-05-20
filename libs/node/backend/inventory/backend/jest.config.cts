module.exports = {
  displayName: 'inventory-backend',
  preset: '../../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../../coverage/libs/node/backend/inventory/backend',
  testMatch: ['**/__tests__/**/*.[jt]s?(c)', '**/?(*.)+(spec|test).[jt]s?(c)'],
};
