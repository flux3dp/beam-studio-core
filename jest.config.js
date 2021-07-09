module.exports = {
  preset: "ts-jest",
  testMatch: [
    "**/?(*.)+(spec|test).(ts|tsx)"
  ],
  collectCoverageFrom: [
    "src/**/*.(ts|tsx)",
    "!src/web/setupTests.ts",
    "!src/web/app/svgedit/**",
    "!src/web/app/actions/beambox/svg-editor.ts",
    "!src/web/app/lang/**",
    "!src/implementations/**"
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
