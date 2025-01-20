/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  globalSetup: './src/test/setup/jest-setup.ts',
  globalTeardown: './src/test/setup/jest-teardown.ts',
  setupFilesAfterEnv: ['./src/test/setup/jest.setup.ts'],
  coveragePathIgnorePatterns: ['.config.ts'],
  preset: 'ts-jest',
  testTimeout: process.env.CI ? 120_000 : 12_000,
  transform: {
    '^.+\\.test.ts?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/e2e/', '/node_modules/', '/dist/'],
  // Run tests serially on local machine to avoid race conditions on docker resources
  ...(!process.env.CI && { maxWorkers: 1 }),
};

export default config;
