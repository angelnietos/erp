export default {
  displayName: 'fleet-core',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<tsconfig-dir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/fleet/core',
  testMatch: ['**/__tests__/**', '**/?(*.)+(spec|test).[tj]s+(?#?.*)$'],
};



