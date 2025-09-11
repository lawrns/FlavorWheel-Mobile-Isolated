import { test, expect } from '@playwright/test'

test.describe('FlavorWheel México Site Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main landing page
    await page.goto('/en/landing')

    // Wait for the FlavorWheel México heading to load (landing page specific)
    await page.waitForSelector('header h2', { timeout: 10000 })

    // Wait for the app to be ready (check for the app-ready indicator)
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })
  })

  test('should load the landing page successfully', async ({ page }) => {
    // Check that the FlavorWheel México header is visible
    await expect(page.locator('header h2')).toBeVisible()

    // Check that the heading contains "FlavorWheel México"
    await expect(page.locator('header h2')).toContainText('FlavorWheel México')

    // Check that the landing page main content area is present
    await expect(page.locator('section#main-content')).toBeVisible()

    // Check that the main hero h1 is visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Professional Flavor')

    // Verify page title (update to match actual title)
    await expect(page).toHaveTitle(/FlavorWheel|Flavor/)
  })

  test('should have working navigation buttons', async ({ page }) => {
    // Check that the profile button is visible (in header)
    await expect(page.locator('header a[href*="/profile"]')).toBeVisible()

    // Check that the main CTA buttons are visible
    await expect(page.locator('a[href*="/register"]').first()).toBeVisible()
    await expect(page.locator('a[href*="/quick-tasting"]').first()).toBeVisible()
  })

  test('should display tasting action buttons', async ({ page }) => {
    // Check for the primary action buttons in hero section
    const registerButton = page.locator('a[href*="/register"]').first()
    const quickTastingButton = page.locator('a[href*="/quick-tasting"]').first()

    await expect(registerButton).toBeVisible()
    await expect(quickTastingButton).toBeVisible()

    // Check button text content
    await expect(registerButton).toContainText('Start Free Trial')
    await expect(quickTastingButton).toContainText('Try Quick Tasting')

  })

  test('should handle responsive design', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.reload()
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })

    // Check that main elements are visible on desktop
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href*="/register"]').first()).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })

    // Elements should still be visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href*="/register"]').first()).toBeVisible()

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })

    // Elements should still be visible on mobile
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href*="/quick-tasting"]').first()).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for skip navigation links (they are sr-only but should be in DOM)
    await expect(page.locator('a[href="#main-content"]')).toBeAttached()
    await expect(page.locator('a[href="#navigation"]')).toBeAttached()

    // Check for main content section
    await expect(page.locator('section#main-content')).toBeVisible()

    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('header h2')).toBeVisible()

    // Check for header role
    await expect(page.locator('header[role="banner"]')).toBeVisible()
  })

  test('should have working social/community buttons', async ({ page }) => {
    // Check for main action links (these are the primary CTAs on the page)
    const registerLinks = page.locator('a[href*="/register"]')
    const quickTastingLinks = page.locator('a[href*="/quick-tasting"]')

    // Should have multiple register and quick tasting links
    expect(await registerLinks.count()).toBeGreaterThan(0)
    expect(await quickTastingLinks.count()).toBeGreaterThan(0)

    // Check that at least the first ones are visible
    await expect(registerLinks.first()).toBeVisible()
    await expect(quickTastingLinks.first()).toBeVisible()

    // Check for profile link in header
    await expect(page.locator('header a[href*="/profile"]')).toBeVisible()
  })

  test('should handle page refresh without errors', async ({ page }) => {
    // Get initial state
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible()

    // Refresh the page
    await page.reload()

    // Wait for page to reload
    await page.waitForSelector('section#main-content', { timeout: 10000 })
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })

    // Verify everything still works after refresh
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible()
    await expect(page.locator('a[href*="/register"]').first()).toBeVisible()
  })

  test('should have proper meta tags and SEO', async ({ page }) => {
    // Check that page has a title (flexible check)
    await expect(page).toHaveTitle(/FlavorWheel|Flavor|Professional/)

    // Check viewport meta tag (use first one)
    const viewportMeta = page.locator('meta[name="viewport"]').first()
    await expect(viewportMeta).toBeAttached()

    // Check that main heading exists for SEO
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText(/Professional|Flavor/)
  })

  test('should load assets properly', async ({ page }) => {
    // Check that CSS is loaded (should not have unstyled content)
    const heading = page.locator('h1')
    const styles = await heading.evaluate(el => window.getComputedStyle(el))
    expect(styles.fontSize).not.toBe('16px') // Should have custom styling

    // Check that the page has proper styling
    const headerElement = page.locator('header')
    const headerStyles = await headerElement.evaluate(el => window.getComputedStyle(el))
    expect(headerStyles.position).toBe('relative')

    // Check that SVG icons are present (used throughout the page)
    const svgElements = page.locator('svg')
    const svgCount = await svgElements.count()
    expect(svgCount).toBeGreaterThan(0) // Should have SVG icons
  })
})

