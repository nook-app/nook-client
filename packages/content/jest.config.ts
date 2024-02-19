import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  verbose: true,
  moduleNameMapper: {
    "^@nook/actions/(.*)$": "<rootDir>/$1",
  },
};
export default config;
