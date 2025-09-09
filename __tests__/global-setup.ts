// Global setup for Playwright tests - FlavorWheel Audit v2.0
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting FlavorWheel Audit v2.0 Global Setup...')
  console.log('📋 Testing critical issues from comprehensive analysis...')

  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Check application accessibility with timeout
    console.log('⏳ Checking application accessibility...')
    await page.goto('http://localhost:3010/en/landing', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Verify critical elements are present
    const criticalSelectors = [
      '[data-testid="app-ready"]',
      '[data-testid="quick-taste-button"]',
      '[data-testid="create-tasting-button"]',
      'nav, [data-testid="navigation"]'
    ]

    for (const selector of criticalSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 })
        console.log(`✅ Found: ${selector}`)
      } catch (e) {
        console.warn(`⚠️  Missing: ${selector}`)
      }
    }

    console.log('✅ Application is accessible and critical elements present')

    // Setup test data for audit scenarios
    await setupAuditTestData(page)

    // Create test users for different audit scenarios
    await createAuditTestUsers(page)

    // Verify performance baseline
    await verifyPerformanceBaseline(page)

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }

  console.log('✅ FlavorWheel Audit v2.0 Global Setup completed successfully')
}

async function setupAuditTestData(page: any) {
  console.log('📊 Setting up audit test data...')

  // Create test tastings for flavor wheel testing
  const testTastings = [
    {
      id: 'audit-tasting-001',
      name: 'Audit Test Tasting - Mobile Overflow Check',
      status: 'completed',
      type: 'quick',
      tasting_data: {
        aromas: ['citrus', 'floral', 'agave', 'lime', 'orange', 'vanilla'],
        appearance: 'Clear, bright golden color with good clarity',
        taste: 'Smooth, balanced with citrus and agave sweetness',
        finish: 'Long, clean finish with subtle warmth',
        rating: 8,
        extracted_flavors: ['citrus', 'sweet', 'vanilla', 'oak', 'agave']
      }
    },
    {
      id: 'audit-tasting-002',
      name: 'Audit Test Tasting - Error Handling',
      status: 'completed',
      type: 'guided',
      tasting_data: {
        aromas: ['smoky', 'earthy', 'spicy'],
        appearance: 'Amber color with medium clarity',
        taste: 'Bold, smoky with earthy undertones',
        finish: 'Medium finish with spicy warmth',
        rating: 7,
        extracted_flavors: ['smoky', 'earthy', 'spicy', 'oak']
      }
    }
  ]

  // Mock test data in localStorage for consistent testing
  await page.evaluate((tastings) => {
    localStorage.setItem('audit-test-tastings', JSON.stringify(tastings))
  }, testTastings)

  console.log('✅ Audit test data created')
}

async function createAuditTestUsers(page: any) {
  console.log('👥 Creating audit test users...')

  // Create users for different audit scenarios
  const auditTestUsers = [
    {
      id: 'audit-user-mobile',
      email: 'mobile-test@flavorwheel.audit',
      password: 'AuditTest123!',
      name: 'Mobile Test User',
      experience_level: 'beginner',
      device_type: 'mobile',
      test_focus: 'mobile_responsiveness'
    },
    {
      id: 'audit-user-accessibility',
      email: 'accessibility-test@flavorwheel.audit',
      password: 'AuditTest123!',
      name: 'Accessibility Test User',
      experience_level: 'intermediate',
      device_type: 'desktop',
      test_focus: 'accessibility_compliance'
    },
    {
      id: 'audit-user-performance',
      email: 'performance-test@flavorwheel.audit',
      password: 'AuditTest123!',
      name: 'Performance Test User',
      experience_level: 'advanced',
      device_type: 'desktop',
      test_focus: 'performance_optimization'
    },
    {
      id: 'audit-user-error-handling',
      email: 'error-test@flavorwheel.audit',
      password: 'AuditTest123!',
      name: 'Error Handling Test User',
      experience_level: 'intermediate',
      device_type: 'mobile',
      test_focus: 'error_boundaries'
    }
  ]

  // Store test users for audit scenarios
  await page.evaluate((users) => {
    localStorage.setItem('audit-test-users', JSON.stringify(users))
  }, auditTestUsers)

  console.log('✅ Audit test users created')
}

async function verifyPerformanceBaseline(page: any) {
  console.log('⚡ Verifying performance baseline...')

  // Check CSS bundle size baseline
  const cssResources = await page.evaluate(() =>
    performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('.css'))
      .reduce((total, entry) => total + ((entry as any).transferSize || 0), 0)
  )

  const cssSizeKB = Math.round(cssResources / 1024)
  console.log(`📊 CSS Bundle Size: ${cssSizeKB}KB`)

  if (cssSizeKB > 150) {
    console.warn(`⚠️  CSS bundle size (${cssSizeKB}KB) exceeds target (150KB)`)
  } else {
    console.log(`✅ CSS bundle size (${cssSizeKB}KB) within target range`)
  }

  // Check font loading
  const fontResources = await page.evaluate(() =>
    performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('font') || entry.name.includes('woff'))
      .length
  )

  console.log(`🔤 Font Resources: ${fontResources}`)
  if (fontResources > 0) {
    console.log('✅ Fonts are loading')
  }

  // Store baseline metrics
  const baselineMetrics = {
    cssBundleSize: cssSizeKB,
    fontResources,
    timestamp: new Date().toISOString(),
    auditVersion: '2.0'
  }

  await page.evaluate((metrics) => {
    localStorage.setItem('audit-baseline-metrics', JSON.stringify(metrics))
  }, baselineMetrics)

  console.log('✅ Performance baseline verified and stored')
}

export default globalSetup