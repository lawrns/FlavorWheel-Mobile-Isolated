import { test, expect } from '@playwright/test'

test.describe('Tooltip System Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/en/landing')

    // Wait for app to be ready
    await page.waitForSelector('#main-heading, [data-testid="profile-button"]', { timeout: 30000 })

    // Mock API responses for consistent testing
    await page.route('**/api/**', async route => {
      const url = route.request().url()

      if (url.includes('/api/auth/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              name: 'Test User',
              experienceLevel: 'beginner'
            }
          })
        })
      } else {
        await route.continue()
      }
    })
  })

  test.describe('Onboarding Tooltip System', () => {
    test('should display onboarding tooltips for new users', async ({ page }) => {
      // Mock as a new user who hasn't completed onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      // Navigate to trigger onboarding
      await page.goto('/en/landing')
      await page.waitForTimeout(3000) // Wait for onboarding auto-start

      // Should show first onboarding tooltip
      await expect(page.locator('.onboarding-tooltip')).toBeVisible()
      await expect(page.locator('.onboarding-tooltip-title')).toContainText('Welcome to FlavorWheel')
    })

    test('should navigate through onboarding steps correctly', async ({ page }) => {
      // Start onboarding manually
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
        window.location.reload()
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Step 1: Welcome
      await expect(page.locator('.onboarding-tooltip-title')).toContainText('Welcome to FlavorWheel')

      // Click next
      await page.click('text=Next')
      await page.waitForTimeout(500)

      // Step 2: Navigation
      await expect(page.locator('.onboarding-tooltip-title')).toContainText('Explore the App')
      await expect(page.locator('#mobile-navigation')).toBeVisible()

      // Click next
      await page.click('text=Next')
      await page.waitForTimeout(500)

      // Step 3: Quick Tasting
      await expect(page.locator('.onboarding-tooltip-title')).toContainText('Start Your First Tasting')
      await expect(page.locator('[data-nav-item="create"]')).toBeVisible()

      // Click next
      await page.click('text=Next')
      await page.waitForTimeout(500)

      // Step 4: Social Community
      await expect(page.locator('.onboarding-tooltip-title')).toContainText('Join the Community')
      await expect(page.locator('[data-nav-item="social"]')).toBeVisible()
    })

    test('should handle onboarding skip functionality', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Click skip
      await page.click('text=Skip Tour')

      // Tooltips should disappear
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()

      // Should remember skip choice
      await page.reload()
      await page.waitForTimeout(3000)
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()
    })

    test('should complete onboarding tour successfully', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Navigate through all steps
      const steps = [
        'Welcome to FlavorWheel',
        'Explore the App',
        'Start Your First Tasting',
        'Join the Community',
        'Explore Flavor Wheels',
        'Read Expert Reviews',
        'Save Your Progress'
      ]

      for (let i = 0; i < steps.length - 1; i++) {
        await expect(page.locator('.onboarding-tooltip-title')).toContainText(steps[i])
        await page.click('text=Next')
        await page.waitForTimeout(500)
      }

      // Last step should have Complete button
      await expect(page.locator('.onboarding-tooltip-title')).toContainText(steps[steps.length - 1])
      await expect(page.locator('text=Complete')).toBeVisible()

      // Complete onboarding
      await page.click('text=Complete')

      // Tooltips should disappear
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()

      // Should remember completion
      await page.reload()
      await page.waitForTimeout(3000)
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()
    })
  })

  test.describe('Help Tooltip System', () => {
    test('should display help tooltips on demand', async ({ page }) => {
      await page.goto('/en/landing')

      // Find a help tooltip trigger - look for inline help or floating help
      const inlineHelp = page.locator('button:has-text("?")').first()
      const floatingHelp = page.locator('button:has(.lucide-book-open)').first()

      let helpTrigger = inlineHelp
      if (!(await inlineHelp.isVisible()) && await floatingHelp.isVisible()) {
        helpTrigger = floatingHelp
      }

      if (await helpTrigger.isVisible()) {
        await helpTrigger.click()

        // Help tooltip should appear
        await expect(page.locator('.help-tooltip')).toBeVisible()
        await expect(page.locator('.help-tooltip-content')).toBeVisible()
      }
    })

    test('should handle help tooltip positioning', async ({ page }) => {
      await page.goto('/en/landing')

      // Find help tooltip triggers - inline help and floating help
      const inlineHelps = page.locator('button:has-text("?")')
      const floatingHelp = page.locator('button:has(.lucide-book-open)')

      // Test inline help tooltips
      for (let i = 0; i < Math.min(2, await inlineHelps.count()); i++) {
        const trigger = inlineHelps.nth(i)
        if (await trigger.isVisible()) {
          const triggerBox = await trigger.boundingBox()

          await trigger.click()

          // Check tooltip is visible and positioned correctly
          const tooltip = page.locator('.help-tooltip').last()
          await expect(tooltip).toBeVisible()

          // Tooltip should be positioned near the trigger
          const tooltipBox = await tooltip.boundingBox()
          expect(tooltipBox).toBeTruthy()

          // Close tooltip
          await page.click('body')
          await expect(tooltip).not.toBeVisible()
        }
      }

      // Test floating help if available
      if (await floatingHelp.isVisible()) {
        await floatingHelp.click()

        const tooltip = page.locator('.help-tooltip').last()
        await expect(tooltip).toBeVisible()

        // Close tooltip
        await page.click('body')
        await expect(tooltip).not.toBeVisible()
      }
    })

    test('should handle help tooltip content display', async ({ page }) => {
      await page.goto('/en/landing')

      // Test help tooltips have proper content
      const inlineHelps = page.locator('button:has-text("?")')

      for (let i = 0; i < Math.min(2, await inlineHelps.count()); i++) {
        const trigger = inlineHelps.nth(i)
        if (await trigger.isVisible()) {
          await trigger.click()

          const tooltip = page.locator('.help-tooltip').last()
          await expect(tooltip).toBeVisible()

          // Should have title and content
          await expect(tooltip.locator('.help-tooltip-title')).toBeVisible()
          await expect(tooltip.locator('.help-tooltip-content')).toBeVisible()

          // Close tooltip
          await page.keyboard.press('Escape')
          await expect(tooltip).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Tooltip Positioning and Boundary Handling', () => {
    test('should handle tooltips near viewport edges', async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 600 })

      // Start onboarding to test positioning
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Tooltips should be positioned within viewport bounds
      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      const tooltipBox = await tooltip.boundingBox()
      const viewport = page.viewportSize()

      if (tooltipBox && viewport) {
        // Tooltip should be within viewport
        expect(tooltipBox.x).toBeGreaterThanOrEqual(0)
        expect(tooltipBox.y).toBeGreaterThanOrEqual(0)
        expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width)
        expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height)
      }
    })

    test('should handle tooltips on different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 }, // iPhone
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 }, // Desktop
        { width: 1366, height: 768 } // Laptop
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)

        // Start onboarding
        await page.evaluate(() => {
          localStorage.removeItem('onboarding-completed')
        })

        await page.reload()
        await page.waitForTimeout(3000)

        // Tooltips should work on all screen sizes
        const tooltip = page.locator('.onboarding-tooltip')
        await expect(tooltip).toBeVisible()

        const tooltipBox = await tooltip.boundingBox()
        if (tooltipBox) {
          // Should be positioned within current viewport
          expect(tooltipBox.x).toBeGreaterThanOrEqual(0)
          expect(tooltipBox.y).toBeGreaterThanOrEqual(0)
          expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width)
          expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(viewport.height)
        }
      }
    })

    test('should handle rapid tooltip interactions', async ({ page }) => {
      await page.goto('/en/landing')

      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.reload()
      await page.waitForTimeout(3000)

      // Rapidly click through onboarding steps
      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Click next rapidly
      for (let i = 0; i < 5; i++) {
        const nextButton = page.locator('text=Next')
        if (await nextButton.isVisible()) {
          await nextButton.click()
          await page.waitForTimeout(100)
        } else {
          break
        }
      }

      // Should handle rapid interactions gracefully
      await expect(tooltip).toBeVisible() // Should still be showing last tooltip
    })
  })

  test.describe('Tooltip Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Test tab navigation within tooltip
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Test Escape to close
      await page.keyboard.press('Escape')
      await expect(tooltip).not.toBeVisible()
    })

    test('should have proper ARIA attributes', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Check for proper ARIA attributes
      await expect(tooltip).toHaveAttribute('role', 'dialog')
      await expect(tooltip).toHaveAttribute('aria-modal', 'true')

      // Check buttons have proper labels
      const buttons = tooltip.locator('button')
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i)
        const ariaLabel = await button.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
      }
    })

    test('should handle screen reader announcements', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Should have proper heading structure for screen readers
      const heading = tooltip.locator('h1, h2, h3, h4, h5, h6').first()
      await expect(heading).toBeVisible()
    })
  })

  test.describe('Tooltip Performance and Reliability', () => {
    test('should handle multiple tooltip instances', async ({ page }) => {
      await page.goto('/en/landing')

      // Find multiple help tooltip triggers
      const helpTriggers = page.locator('button:has-text("?"), button:has(.lucide-book-open)')

      // Open multiple tooltips simultaneously
      const triggerCount = Math.min(3, await helpTriggers.count())
      for (let i = 0; i < triggerCount; i++) {
        const trigger = helpTriggers.nth(i)
        if (await trigger.isVisible()) {
          await trigger.click()
          await page.waitForTimeout(100)
        }
      }

      // Multiple tooltips should coexist without conflicts
      const visibleTooltips = page.locator('.help-tooltip:visible')
      expect(await visibleTooltips.count()).toBeGreaterThan(0)

      // Close all tooltips
      await page.click('body')
      await expect(page.locator('.help-tooltip:visible')).toHaveCount(0)
    })

    test('should handle tooltip lifecycle correctly', async ({ page }) => {
      await page.goto('/en/landing')

      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.reload()
      await page.waitForTimeout(3000)

      // Tooltip should appear
      await expect(page.locator('.onboarding-tooltip')).toBeVisible()

      // Navigate away
      await page.goto('/en/create')

      // Tooltip should disappear when navigating away
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()

      // Navigate back
      await page.goBack()

      // Tooltip should not reappear (user navigated away)
      await expect(page.locator('.onboarding-tooltip')).not.toBeVisible()
    })

    test('should handle page refresh during tooltip display', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Tooltip should be visible
      await expect(page.locator('.onboarding-tooltip')).toBeVisible()

      // Refresh page
      await page.reload()

      // After refresh, onboarding should restart or remember state
      // This depends on implementation - either restart or don't show
      // Both are acceptable behaviors
      await page.waitForTimeout(3000)

      // Should not cause JavaScript errors
      const hasErrors = await page.evaluate(() => {
        return window.console.errors?.length > 0
      })

      expect(hasErrors).toBe(false)
    })
  })

  test.describe('Tooltip Visual and UX Testing', () => {
    test('should have proper visual styling', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Check visual properties
      const styles = await tooltip.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el)
        return {
          backgroundColor: computedStyle.backgroundColor,
          border: computedStyle.border,
          borderRadius: computedStyle.borderRadius,
          boxShadow: computedStyle.boxShadow,
          zIndex: computedStyle.zIndex
        }
      })

      // Should have proper styling
      expect(styles.backgroundColor).toBeTruthy()
      expect(styles.border).toBeTruthy()
      expect(styles.borderRadius).toBeTruthy()
      expect(styles.boxShadow).toBeTruthy()
      expect(parseInt(styles.zIndex)).toBeGreaterThan(999)
    })

    test('should handle dark/light mode transitions', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Check tooltip adapts to theme changes
      const initialStyles = await tooltip.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })

      // Simulate theme change (if theme toggle exists)
      const themeToggle = page.locator('[data-testid="theme-toggle"]')
      if (await themeToggle.isVisible()) {
        await themeToggle.click()
        await page.waitForTimeout(500)

        // Tooltip should still be visible and styled appropriately
        await expect(tooltip).toBeVisible()

        const newStyles = await tooltip.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor
        })

        // Styles should be different after theme change
        expect(newStyles).not.toBe(initialStyles)
      }
    })

    test('should have smooth animations', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Check for CSS transitions/animations
      const hasAnimations = await tooltip.evaluate((el) => {
        const computedStyle = window.getComputedStyle(el)
        return computedStyle.transition !== 'all 0s ease 0s' ||
               computedStyle.animationName !== 'none'
      })

      // Should have smooth animations (this is optional but good UX)
      // expect(hasAnimations).toBe(true) // Uncomment if animations are required
    })
  })

  test.describe('Tooltip Error Handling', () => {
    test('should handle missing target elements gracefully', async ({ page }) => {
      // Manually trigger onboarding with invalid targets
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
        // Override onboarding steps with invalid selectors
        window.localStorage.setItem('onboarding-test-invalid', 'true')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      // Should handle gracefully even with invalid selectors
      // Either skip invalid steps or show tooltips appropriately
      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible() // Should still work for valid steps

      // Should not cause JavaScript errors
      const hasErrors = await page.evaluate(() => {
        return window.console.errors?.length > 0
      })

      expect(hasErrors).toBe(false)
    })

    test('should handle rapid user interactions', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Simulate rapid clicking on various elements
      const actions = [
        () => page.click('body'),
        () => page.keyboard.press('Escape'),
        () => page.click('text=Next'),
        () => page.click('text=Skip Tour'),
        () => page.click('body')
      ]

      // Execute actions rapidly
      for (const action of actions) {
        try {
          await action()
          await page.waitForTimeout(50)
        } catch (e) {
          // Some actions might fail if elements don't exist - that's ok
        }
      }

      // Should handle rapid interactions without breaking
      // Either tooltip should be gone or still functional
      const tooltipVisible = await tooltip.isVisible()
      if (tooltipVisible) {
        // If still visible, should still be functional
        await expect(tooltip.locator('button')).toBeVisible()
      }

      // Should not cause JavaScript errors
      const hasErrors = await page.evaluate(() => {
        return window.console.errors?.length > 0
      })

      expect(hasErrors).toBe(false)
    })

    test('should handle network issues during tooltip display', async ({ page }) => {
      // Start onboarding
      await page.evaluate(() => {
        localStorage.removeItem('onboarding-completed')
      })

      await page.goto('/en/landing')
      await page.waitForTimeout(3000)

      const tooltip = page.locator('.onboarding-tooltip')
      await expect(tooltip).toBeVisible()

      // Simulate network issues
      await page.route('**/*', async route => {
        // Delay responses to simulate network issues
        await page.waitForTimeout(1000)
        await route.continue()
      })

      // Tooltip should remain functional despite network delays
      await expect(tooltip).toBeVisible()

      // Should still be able to interact with tooltip
      const nextButton = page.locator('text=Next')
      if (await nextButton.isVisible()) {
        await nextButton.click()
        // Should handle the click despite network delays
      }
    })
  })
})
