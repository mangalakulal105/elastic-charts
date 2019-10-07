const merge = require('merge');
const tsPreset = require('ts-jest/jest-preset');
const jestPuppeteerDocker = require('jest-puppeteer-docker/jest-preset');

module.exports = merge(tsPreset, jestPuppeteerDocker, {
  setupFilesAfterEnv: ['<rootDir>/jest-env-setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.json',
    },
  },
});
