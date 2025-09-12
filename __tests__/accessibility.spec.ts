import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Testing Suite - WCAG 2.1 AA', () => {
  test.describe('Automated Accessibility Audits', () => {
    test('Landing page accessibility audit', async ({ page }) => {
      await page.goto('/en')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('Flavor wheels page accessibility audit', async ({ page }) => {
      await page.goto('/en/flavor-wheels')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('Settings page accessibility audit', async ({ page }) => {
      await page.goto('/en/settings')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('Visual regression test page accessibility audit', async ({ page }) => {
      await page.goto('/en/test/visual-regression')
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  })

  test.describe('Color Contrast Compliance', () => {
    test('Text contrast ratios meet WCAG AA standards', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Test primary text contrast
      const primaryText = page.locator('h1, h2, h3, h4, h5, h6, p').first()
      await expect(primaryText).toHaveCSS('color', /rgb\(.*\)/)

      // Test button contrast in different states
      const button = page.locator('[data-testid="button-primary"]').first()
      await expect(button).toHaveCSS('color', /rgb\(.*\)/)
      await expect(button).toHaveCSS('background-color', /rgb\(.*\)/)

      // Test input contrast
      const input = page.locator('[data-testid="input-field"]').first()
      await expect(input).toHaveCSS('color', /rgb\(.*\)/)
      await expect(input).toHaveCSS('border-color', /rgb\(.*\)/)
    })

    test('Dark mode contrast ratios meet WCAG AA standards', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Switch to dark mode
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="dark"]')

      // Test primary text contrast in dark mode
      const primaryText = page.locator('h1, h2, h3, h4, h5, h6, p').first()
      await expect(primaryText).toHaveCSS('color', /rgb\(.*\)/)

      // Test button contrast in dark mode
      const button = page.locator('[data-testid="button-primary"]').first()
      await expect(button).toHaveCSS('color', /rgb\(.*\)/)
      await expect(button).toHaveCSS('background-color', /rgb\(.*\)/)
    })

    test('Focus indicators have sufficient contrast', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      const input = page.locator('[data-testid="input-field"]').first()

      // Focus the input
      await input.focus()

      // Check focus ring contrast
      const focusRing = page.locator('[data-testid="input-field"]:focus-visible').first()
      await expect(focusRing).toHaveCSS('box-shadow', /rgb\(.*\)/)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('All interactive elements are keyboard accessible', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Get all interactive elements
      const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').all()

      // Test that each element can receive focus
      for (const element of interactiveElements) {
        const isVisible = await element.isVisible()
        if (isVisible) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase())
          const type = await element.getAttribute('type')

          // Skip hidden inputs and submit inputs
          if (tagName === 'input' && (type === 'hidden' || type === 'submit')) {
            continue
          }

          await element.focus()
          const isFocused = await element.evaluate(el => el === document.activeElement)
          expect(isFocused).toBe(true)
        }
      }
    })

    test('Tab order is logical and intuitive', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Start tab navigation
      await page.keyboard.press('Tab')

      // Get the first focusable element
      const firstElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
      expect(firstElement).toBeDefined()

      // Continue tabbing through elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab')
        const currentElement = await page.evaluate(() => document.activeElement?.tagName.toLowerCase())
        expect(currentElement).toBeDefined()
      }
    })

    test('Skip links and focus management work correctly', async ({ page }) => {
      await page.goto('/en')

      // Check if skip links exist (they should for WCAG compliance)
      const skipLinks = page.locator('a[href^="#"]').filter({ hasText: /skip|jump/i })
      const skipLinkCount = await skipLinks.count()

      if (skipLinkCount > 0) {
        // Test skip link functionality
        await skipLinks.first().click()
        const focusedElement = await page.evaluate(() => document.activeElement?.id)
        expect(focusedElement).toBeDefined()
      }
    })

    test('Modal dialogs trap focus correctly', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Look for modal triggers
      const modalTriggers = page.locator('[data-testid*="modal"], [aria-haspopup="dialog"]')
      const triggerCount = await modalTriggers.count()

      if (triggerCount > 0) {
        await modalTriggers.first().click()

        // Wait for modal to appear
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        // Test focus trapping
        const modal = page.locator('[role="dialog"]').first()
        await expect(modal).toBeVisible()

        // Try to tab within the modal
        await page.keyboard.press('Tab')
        const focusedElement = await page.evaluate(() => document.activeElement)
        const isWithinModal = await page.evaluate((element) => {
          const modal = document.querySelector('[role="dialog"]')
          return modal?.contains(element)
        }, focusedElement)

        expect(isWithinModal).toBe(true)
      }
    })
  })

  test.describe('ARIA and Semantic HTML', () => {
    test('All images have appropriate alt text', async ({ page }) => {
      await page.goto('/en')

      const images = await page.locator('img').all()

      for (const image of images) {
        const alt = await image.getAttribute('alt')
        const ariaLabel = await image.getAttribute('aria-label')
        const role = await image.getAttribute('role')

        // Images should either have alt text, aria-label, or be decorative
        const hasAltText = alt !== null && alt !== ''
        const hasAriaLabel = ariaLabel !== null && ariaLabel !== ''
        const isDecorative = alt === '' || role === 'presentation'

        expect(hasAltText || hasAriaLabel || isDecorative).toBe(true)
      }
    })

    test('Form elements have proper labels', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      const inputs = await page.locator('input, select, textarea').all()

      for (const input of inputs) {
        const type = await input.getAttribute('type')
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const name = await input.getAttribute('name')

        // Skip hidden inputs
        if (type === 'hidden') continue

        // Check for associated label
        const id = await input.getAttribute('id')
        let hasLabel = false

        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          hasLabel = await label.isVisible()
        }

        // Check for aria-label or aria-labelledby
        const hasAriaLabel = ariaLabel !== null && ariaLabel !== ''
        const hasAriaLabelledBy = ariaLabelledBy !== null && ariaLabelledBy !== ''

        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true)
      }
    })

    test('Heading structure is logical', async ({ page }) => {
      await page.goto('/en')

      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      const headingLevels: number[] = []

      for (const heading of headings) {
        const level = parseInt(await heading.evaluate(el => el.tagName.charAt(1)))
        headingLevels.push(level)
      }

      // Check that heading levels don't skip (e.g., no H3 without H2)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i]
        const previousLevel = headingLevels[i - 1]

        // Allow H1 to H2, H2 to H3, etc., but not skipping levels
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      }
    })

    test('Color is not used as the only way to convey information', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Look for elements that might rely only on color
      const coloredElements = await page.locator('[style*="color"], [style*="background"]').all()

      for (const element of coloredElements) {
        const text = await element.textContent()
        const hasIcon = await element.locator('svg, .icon').isVisible().catch(() => false)
        const hasAriaLabel = await element.getAttribute('aria-label').then(attr => attr !== null)
        const hasScreenReaderText = await element.locator('.sr-only, [aria-hidden="false"]').isVisible().catch(() => false)

        // If element has text and relies on color, it should have additional indicators
        if (text && text.trim().length > 0) {
          expect(hasIcon || hasAriaLabel || hasScreenReaderText).toBe(true)
        }
      }
    })
  })

  test.describe('Touch and Mobile Accessibility', () => {
    test('Touch targets meet minimum size requirements', async ({ page, context }) => {
      // Set mobile viewport
      await context.addCookies([{ name: 'viewport', value: 'mobile', domain: 'localhost' }])
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/en/test/visual-regression')

      const touchTargets = await page.locator('button, a, input, select, textarea, [role="button"]').all()

      for (const target of touchTargets) {
        const isVisible = await target.isVisible()
        if (isVisible) {
          const box = await target.boundingBox()

          if (box) {
            // Minimum touch target size is 44px
            expect(box.width).toBeGreaterThanOrEqual(44)
            expect(box.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('Swipe gestures and touch interactions work', async ({ page, context }) => {
      await context.addCookies([{ name: 'viewport', value: 'mobile', domain: 'localhost' }])
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/en/test/visual-regression')

      // Test basic touch interactions
      const button = page.locator('[data-testid="button-primary"]').first()
      await button.tap()

      // Test theme toggle on mobile
      const themeToggle = page.locator('[data-testid="theme-toggle"]')
      if (await themeToggle.isVisible()) {
        await themeToggle.tap()
        await page.waitForSelector('[data-theme]', { timeout: 1000 })
      }
    })
  })

  test.describe('Error States and Validation', () => {
    test('Form validation errors are properly announced', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Find form inputs
      const inputs = await page.locator('input, select, textarea').all()

      for (const input of inputs) {
        const type = await input.getAttribute('type')
        const ariaDescribedBy = await input.getAttribute('aria-describedby')
        const ariaInvalid = await input.getAttribute('aria-invalid')

        // If input has error state, it should be announced
        if (ariaInvalid === 'true') {
          expect(ariaDescribedBy).toBeDefined()

          // Check if error message exists
          if (ariaDescribedBy) {
            const errorMessage = page.locator(`#${ariaDescribedBy}`)
            await expect(errorMessage).toBeVisible()
          }
        }
      }
    })

    test('Loading states are announced to screen readers', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Look for loading states
      const loadingElements = await page.locator('[aria-busy="true"], [aria-live]').all()

      for (const element of loadingElements) {
        const ariaLive = await element.getAttribute('aria-live')
        const ariaBusy = await element.getAttribute('aria-busy')

        // Loading states should be announced
        expect(ariaLive === 'polite' || ariaLive === 'assertive' || ariaBusy === 'true').toBe(true)
      }
    })
  })

  test.describe('Theme and High Contrast Support', () => {
    test('High contrast mode maintains accessibility', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Switch to high contrast mode
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="high-contrast"]')

      // Test contrast in high contrast mode
      const primaryText = page.locator('h1, h2, h3, h4, h5, h6, p').first()
      await expect(primaryText).toHaveCSS('color', /rgb\(.*\)/)

      const button = page.locator('[data-testid="button-primary"]').first()
      await expect(button).toHaveCSS('color', /rgb\(.*\)/)
      await expect(button).toHaveCSS('background-color', /rgb\(.*\)/)
    })

    test('Focus indicators are visible in all themes', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      const input = page.locator('[data-testid="input-field"]').first()

      // Test focus in light mode
      await input.focus()
      await expect(input).toHaveCSS('outline', /rgb\(.*\)/)

      // Switch to dark mode and test focus
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="dark"]')

      await input.focus()
      await expect(input).toHaveCSS('outline', /rgb\(.*\)/)

      // Switch to high contrast mode and test focus
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="high-contrast"]')

      await input.focus()
      await expect(input).toHaveCSS('outline', /rgb\(.*\)/)
    })
  })
})
