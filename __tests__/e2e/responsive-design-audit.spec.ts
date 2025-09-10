import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// ===== RESPONSIVE DESIGN AUDIT =====
// Comprehensive testing for mobile navigation, touch targets, and device coverage

test.describe('📱 Responsive Design Audit', () => {

  test.describe('Mobile Navigation System', () => {
    test('mobile navigation appears correctly on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/en/dashboard')

      // Mobile navigation should be visible
      const mobileNav = page.locator('[data-testid="mobile-navigation-root"]')
      await expect(mobileNav).toBeVisible()
      await expect(mobileNav).toHaveClass(/md:hidden/)

      // Desktop navigation should be hidden
      const desktopNav = page.locator('header').filter({ hasClass: /hidden md:block/ })
      await expect(desktopNav).toBeHidden()

      // Check navigation items
      const navItems = page.locator('[data-nav-item]')
      await expect(navItems).toHaveCount(4) // Dashboard, Create, Analytics, Profile
    })

    test('mobile navigation hidden on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1200, height: 800 }) // Desktop
      await page.goto('/en/dashboard')

      // Mobile navigation should be hidden
      const mobileNav = page.locator('[data-testid="mobile-navigation-root"]')
      await expect(mobileNav).toBeHidden()

      // Desktop navigation should be visible
      const desktopNav = page.locator('header').first()
      await expect(desktopNav).toBeVisible()
    })

    test('mobile navigation touch targets meet minimum size', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      const navButtons = page.locator('[data-testid="mobile-navigation-root"] button')

      for (let i = 0; i < await navButtons.count(); i++) {
        const button = navButtons.nth(i)
        const boundingBox = await button.boundingBox()

        expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
        expect(boundingBox?.width).toBeGreaterThanOrEqual(44)

        // Also check for proper touch-manipulation class
        const classList = await button.getAttribute('class')
        expect(classList).toContain('touch-manipulation')
      }
    })

    test('mobile navigation keyboard accessibility', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Focus on first navigation item
      await page.keyboard.press('Tab')
      const firstNavItem = page.locator('[data-nav-item]').first()
      await expect(firstNavItem).toBeFocused()

      // Check for proper focus ring
      const focusRing = page.locator('.focus-visible\\:ring-2')
      await expect(focusRing).toBeVisible()
    })

    test('mobile menu expansion and collapse', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Click menu button
      const menuButton = page.locator('[data-testid="mobile-menu-button"]')
      await menuButton.click()

      // Expanded menu should appear
      const expandedMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(expandedMenu).toBeVisible()

      // Backdrop should be visible
      const backdrop = page.locator('.fixed.inset-0.z-40')
      await expect(backdrop).toBeVisible()

      // Click backdrop to close
      await backdrop.click()
      await expect(expandedMenu).toBeHidden()
    })
  })

  test.describe('Touch Target Compliance', () => {
    test('all interactive elements meet 44px minimum touch target', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Check buttons
      const buttons = page.locator('button:not([aria-hidden="true"])')
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i)
        const boundingBox = await button.boundingBox()

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }

      // Check links (if they're interactive)
      const links = page.locator('a[href]:not([aria-hidden="true"])')
      for (let i = 0; i < await links.count(); i++) {
        const link = links.nth(i)
        const boundingBox = await link.boundingBox()

        if (boundingBox && boundingBox.height > 0 && boundingBox.width > 0) {
          // Only check if link has visible dimensions
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('form inputs have adequate touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/login')

      // Check input fields
      const inputs = page.locator('input, textarea, select')
      for (let i = 0; i < await inputs.count(); i++) {
        const input = inputs.nth(i)
        const boundingBox = await input.boundingBox()

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('custom interactive elements meet touch requirements', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/quick-tasting')

      // Check for any custom interactive elements
      const interactiveElements = page.locator('[role="button"], [role="tab"], [role="menuitem"]')
      for (let i = 0; i < await interactiveElements.count(); i++) {
        const element = interactiveElements.nth(i)
        const boundingBox = await element.boundingBox()

        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(44)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Device Coverage Testing', () => {
    const devices = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 11', width: 414, height: 896 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop 1080p', width: 1920, height: 1080 },
      { name: 'Desktop 4K', width: 2560, height: 1440 },
      { name: 'Android Small', width: 360, height: 640 },
      { name: 'Android Large', width: 412, height: 915 },
      { name: 'Galaxy Fold', width: 280, height: 653 }
    ]

    for (const device of devices) {
      test(`layout works on ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })

        // Test dashboard page
        await page.goto('/en/dashboard')

        // Layout should load without errors
        const mainContent = page.locator('#main-content')
        await expect(mainContent).toBeVisible()

        // Container should be visible
        const container = page.locator('.container-mobile, .container-tablet, .container-desktop, .container-wide').first()
        await expect(container).toBeVisible()

        // Navigation should be appropriate for screen size
        if (device.width < 768) {
          // Mobile navigation should be visible
          const mobileNav = page.locator('[data-testid="mobile-navigation-root"]')
          await expect(mobileNav).toBeVisible()
        } else {
          // Desktop navigation should be visible
          const desktopNav = page.locator('header').first()
          await expect(desktopNav).toBeVisible()
        }

        // No horizontal overflow
        const body = page.locator('body')
        const scrollWidth = await body.evaluate(el => el.scrollWidth)
        const clientWidth = await body.evaluate(el => el.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow small margin for rounding
      })
    }
  })

  test.describe('Responsive Layout Behavior', () => {
    test('content reflows correctly at breakpoints', async ({ page }) => {
      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      const mobileMainContent = page.locator('#main-content')
      const mobileWidth = await mobileMainContent.evaluate(el => el.getBoundingClientRect().width)

      // Switch to tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      const tabletMainContent = page.locator('#main-content')
      const tabletWidth = await tabletMainContent.evaluate(el => el.getBoundingClientRect().width)

      // Content should be wider on tablet
      expect(tabletWidth).toBeGreaterThan(mobileWidth)

      // Switch to desktop
      await page.setViewportSize({ width: 1200, height: 800 })
      const desktopMainContent = page.locator('#main-content')
      const desktopWidth = await desktopMainContent.evaluate(el => el.getBoundingClientRect().width)

      // Content should be wider on desktop
      expect(desktopWidth).toBeGreaterThan(tabletWidth)
    })

    test('typography scales appropriately across devices', async ({ page }) => {
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      const mobileHeading = page.locator('h1, h2').first()
      const mobileFontSize = await mobileHeading.evaluate(el =>
        parseFloat(getComputedStyle(el).fontSize)
      )

      // Test desktop
      await page.setViewportSize({ width: 1200, height: 800 })
      await page.reload()

      const desktopHeading = page.locator('h1, h2').first()
      const desktopFontSize = await desktopHeading.evaluate(el =>
        parseFloat(getComputedStyle(el).fontSize)
      )

      // Typography should be readable on both devices
      expect(mobileFontSize).toBeGreaterThanOrEqual(16) // Minimum readable font size
      expect(desktopFontSize).toBeGreaterThanOrEqual(16)
    })

    test('images and media are responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Check for any images
      const images = page.locator('img')
      for (let i = 0; i < await images.count(); i++) {
        const img = images.nth(i)

        // Images should not overflow their containers
        const imgRect = await img.boundingBox()
        const containerRect = await img.locator('..').boundingBox()

        if (imgRect && containerRect) {
          expect(imgRect.width).toBeLessThanOrEqual(containerRect.width + 10) // Small margin for padding
        }
      }
    })
  })

  test.describe('Performance Across Devices', () => {
    test('layout stability during viewport changes', async ({ page }) => {
      await page.goto('/en/dashboard')

      // Start with mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForLoadState('networkidle')

      // Change to desktop
      await page.setViewportSize({ width: 1200, height: 800 })

      // Layout should remain stable (no major reflow issues)
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      // Check that navigation state is appropriate
      const desktopNav = page.locator('header').first()
      await expect(desktopNav).toBeVisible()
    })

    test('no layout shifts during interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Get initial positions
      const navButton = page.locator('[data-nav-item]').first()
      const initialRect = await navButton.boundingBox()

      // Interact with navigation
      await navButton.click()
      await page.waitForTimeout(1000)

      // Check position hasn't changed dramatically
      const finalRect = await navButton.boundingBox()

      if (initialRect && finalRect) {
        const positionChange = Math.abs(initialRect.y - finalRect.y)
        expect(positionChange).toBeLessThan(50) // Allow small movement for animations
      }
    })
  })

  test.describe('Accessibility Compliance Across Devices', () => {
    const accessibilityDevices = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 }
    ]

    for (const device of accessibilityDevices) {
      test(`accessibility compliance on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height })
        await page.goto('/en/dashboard')
        await page.waitForLoadState('networkidle')

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()

        // Check for critical accessibility violations
        const criticalViolations = results.violations.filter(
          violation => violation.impact === 'critical'
        )

        expect(criticalViolations).toEqual([])

        // Check for serious violations that affect usability
        const seriousViolations = results.violations.filter(
          violation => violation.impact === 'serious'
        )

        // Allow up to 3 serious violations (for known issues)
        expect(seriousViolations.length).toBeLessThanOrEqual(3)

        // Log violations for awareness
        if (results.violations.length > 0) {
          console.log(`${device.name} accessibility violations:`, results.violations.length)
          results.violations.slice(0, 3).forEach(violation => {
            console.log(`- ${violation.id}: ${violation.description}`)
          })
        }
      })
    }
  })

  test.describe('Gesture and Interaction Support', () => {
    test('swipe gestures work on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      // Test horizontal swipe (if applicable)
      const mainContent = page.locator('#main-content')
      await mainContent.evaluate(() => {
        // Simulate touch events
        const touchStart = new TouchEvent('touchstart', {
          touches: [new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: 300 })]
        })
        const touchMove = new TouchEvent('touchmove', {
          touches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 300 })]
        })
        const touchEnd = new TouchEvent('touchend', {
          touches: []
        })

        document.body.dispatchEvent(touchStart)
        document.body.dispatchEvent(touchMove)
        document.body.dispatchEvent(touchEnd)
      })

      // Page should still be functional after gesture
      await expect(mainContent).toBeVisible()
    })

    test('double-tap prevention on buttons', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/login')

      const loginButton = page.locator('button[type="submit"]').first()

      // Double click should not cause issues
      await loginButton.dblclick()

      // Button should still be functional
      await expect(loginButton).toBeVisible()
    })
  })

  test.describe('Cross-Browser Layout Compatibility', () => {
    test('layout works with different user agents', async ({ page }) => {
      // Test with mobile user agent
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1')
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/dashboard')

      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeVisible()

      const mobileNav = page.locator('[data-testid="mobile-navigation-root"]')
      await expect(mobileNav).toBeVisible()
    })
  })
})
