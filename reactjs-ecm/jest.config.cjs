module.exports = {
    transform: {
      '^.+\\.(js|jsx|mjs)$': 'babel-jest',
    },
    moduleNameMapper: {
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/setupTests.js'] // Thử sử dụng setupFiles thay vì setupFilesAfterEnv
  };
  