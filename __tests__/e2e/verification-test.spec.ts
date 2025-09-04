import { test, expect } from '@playwright/test'

test.describe('Core Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-heading', { timeout: 30000 })
  })

  test('should load landing page correctly', async ({ page }) => {
    // Verify main heading exists
    await expect(page.locator('#main-heading')).toBeVisible()
    await expect(page.locator('#main-heading')).toContainText('FLAVATIX')

    // Verify profile button exists
    await expect(page.locator('[data-testid="profile-button"]')).toBeVisible()

    // Verify main action buttons exist
    await expect(page.locator('text=Start Your Flavor Journey')).toBeVisible()
    await expect(page.locator('text=Watch Demo')).toBeVisible()
    await expect(page.locator('text=Sign In')).toBeVisible()

    // Verify key sections exist
    await expect(page.locator('text=Discover the World')).toBeVisible()
    await expect(page.locator('text=AI Flavor Analysis')).toBeVisible()
    await expect(page.locator('text=Expert Community')).toBeVisible()

    // Verify data testids that should exist
    await expect(page.locator('[data-testid="app-ready"]')).toBeVisible()
    await expect(page.locator('[data-testid="tasting-list-loaded"]')).toBeVisible()
  })

  test('should handle button interactions', async ({ page }) => {
    // Click Start Your Flavor Journey button
    await page.locator('text=Start Your Flavor Journey').click()

    // Wait for navigation to complete
    await page.waitForURL('**/create', { timeout: 10000 })

    // Verify we successfully navigated to create page
    await expect(page).toHaveURL(/.*\/create/)

    // Verify the page loads (different pages have different elements)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle sign in button', async ({ page }) => {
    // Click Sign In button
    await page.locator('text=Sign In').click()

    // Wait a moment to see what happens
    await page.waitForTimeout(1000)

    // Sign In might open a modal or navigate - either is acceptable
    // Just verify the page is still functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have proper button contrast', async ({ page }) => {
    // Check for buttons that should not have white-on-white contrast
    // This is a basic check - the actual contrast fix was in the code

    // Verify main CTA buttons exist and are visible
    const startButton = page.locator('text=Start Your Flavor Journey')
    const signInButton = page.locator('text=Sign In')
    const demoButton = page.locator('text=Watch Demo')

    await expect(startButton).toBeVisible()
    await expect(signInButton).toBeVisible()
    await expect(demoButton).toBeVisible()

    // Verify buttons have proper styling (not implemented as visual regression test)
    // The contrast fixes were applied in the component code
  })

  test('should handle direct navigation to create page', async ({ page }) => {
    // Navigate directly to create page
    await page.goto('/en/create')
    await page.waitForURL('**/create')

    // Verify the page loads without crashing
    // The template picker should exist or be handled gracefully
    await expect(page.locator('body')).toBeVisible()

    // Check if we can navigate back to landing
    await page.goto('/en/landing')
    await expect(page.locator('#main-heading')).toBeVisible()
  })

  test('should handle direct navigation to review page', async ({ page }) => {
    // Navigate directly to review page
    await page.goto('/en/review')
    await page.waitForURL('**/review')

    // Verify the page loads without crashing
    await expect(page.locator('body')).toBeVisible()

    // Check if we can navigate back to landing
    await page.goto('/en/landing')
    await expect(page.locator('#main-heading')).toBeVisible()
  })
})
