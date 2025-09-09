// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  console.log('Uncaught exception:', err.message)
  return false
})

// Custom logging
Cypress.on('fail', (error, mocha) => {
  console.error('Test failed:', error.message)
  throw error
})

// Performance monitoring
Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    cy.task('log', `❌ FAILED: ${test.title}`)
  } else {
    cy.task('log', `✅ PASSED: ${test.title}`)
  }
})

// Global test data
before(() => {
  // Set up global test data
  cy.task('log', '🚀 Starting FlavorWheel E2E Test Suite')
  cy.task('log', `📊 Base URL: ${Cypress.config('baseUrl')}`)
  cy.task('log', `🖥️  Viewport: ${Cypress.config('viewportWidth')}x${Cypress.config('viewportHeight')}`)
})

// Clean up after all tests
after(() => {
  cy.task('log', '🏁 FlavorWheel E2E Test Suite Complete')
})

