import { test, expect } from '@playwright/test'

test.describe('Navigation Visibility', () => {
  test('nav visible on home', async ({ page }) => {
    await page.goto('/en/home')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that navigation is visible
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Check that navigation items are present
    const navItems = page.locator('[data-nav-item]')
    await expect(navItems).toHaveCount(4) // Should have 4 main navigation items
  })

  test('nav hidden on landing', async ({ page }) => {
    await page.goto('/en/landing')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check that navigation is NOT visible on landing page (by design)
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).not.toBeVisible()
  })

  test('nav visible on tasting pages', async ({ page }) => {
    await page.goto('/en/quick-tasting')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that navigation is visible
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
  })

  test('nav hidden on auth pages', async ({ page }) => {
    await page.goto('/en/login')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that navigation is hidden
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toHaveCount(0)
  })

  test('navigation items have proper accessibility attributes', async ({ page }) => {
    await page.goto('/en/home')
    
    // Wait for navigation to be visible
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Check that navigation buttons have proper ARIA attributes
    const navButtons = page.locator('[data-nav-item]')
    const firstButton = navButtons.first()
    
    // Check for proper button role
    await expect(firstButton).toHaveAttribute('role', 'button')
    
    // Check for aria-label
    await expect(firstButton).toHaveAttribute('aria-label')
    
    // Check for tabindex
    await expect(firstButton).toHaveAttribute('tabindex', '0')
  })

  test('navigation buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/en/home')
    
    // Wait for navigation to be visible
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Focus first navigation button
    const firstButton = page.locator('[data-nav-item]').first()
    await firstButton.focus()
    
    // Check that button is focused
    await expect(firstButton).toBeFocused()
    
    // Test keyboard navigation with Tab
    await page.keyboard.press('Tab')
    const secondButton = page.locator('[data-nav-item]').nth(1)
    await expect(secondButton).toBeFocused()
    
    // Test activation with Enter key
    await page.keyboard.press('Enter')
    // Should navigate or trigger action (specific behavior depends on implementation)
  })

  test('navigation maintains state during page transitions', async ({ page }) => {
    await page.goto('/en/home')
    
    // Wait for navigation to be visible
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Click on a navigation item
    const createButton = page.locator('[data-nav-item="create"]')
    await createButton.click()
    
    // Wait for navigation and check it's still visible
    await page.waitForLoadState('networkidle')
    await expect(nav).toBeVisible()
    
    // Check that the active state is updated
    await expect(createButton).toHaveAttribute('aria-current', 'page')
  })
})
