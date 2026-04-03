export default {
  displayName: 'delivery-core',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<tsconfig-dir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/delivery/core',
  testMatch: ['**/__tests__/**', '**/?(*.)+(spec|test).[tj]s+(?#?.*)$'],
};


