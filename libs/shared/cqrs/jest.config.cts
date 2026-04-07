export default {
  displayName: 'shared-cqrs',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtension: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/libs/shared/cqrs',
  testMatch: ['**/+([(?!.|-)[^_ih]|^[^_])*.spec.ts'],
};

