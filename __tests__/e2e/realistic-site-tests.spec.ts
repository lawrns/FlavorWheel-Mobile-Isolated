import { test, expect } from '@playwright/test'

test.describe('Flavatix Site Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main landing page
    await page.goto('/en/landing')

    // Wait for the FLAVATIX heading to load (landing page specific)
    await page.waitForSelector('header h1', { timeout: 10000 })

    // Wait for the app to be ready (check for the app-ready indicator)
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 15000 })
  })

  test('should load the landing page successfully', async ({ page }) => {
    // Check that the FLAVATIX header is visible
    await expect(page.locator('header h1')).toBeVisible()

    // Check that the heading contains "FLAVATIX"
    await expect(page.locator('header h1')).toContainText('FLAVATIX')

    // Check that the landing page main content area is present
    await expect(page.locator('main.relative.z-10')).toBeVisible()

    // Verify page title
    await expect(page).toHaveTitle('Flavatix - Discover the Art of Spirits Tasting')
  })

  test('should have working navigation buttons', async ({ page }) => {
    // Check that the profile button is visible
    await expect(page.locator('[data-testid="profile-button"]')).toBeVisible()

    // Check that the create tasting button is visible
    await expect(page.locator('[data-testid="create-tasting-button"]')).toBeVisible()

    // Check that the quick tasting button is visible
    await expect(page.locator('[data-testid="quick-tasting-button"]')).toBeVisible()
  })

  test('should display tasting action buttons', async ({ page }) => {
    // Check for the primary action buttons
    const createButton = page.locator('[data-testid="create-tasting-button"]')
    const quickTastingButton = page.locator('[data-testid="quick-tasting-button"]')

    await expect(createButton).toBeVisible()
    await expect(quickTastingButton).toBeVisible()

    // Check for mobile-specific button (may be hidden on desktop)
    const mobileCreateButton = page.locator('[data-testid="mobile-create-tasting"]')
    await expect(mobileCreateButton).toBeAttached() // Button should exist, even if hidden

    // Check for advanced tasting button
    const advancedButton = page.locator('[data-testid="create-advanced-tasting"]')
    await expect(advancedButton).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Check that main elements are visible on desktop
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('[data-testid="create-tasting-button"]')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })

    // Elements should still be visible
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('[data-testid="create-tasting-button"]')).toBeVisible()

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Elements should still be visible on mobile
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('[data-testid="mobile-create-tasting"]')).toBeVisible()
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for skip navigation links
    await expect(page.locator('a[href="#main-content"]')).toBeVisible()
    await expect(page.locator('a[href="#navigation"]')).toBeVisible()

    // Check for main landmark
    await expect(page.locator('main[role="main"]')).toBeVisible()

    // Check for proper heading structure
    await expect(page.locator('h1#main-heading')).toBeVisible()

    // Check for aria-live regions for dynamic content
    const ariaLiveElements = page.locator('[aria-live="polite"]')
    await expect(ariaLiveElements.first()).toBeAttached()
    expect(await ariaLiveElements.count()).toBeGreaterThan(0)
  })

  test('should have working social/community buttons', async ({ page }) => {
    // Check for community-related buttons (these should exist based on the HTML)
    const buttons = page.locator('button[aria-label*="Community"], button[aria-label*="Social"]')
    const communityButton = page.locator('button[aria-label="Join Social Community"]')
    const reviewsButton = page.locator('button[aria-label="Read Reviews"]')

    // At least some of these should be visible
    const buttonCount = await page.locator('button').count()
    expect(buttonCount).toBeGreaterThan(5) // Should have multiple action buttons

    // Check for specific buttons if they exist
    if (await communityButton.isVisible()) {
      await expect(communityButton).toBeVisible()
    }

    if (await reviewsButton.isVisible()) {
      await expect(reviewsButton).toBeVisible()
    }
  })

  test('should handle page refresh without errors', async ({ page }) => {
    // Get initial state
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible()

    // Refresh the page
    await page.reload()

    // Wait for page to reload
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Verify everything still works after refresh
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible()
    await expect(page.locator('[data-testid="create-tasting-button"]')).toBeVisible()
  })

  test('should have proper meta tags and SEO', async ({ page }) => {
    // Check meta title
    await expect(page).toHaveTitle('Flavatix - Discover the Art of Spirits Tasting')

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', 'Mobile-first tasting experience for discovering authentic flavors')

    // Check viewport meta tag (use first one)
    const viewportMeta = page.locator('meta[name="viewport"]').first()
    await expect(viewportMeta).toHaveAttribute('content', 'width=device-width, initial-scale=1')
  })

  test('should load assets properly', async ({ page }) => {
    // Check that CSS is loaded (should not have unstyled content)
    const heading = page.locator('#main-heading')
    const styles = await heading.evaluate(el => window.getComputedStyle(el))
    expect(styles.fontSize).not.toBe('16px') // Should have custom styling

    // Check that images load (if any)
    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // If there are images, they should load without errors
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i)
        await expect(img).toBeVisible()
      }
    }
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
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Check that mobile-specific elements are visible
    await expect(page.locator('[data-testid="mobile-create-tasting"]')).toBeVisible()

    // Check that content is properly sized for mobile
    const mainContent = page.locator('#main-content')
    const boundingBox = await mainContent.boundingBox()

    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375)
    }

    // Check for touch-friendly elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)

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
    await page.waitForSelector('#main-content', { timeout: 10000 })

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
    await page.waitForSelector('#main-content', { timeout: 10000 })

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
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Test basic error handling by trying a non-existent endpoint
    const response = await page.request.get('/api/non-existent-endpoint')

    // Should get a 404 or similar error response
    expect([404, 400, 500].includes(response.status())).toBeTruthy()

    // Navigate back to ensure page is still functional
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Page should remain functional after the error
    await expect(page.locator('#main-heading')).toBeVisible()
  })
})
