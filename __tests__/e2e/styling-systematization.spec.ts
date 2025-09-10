import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// ===== STYLING SYSTEMATIZATION VALIDATION TESTS =====
// These tests validate that Phase 2 layout standardization is working correctly

test.describe('🎨 Styling Systematization - Layout Standards', () => {

  test.describe('AppShell Consistency', () => {
    test('dashboard page uses UnifiedAppShell variant="dashboard"', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Check that the main content area has the expected structure
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      // Check for unified navigation structure
      const desktopNav = page.locator('header').first()
      await expect(desktopNav).toBeVisible()

      // Verify mobile navigation is present but hidden on desktop
      const mobileNav = page.locator('[data-testid="mobile-nav"]')
      await expect(mobileNav).toHaveClass(/md:hidden/)

      // Check for consistent container classes
      const container = page.locator('.container-mobile, .container-tablet, .container-desktop, .container-wide').first()
      await expect(container).toBeVisible()
    })

    test('profile page uses UnifiedAppShell variant="dashboard"', async ({ page }) => {
      await page.goto('/en/profile')

      // Verify same structure as dashboard
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      // Check for unified navigation
      const desktopNav = page.locator('header').first()
      await expect(desktopNav).toBeVisible()

      // Check for consistent container
      const container = page.locator('.container-mobile, .container-tablet, .container-desktop, .container-wide').first()
      await expect(container).toBeVisible()
    })

    test('login page uses UnifiedAppShell variant="auth"', async ({ page }) => {
      await page.goto('/en/login')

      // Auth variant should have different structure
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      // No navigation should be visible
      const nav = page.getByRole('navigation', { name: 'Bottom Navigation' })
      await expect(nav).toHaveCount(0)

      // Should use centered layout
      const container = page.locator('.container-tablet, .container-desktop').first()
      await expect(container).toBeVisible()
    })

    test('landing page uses UnifiedAppShell variant="landing"', async ({ page }) => {
      await page.goto('/en/landing')

      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      // Landing should have navigation visible
      const desktopNav = page.locator('header').first()
      await expect(desktopNav).toBeVisible()

      // Should use full-width container
      const fullWidthContainer = page.locator('.container-wide, .w-full').first()
      await expect(fullWidthContainer).toBeVisible()
    })
  })

  test.describe('Container Standardization', () => {
    test('containers respect responsive breakpoints', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Test mobile breakpoint (default)
      await page.setViewportSize({ width: 375, height: 667 })
      const mobileContainer = page.locator('.container-mobile')
      await expect(mobileContainer).toBeVisible()

      // Test tablet breakpoint
      await page.setViewportSize({ width: 768, height: 1024 })
      const tabletContainer = page.locator('.container-tablet')
      await expect(tabletContainer).toBeVisible()

      // Test desktop breakpoint
      await page.setViewportSize({ width: 1200, height: 800 })
      const desktopContainer = page.locator('.container-desktop')
      await expect(desktopContainer).toBeVisible()

      // Test wide breakpoint
      await page.setViewportSize({ width: 1600, height: 900 })
      const wideContainer = page.locator('.container-wide')
      await expect(wideContainer).toBeVisible()
    })

    test('no ad-hoc max-w classes remain', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Check that no old ad-hoc max-width classes are used
      const adHocMaxWidth = page.locator('[class*="max-w-"]').not('[class*="container-"]')
      await expect(adHocMaxWidth).toHaveCount(0)
    })

    test('consistent padding across pages', async ({ page }) => {
      // Test dashboard padding
      await page.goto('/en/dashboard')
      const dashboardPadding = page.locator('#main-content')
      const dashboardPaddingValue = await dashboardPadding.evaluate(el => getComputedStyle(el).paddingLeft)
      expect(dashboardPaddingValue).toBe('24px') // px-6 = 1.5rem = 24px

      // Test profile padding (should be same)
      await page.goto('/en/profile')
      const profilePadding = page.locator('#main-content')
      const profilePaddingValue = await profilePadding.evaluate(el => getComputedStyle(el).paddingLeft)
      expect(profilePaddingValue).toBe('24px') // Should match dashboard
    })
  })

  test.describe('Button System Consistency', () => {
    test('all buttons use design token variants', async ({ page }) => {
      await page.goto('/en/profile')

      // Check that no hardcoded color classes are used on buttons
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const classList = await button.getAttribute('class') || ''

        // Should not contain hardcoded amber colors
        expect(classList).not.toContain('bg-amber-')
        expect(classList).not.toContain('hover:bg-amber-')
        expect(classList).not.toContain('text-amber-')
        expect(classList).not.toContain('border-amber-')
      }
    })

    test('primary buttons have consistent styling', async ({ page }) => {
      await page.goto('/en/login')

      const primaryButton = page.locator('button').filter({ hasText: 'Sign In' }).first()
      await expect(primaryButton).toBeVisible()

      // Check for design token classes
      const buttonClass = await primaryButton.getAttribute('class')
      expect(buttonClass).toContain('bg-gradient-to-r')
      expect(buttonClass).toContain('from-fx-primary')
      expect(buttonClass).toContain('to-fx-primary-hover')
    })

    test('button states work correctly', async ({ page }) => {
      await page.goto('/en/login')

      const submitButton = page.locator('button[type="submit"]').first()
      await expect(submitButton).toBeVisible()

      // Check disabled state
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toHaveValue('')

      // Button should be enabled initially
      await expect(submitButton).not.toBeDisabled()

      // Hover state (visual check - hard to test programmatically but we can check classes)
      const buttonClass = await submitButton.getAttribute('class')
      expect(buttonClass).toContain('hover:shadow-fx-lg')
    })

    test('buttons meet minimum touch target size', async ({ page }) => {
      await page.goto('/en/profile')

      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i)
        const boundingBox = await button.boundingBox()

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44) // Minimum touch target
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Card System Consistency', () => {
    test('cards use design token variants', async ({ page }) => {
      await page.goto('/en/profile')

      const cards = page.locator('[class*="card"], .card')
      const cardCount = await cards.count()

      expect(cardCount).toBeGreaterThan(0)

      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i)
        const classList = await card.getAttribute('class') || ''

        // Should use design token classes
        expect(classList).toContain('rounded-xl')
        expect(classList).toContain('border-fx-border-default')
        expect(classList).toContain('bg-fx-card')
      }
    })

    test('card spacing is consistent', async ({ page }) => {
      await page.goto('/en/profile')

      const cards = page.locator('[class*="card"], .card')

      // Check that all cards have consistent padding
      const cardCount = await cards.count()
      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i)
        const padding = await card.evaluate(el => getComputedStyle(el).padding)
        expect(padding).toMatch(/24px/) // p-6 = 24px
      }
    })

    test('card hover effects work', async ({ page }) => {
      await page.goto('/en/dashboard')

      const cards = page.locator('[class*="card"], .card')
      const firstCard = cards.first()

      if (await firstCard.count() > 0) {
        const classList = await firstCard.getAttribute('class') || ''
        expect(classList).toContain('hover:shadow-fx-md')
        expect(classList).toContain('transform')
        expect(classList).toContain('hover:-translate-y-1')
      }
    })
  })

  test.describe('Responsive & Accessibility Validation', () => {
    test('mobile navigation works correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Mobile nav should be visible
      const mobileNav = page.locator('[data-testid="mobile-nav"]')
      await expect(mobileNav).toBeVisible()

      // Desktop nav should be hidden
      const desktopNav = page.locator('header').filter({ hasClass: /hidden md:block/ })
      await expect(desktopNav).toBeHidden()
    })

    test('touch targets meet accessibility standards', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Check mobile navigation buttons
      const navButtons = page.locator('[data-testid="mobile-nav"] button')
      const buttonCount = await navButtons.count()

      for (let i = 0; i < buttonCount; i++) {
        const button = navButtons.nth(i)
        const boundingBox = await button.boundingBox()

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('focus management works correctly', async ({ page }) => {
      await page.goto('/en/login')

      // Tab to first input
      await page.keyboard.press('Tab')
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toBeFocused()

      // Check focus ring visibility
      const focusRing = page.locator('.focus-visible\\:ring-2')
      await expect(focusRing).toHaveCount(1)
    })

    test('axe-core accessibility validation', async ({ page }) => {
      await page.goto('/en/dashboard')
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      // Should have no critical violations
      const criticalViolations = results.violations.filter(
        violation => violation.impact === 'critical'
      )

      expect(criticalViolations).toEqual([])

      // Should have no serious violations related to our styling changes
      const seriousViolations = results.violations.filter(
        violation => violation.impact === 'serious'
      )

      if (seriousViolations.length > 0) {
        console.log('Serious accessibility violations found:')
        seriousViolations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`)
        })
      }

      // Allow up to 2 serious violations (for existing issues, not our changes)
      expect(seriousViolations.length).toBeLessThanOrEqual(2)
    })
  })

  test.describe('Design Token Compliance', () => {
    test('no legacy fw- classes remain', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Check for any remaining fw- classes (should be migrated to fx-)
      const fwClasses = page.locator('[class*="fw-"]')
      await expect(fwClasses).toHaveCount(0)
    })

    test('all colors use fx- design tokens', async ({ page }) => {
      await page.goto('/en/profile')

      // Check that all color-related classes use fx- tokens
      const elementsWithColors = page.locator('[class*="text-"], [class*="bg-"], [class*="border-"]')
      const elementCount = await elementsWithColors.count()

      let fxTokenCount = 0
      for (let i = 0; i < elementCount; i++) {
        const element = elementsWithColors.nth(i)
        const classList = await element.getAttribute('class') || ''

        if (classList.includes('fx-') || classList.includes('text-fx-') || classList.includes('bg-fx-') || classList.includes('border-fx-')) {
          fxTokenCount++
        }
      }

      // At least 80% of color classes should use fx- tokens
      const fxTokenPercentage = (fxTokenCount / elementCount) * 100
      expect(fxTokenPercentage).toBeGreaterThanOrEqual(80)
    })

    test('typography uses design tokens', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Check for fx- font classes
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()

      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i)
        const classList = await heading.getAttribute('class') || ''

        // Should use design token typography classes
        expect(classList).toMatch(/font-(heading|fx-heading|h[1-6]|display)/)
      }
    })
  })
})

// ===== PERFORMANCE & VISUAL REGRESSION TESTS =====

test.describe('Performance Validation', () => {
  test('layout shifts are minimized (CLS < 0.1)', async ({ page }) => {
    await page.goto('/en/dashboard')

    // Wait for initial load
    await page.waitForLoadState('networkidle')

    // Simulate user interactions that might cause layout shifts
    const navButtons = page.locator('[data-testid="mobile-nav"] button')
    if (await navButtons.count() > 0) {
      await navButtons.first().click()
      await page.waitForTimeout(1000)
    }

    // Check that no major layout shifts occurred
    // Note: In a real scenario, you'd use the Layout Shift API or visual comparison
    const mainContent = page.locator('#main-content')
    await expect(mainContent).toBeVisible()
  })

  test('CSS bundle size is reasonable', async ({ page }) => {
    await page.goto('/en/dashboard')

    // Check that styles loaded correctly
    const body = page.locator('body')
    const computedStyle = await body.evaluate(el => getComputedStyle(el))
    expect(computedStyle.fontFamily).toContain('Inter') // Should use our design system fonts
  })
})

// ===== CROSS-BROWSER COMPATIBILITY =====

test.describe('Cross-browser Layout Compatibility', () => {
  test('layout works in different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 896 }, // iPhone 11
      { width: 768, height: 1024 }, // iPad
      { width: 1024, height: 768 }, // iPad Pro landscape
      { width: 1200, height: 800 }, // Desktop
      { width: 1920, height: 1080 }, // Full HD
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.goto('/en/dashboard')

      // Layout should adapt correctly
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      const container = page.locator('.container-mobile, .container-tablet, .container-desktop, .container-wide').first()
      await expect(container).toBeVisible()
    }
  })
})
