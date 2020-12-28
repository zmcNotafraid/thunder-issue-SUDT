module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest"
  },
  transformIgnorePatterns: ['/node_modules/(?!lodash-es). \\.js$'],
  setupFiles: ["jest-localstorage-mock", '<rootDir>/tests/unit/setups/setup.ts']
}
