import { test, expect } from '@playwright/test'

test.describe('Tasting Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="app-ready"]')
  })

  test('should create a new tasting session', async ({ page }) => {
    // Navigate to create tasting page
    await page.click('[data-testid="create-tasting-button"]')
    
    // Fill in tasting details
    await page.fill('[data-testid="tasting-name-input"]', 'Test Tequila Tasting')
    await page.fill('[data-testid="tasting-description-input"]', 'A test tasting session for E2E testing')
    
    // Select tasting type
    await page.selectOption('[data-testid="tasting-type-select"]', 'guided')
    
    // Add a tasting item
    await page.click('[data-testid="add-item-button"]')
    await page.fill('[data-testid="item-name-input"]', 'Test Tequila Blanco')
    await page.selectOption('[data-testid="item-type-select"]', 'tequila')
    
    // Create the tasting
    await page.click('[data-testid="create-tasting-submit"]')
    
    // Verify tasting was created
    await expect(page.locator('[data-testid="tasting-created-message"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Test Tequila Tasting')
  })

  test('should conduct a tasting session', async ({ page }) => {
    // Assume we have a test tasting available
    await page.goto('/tastings/test-tasting-id')
    
    // Start the tasting
    await page.click('[data-testid="start-tasting-button"]')
    
    // Fill in tasting notes
    await page.fill('[data-testid="aroma-notes"]', 'Fresh agave, citrus notes, slight pepper')
    await page.fill('[data-testid="flavor-notes"]', 'Sweet agave, vanilla, black pepper finish')
    
    // Rate the item
    await page.click('[data-testid="rating-8"]')
    
    // Add overall impression
    await page.fill('[data-testid="overall-notes"]', 'Excellent example of blanco tequila')
    
    // Submit the tasting
    await page.click('[data-testid="submit-tasting-button"]')
    
    // Verify submission
    await expect(page.locator('[data-testid="tasting-submitted-message"]')).toBeVisible()
  })

  test('should generate flavor wheel', async ({ page }) => {
    // Navigate to a completed tasting
    await page.goto('/tastings/test-tasting-id/results')
    
    // Click generate flavor wheel
    await page.click('[data-testid="generate-flavor-wheel-button"]')
    
    // Wait for flavor wheel to be generated
    await page.waitForSelector('[data-testid="flavor-wheel-svg"]', { timeout: 10000 })
    
    // Verify flavor wheel is displayed
    await expect(page.locator('[data-testid="flavor-wheel-svg"]')).toBeVisible()
    
    // Check that flavors are extracted
    await expect(page.locator('[data-testid="extracted-flavors"]')).toContainText('agave')
    await expect(page.locator('[data-testid="extracted-flavors"]')).toContainText('citrus')
  })

  test('should export tasting results', async ({ page }) => {
    // Navigate to tasting results
    await page.goto('/tastings/test-tasting-id/results')
    
    // Start download
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-pdf-button"]')
    const download = await downloadPromise
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/tasting-results.*\.pdf/)
    
    // Save the file to verify it's valid
    await download.saveAs('./test-results/exported-tasting.pdf')
  })

  test('should share tasting on social media', async ({ page }) => {
    // Navigate to tasting results
    await page.goto('/tastings/test-tasting-id/results')
    
    // Click share button
    await page.click('[data-testid="share-button"]')
    
    // Verify share modal opens
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()
    
    // Test different share options
    await expect(page.locator('[data-testid="share-twitter"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-facebook"]')).toBeVisible()
    await expect(page.locator('[data-testid="share-instagram"]')).toBeVisible()
    
    // Test copy link functionality
    await page.click('[data-testid="copy-link-button"]')
    await expect(page.locator('[data-testid="link-copied-message"]')).toBeVisible()
  })
})

test.describe('Mobile Tasting Flow', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE size
  })

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    
    // Test mobile tasting creation
    await page.click('[data-testid="mobile-create-tasting"]')
    
    // Fill form on mobile
    await page.fill('[data-testid="tasting-name-input"]', 'Mobile Test Tasting')
    
    // Test mobile-specific interactions
    await page.tap('[data-testid="add-item-button"]')
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible()
  })

  test('should support touch gestures for flavor wheel', async ({ page }) => {
    await page.goto('/tastings/test-tasting-id/results')
    
    // Wait for flavor wheel
    await page.waitForSelector('[data-testid="flavor-wheel-svg"]')
    
    // Test pinch to zoom (simulated)
    const flavorWheel = page.locator('[data-testid="flavor-wheel-svg"]')
    
    // Get initial bounding box
    const initialBox = await flavorWheel.boundingBox()
    
    // Simulate zoom gesture
    await page.mouse.move(initialBox!.x + initialBox!.width / 2, initialBox!.y + initialBox!.height / 2)
    await page.mouse.wheel(0, -100) // Zoom in
    
    // Test pan gesture
    await page.mouse.down()
    await page.mouse.move(initialBox!.x + 50, initialBox!.y + 50)
    await page.mouse.up()
    
    // Verify wheel is still interactive
    await expect(flavorWheel).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Verify focus management
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/tastings/create')
    
    // Check for ARIA labels
    await expect(page.locator('[aria-label="Tasting name"]')).toBeVisible()
    await expect(page.locator('[aria-label="Tasting description"]')).toBeVisible()
    await expect(page.locator('[role="button"]')).toHaveCount(1, { timeout: 5000 })
  })

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/')
    
    // Check for screen reader content
    await expect(page.locator('[aria-live="polite"]')).toBeAttached()
    await expect(page.locator('h1')).toHaveAttribute('id')
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForSelector('[data-testid="app-ready"]')
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should handle large flavor wheels efficiently', async ({ page }) => {
    // Navigate to a tasting with many flavors
    await page.goto('/tastings/complex-tasting-id/results')
    
    const startTime = Date.now()
    
    // Generate complex flavor wheel
    await page.click('[data-testid="generate-flavor-wheel-button"]')
    await page.waitForSelector('[data-testid="flavor-wheel-svg"]')
    
    const renderTime = Date.now() - startTime
    
    // Should render within 5 seconds even for complex wheels
    expect(renderTime).toBeLessThan(5000)
  })
})
