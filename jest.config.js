module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  testMatch: [
    '**/?(*.)+(spec|test).(ts|tsx)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'src/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    "^.+.css$": 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/web/setupTests.ts',
    '!src/web/app/svgedit/**',
    '!src/web/app/actions/beambox/svg-editor.ts',
    '!src/web/app/lang/**',
    '!src/implementations/**',
    '!src/web/app/constants/**',
    // TODO: write unit test for symbol-maker and remove below line
    '!src/web/helpers/symbol-maker.ts',
    '!src/**/*.worker.ts',
  ],
  setupFilesAfterEnv: ['./src/web/setupTests.ts'],
  moduleDirectories: ['node_modules', 'src/web', 'src'],
  coverageReporters: ['text-summary', 'html']
}