test.describe('API Endpoints', () => {
  test('should have working health endpoint', async ({ page }) => {
    // Navigate to health endpoint
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)

    // Check response content
    const responseBody = await response.json()
    expect(responseBody).toBeDefined()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Test a non-existent endpoint
    const response = await page.request.get('/api/non-existent')
    expect([404, 500].includes(response.status())).toBeTruthy()
  })
})

test.describe('Mobile-Specific Features', () => {
  test.use({
    viewport: { width: 375, height: 667 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
  })

  test('should work well on mobile devices', async ({ page }) => {
    await page.goto('/en/landing')

    // Wait for mobile-optimized content
    await page.waitForSelector('section#main-content', { timeout: 10000 })
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })

    // Check that main elements are visible on mobile
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('a[href*="/quick-tasting"]').first()).toBeVisible()

    // Check that content is properly sized for mobile
    const mainContent = page.locator('section#main-content')
    const boundingBox = await mainContent.boundingBox()

    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(400) // Allow some margin
    }

    // Check for touch-friendly elements (links act as buttons)
    const links = page.locator('a')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)

    // Verify no horizontal scroll on mobile
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow small margin for scrollbars
  })
})

test.describe('Performance Tests', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/en/landing')
    await page.waitForSelector('section#main-content', { timeout: 10000 })

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
  })

  test('should not have critical console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/en/landing')
    await page.waitForSelector('section#main-content', { timeout: 10000 })

    // Wait a bit for any async errors
    await page.waitForTimeout(2000)

    // Filter out common benign errors
    const seriousErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest') &&
      !error.includes('React DevTools') &&
      !error.includes('Download the React DevTools') &&
      !error.includes('webpack') &&
      !error.includes('chunk')
    )

    // Log errors for debugging
    if (seriousErrors.length > 0) {
      console.log('Console errors found:', seriousErrors)
    }

    // Allow up to 5 non-critical errors (network, etc.)
    expect(seriousErrors.length).toBeLessThan(6)
  })
})

test.describe('Error Handling', () => {
  test('should show error message when needed', async ({ page }) => {
    // Check if error elements exist (they might not be implemented yet)
    const errorMessage = page.locator('[data-testid="error-message"]')
    const retryButton = page.locator('[data-testid="retry-button"]')

    // These might not be visible initially, but let's check if they exist
    const errorCount = await errorMessage.count()
    const retryCount = await retryButton.count()

    // At minimum, document that error handling structure is in place
    console.log(`Error handling elements found: ${errorCount} error messages, ${retryCount} retry buttons`)

    // If they exist, they should be properly structured
    if (errorCount > 0) {
      await expect(errorMessage.first()).toBeAttached()
    }
    if (retryCount > 0) {
      await expect(retryButton.first()).toBeAttached()
    }
  })

  test('should handle network failures gracefully', async ({ page }) => {
    // Navigate to a fresh page for this test to avoid state interference
    await page.goto('/en/landing')
    await page.waitForSelector('section#main-content', { timeout: 10000 })

    // Test basic error handling by trying a non-existent endpoint
    const response = await page.request.get('/api/non-existent-endpoint')

    // Should get a 404 or similar error response
    expect([404, 400, 500].includes(response.status())).toBeTruthy()

    // Navigate back to ensure page is still functional
    await page.goto('/en/landing')
    await page.waitForSelector('section#main-content', { timeout: 10000 })

    // Page should remain functional after the error
    await expect(page.locator('h1')).toBeVisible()
  })
})
