const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'flavorwheel-mexico-e2e',
  e2e: {
    baseUrl: 'http://localhost:3010',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    video: true,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,
    experimentalStudio: true,
    experimentalRunAllSpecs: true,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })

      return config
    },
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    API_URL: 'http://localhost:3010',
    TEST_USER_EMAIL: 'test@flavorwheel.com',
    TEST_USER_PASSWORD: 'TestPassword123!',
  },
})

