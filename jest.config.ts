import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // collectCoverageFrom: ["packages/**/*.{ts,tsx}"],
  // coveragePathIgnorePatterns: ["jest.config.ts", "/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@flink/(.*)$": "<rootDir>/packages/$1/",
  },
  // testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.+(spec|test).ts?(x)"],
  projects: [
    {
      preset: "ts-jest",
      testEnvironment: "node",
      displayName: "actions",
      testMatch: ["<rootDir>/packages/actions/test/**/*.test.ts"],
    },
  ],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
    },
  },
};
export default config;
