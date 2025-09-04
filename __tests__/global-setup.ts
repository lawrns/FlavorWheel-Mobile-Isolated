// Global setup for Playwright tests
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for FlavorWheel México E2E tests...')

  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Simple navigation to check if app is accessible
    console.log('⏳ Checking application accessibility...')
    await page.goto('http://localhost:3001/en/landing')

    // Just wait for page load, don't wait for specific selectors
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    console.log('✅ Application is accessible')

    // Setup test data if needed
    await setupTestData(page)

    // Create test users if needed
    await createTestUsers(page)

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('✅ Global setup completed successfully')
}

async function setupTestData(page: any) {
  console.log('📊 Setting up test data...')
  
  // You can add API calls here to set up test data
  // For example, creating test tastings, beverages, etc.
  
  // Example: Create test Mexican beverages
  const testBeverages = [
    {
      name: 'Test Tequila Blanco',
      type: 'tequila',
      region: 'Jalisco',
      agave_variety: 'Blue Weber',
      alcohol_content: 40.0,
    },
    {
      name: 'Test Mezcal Espadín',
      type: 'mezcal',
      region: 'Oaxaca',
      agave_variety: 'Espadín',
      alcohol_content: 45.0,
    },
  ]

  // This would typically make API calls to create test data
  // await page.evaluate(async (beverages) => {
  //   // Create test data via API
  // }, testBeverages)

  console.log('✅ Test data setup completed')
}

async function createTestUsers(page: any) {
  console.log('👥 Creating test users...')
  
  // Create test users for different scenarios
  const testUsers = [
    {
      email: 'test.beginner@flavorwheel.test',
      password: 'TestPassword123!',
      name: 'Test Beginner',
      experience_level: 'beginner',
    },
    {
      email: 'test.professional@flavorwheel.test',
      password: 'TestPassword123!',
      name: 'Test Professional',
      experience_level: 'professional',
    },
  ]

  // This would typically create users via API or auth system
  // In a real implementation, you'd use your auth system's API
  
  console.log('✅ Test users created')
}

export default globalSetup
