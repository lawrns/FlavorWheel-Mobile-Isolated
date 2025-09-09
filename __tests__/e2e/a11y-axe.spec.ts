import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('a11y: home page has no critical violations', async ({ page }) => {
    await page.goto('/en/home')
    await page.waitForLoadState('networkidle')
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    
    // Check for critical violations
    const criticalViolations = results.violations.filter(
      violation => violation.impact === 'critical'
    )
    
    expect(criticalViolations).toEqual([])
    
    // Log any non-critical violations for awareness
    if (results.violations.length > 0) {
      console.log('Non-critical accessibility violations found:', results.violations.length)
      results.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`)
      })
    }
  })

  test('a11y: landing page has no critical violations', async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForLoadState('networkidle')
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    
    const criticalViolations = results.violations.filter(
      violation => violation.impact === 'critical'
    )
    
    expect(criticalViolations).toEqual([])
  })

  test('a11y: navigation has proper structure and labels', async ({ page }) => {
    await page.goto('/en/home')
    await page.waitForLoadState('networkidle')
    
    // Check that navigation landmark exists
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Run axe specifically on navigation
    const results = await new AxeBuilder({ page })
      .include('[role="navigation"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    
    expect(results.violations).toEqual([])
  })

  test('a11y: buttons meet contrast requirements', async ({ page }) => {
    await page.goto('/en/home')
    await page.waitForLoadState('networkidle')
    
    // Run axe with color-contrast rules
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze()
    
    const contrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    )
    
    expect(contrastViolations).toEqual([])
  })

  test('a11y: focus management works correctly', async ({ page }) => {
    await page.goto('/en/home')
    await page.waitForLoadState('networkidle')
    
    // Test focus indicators
    const firstNavButton = page.locator('[data-nav-item]').first()
    await firstNavButton.focus()
    
    // Check that focus is visible (this would need visual regression testing in practice)
    await expect(firstNavButton).toBeFocused()
    
    // Run axe with focus-related rules
    const results = await new AxeBuilder({ page })
      .withRules(['focus-order-semantics', 'focusable-content'])
      .analyze()
    
    expect(results.violations).toEqual([])
  })

  test('a11y: keyboard navigation works end-to-end', async ({ page }) => {
    await page.goto('/en/home')
    await page.waitForLoadState('networkidle')
    
    // Start keyboard navigation from the beginning
    await page.keyboard.press('Tab')
    
    // Should eventually reach navigation
    const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
    await expect(nav).toBeVisible()
    
    // Continue tabbing through navigation items
    let focusedElement = page.locator(':focus')
    let tabCount = 0
    const maxTabs = 20 // Prevent infinite loop
    
    while (tabCount < maxTabs) {
      const isNavButton = await focusedElement.getAttribute('data-nav-item')
      if (isNavButton) {
        // Found a navigation button, test Enter key
        await page.keyboard.press('Enter')
        break
      }
      await page.keyboard.press('Tab')
      focusedElement = page.locator(':focus')
      tabCount++
    }
    
    // Should have successfully navigated
    expect(tabCount).toBeLessThan(maxTabs)
  })
})

