import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  verbose: true,
  moduleNameMapper: {
    "^@nook/(.*)$": "<rootDir>/../$1",
  },
};
export default config;
