module.exports = {
  preset: "ts-jest",
  testMatch: [
    "**/?(*.)+(spec|test).(ts|tsx)"
  ],
  collectCoverageFrom: [
    "src/**/*.(ts|tsx)"
  ],
  globals: {
    "ts-jest": {
      tsconfig: "src/tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["./src/web/setupTests.ts"],
  moduleDirectories: ["node_modules", "src/web", "src"],
  coverageReporters: ["text-summary", "html"]
}
