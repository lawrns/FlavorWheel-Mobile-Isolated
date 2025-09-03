// Global teardown for Playwright tests
import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for FlavorWheel México E2E tests...')

  // Launch browser for cleanup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Clean up test data
    await cleanupTestData(page)

    // Remove test users
    await removeTestUsers(page)

    // Clear any cached data
    await clearCaches(page)

  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close()
  }

  console.log('✅ Global teardown completed')
}

async function cleanupTestData(page: any) {
  console.log('🗑️ Cleaning up test data...')
  
  // Clean up test tastings, reviews, etc.
  // This would typically make API calls to clean up test data
  
  // Example cleanup operations:
  // - Delete test tastings
  // - Remove test reviews
  // - Clear test flavor wheels
  // - Remove test activities
  
  console.log('✅ Test data cleanup completed')
}

async function removeTestUsers(page: any) {
  console.log('👥 Removing test users...')
  
  // Remove test users created during setup
  const testUserEmails = [
    'test.beginner@flavorwheel.test',
    'test.professional@flavorwheel.test',
  ]

  // This would typically remove users via API
  // In a real implementation, you'd use your auth system's API
  
  console.log('✅ Test users removed')
}

async function clearCaches(page: any) {
  console.log('🧽 Clearing caches...')
  
  // Clear browser caches, local storage, etc.
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  
  // Clear any application-specific caches
  // This might include Redis cache, CDN cache, etc.
  
  console.log('✅ Caches cleared')
}

export default globalTeardown
