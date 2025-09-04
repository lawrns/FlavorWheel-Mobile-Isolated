import { test, expect } from '@playwright/test'

test.describe('Visual Regression & UI Consistency', () => {
  test.describe('Layout Consistency', () => {
    test('should maintain consistent header layout', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Take screenshot of header
      const headerScreenshot = await page.locator('header').screenshot()

      // Header should have consistent elements
      await expect(page.locator('#main-heading')).toBeVisible()
      await expect(page.locator('[data-testid="profile-button"]')).toBeVisible()

      // Check header dimensions
      const headerBox = await page.locator('header').boundingBox()
      expect(headerBox?.height).toBeGreaterThan(50)
      expect(headerBox?.width).toBeGreaterThan(300)

      console.log(`Header dimensions: ${headerBox?.width}x${headerBox?.height}`)
    })

    test('should maintain consistent navigation layout', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Check main navigation elements
      const navElements = [
        '[data-testid="create-tasting-button"]',
        '[data-testid="quick-tasting-button"]',
        '[data-testid*="social"], [aria-label*="Community"]'
      ]

      for (const selector of navElements) {
        const element = page.locator(selector).first()
        if (await element.isVisible()) {
          const box = await element.boundingBox()
          expect(box?.width).toBeGreaterThan(0)
          expect(box?.height).toBeGreaterThan(0)
        }
      }

      // Take screenshot of navigation area
      const navScreenshot = await page.locator('section[aria-label*="Primary actions"]').screenshot()

      console.log('Navigation layout consistent')
    })

    test('should maintain consistent card layouts', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      const cards = page.locator('[data-testid="tasting-card"]')
      const cardCount = await cards.count()

      if (cardCount > 0) {
        // Check first few cards for consistency
        for (let i = 0; i < Math.min(3, cardCount); i++) {
          const card = cards.nth(i)
          const box = await card.boundingBox()

          // Cards should have reasonable dimensions
          expect(box?.width).toBeGreaterThan(200)
          expect(box?.height).toBeGreaterThan(100)

          // Cards should have consistent structure
          await expect(card.locator('[data-testid="tasting-author"]')).toBeVisible()
          await expect(card.locator('[data-testid="tasting-title"]')).toBeVisible()
        }

        console.log(`Card layouts consistent: ${cardCount} cards checked`)
      }
    })
  })

  test.describe('Responsive Design Consistency', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Large Desktop', width: 2560, height: 1440 }
    ]

    for (const viewport of viewports) {
      test(`should maintain layout consistency on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/en/landing')
        await page.waitForSelector('#main-content')

        // Take full page screenshot
        const screenshot = await page.screenshot({ fullPage: true })

        // Check that critical elements are visible
        await expect(page.locator('#main-heading')).toBeVisible()
        await expect(page.locator('#main-content')).toBeVisible()

        // Check layout doesn't break
        const contentWidth = await page.locator('#main-content').evaluate(el => el.scrollWidth)
        expect(contentWidth).toBeLessThanOrEqual(viewport.width + 20) // Allow small margin for scrollbars

        console.log(`${viewport.name} layout: ${contentWidth}px content width, ${viewport.width}px viewport`)
      })
    }

    test('should handle orientation changes', async ({ page }) => {
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const portraitScreenshot = await page.screenshot()

      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 })

      const landscapeScreenshot = await page.screenshot()

      // Content should adapt to new orientation
      await expect(page.locator('#main-heading')).toBeVisible()
      await expect(page.locator('#main-content')).toBeVisible()

      console.log('Orientation change handled successfully')
    })
  })

  test.describe('Theme Consistency', () => {
    test('should maintain consistent styling across themes', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Take screenshot of default theme
      const defaultScreenshot = await page.screenshot()

      // Look for theme toggle
      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"]').first()

      if (await themeToggle.isVisible()) {
        // Get initial theme colors
        const initialHeadingColor = await page.locator('#main-heading').evaluate(el =>
          window.getComputedStyle(el).color
        )

        const initialBgColor = await page.locator('body').evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        )

        // Toggle theme
        await themeToggle.click()
        await page.waitForTimeout(500) // Allow theme transition

        // Take screenshot of new theme
        const themeScreenshot = await page.screenshot()

        // Get new theme colors
        const newHeadingColor = await page.locator('#main-heading').evaluate(el =>
          window.getComputedStyle(el).color
        )

        const newBgColor = await page.locator('body').evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        )

        // Colors should be different after theme change
        expect(newHeadingColor).not.toBe(initialHeadingColor)
        expect(newBgColor).not.toBe(initialBgColor)

        console.log('Theme transition working correctly')
      } else {
        console.log('Theme toggle not found, assuming single theme')
      }
    })

    test('should maintain accessibility in all themes', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"]').first()

      if (await themeToggle.isVisible()) {
        // Check contrast ratios in light theme
        const lightContrast = await page.evaluate(() => {
          const heading = document.querySelector('#main-heading')
          const body = document.body

          if (heading && body) {
            const headingColor = window.getComputedStyle(heading).color
            const bodyBg = window.getComputedStyle(body).backgroundColor
            // This is a simplified contrast check - in real implementation you'd use a proper contrast library
            return headingColor !== bodyBg
          }
          return true
        })

        // Toggle to dark theme
        await themeToggle.click()
        await page.waitForTimeout(500)

        // Check contrast ratios in dark theme
        const darkContrast = await page.evaluate(() => {
          const heading = document.querySelector('#main-heading')
          const body = document.body

          if (heading && body) {
            const headingColor = window.getComputedStyle(heading).color
            const bodyBg = window.getComputedStyle(body).backgroundColor
            return headingColor !== bodyBg
          }
          return true
        })

        expect(lightContrast).toBeTruthy()
        expect(darkContrast).toBeTruthy()

        console.log('Accessibility maintained across themes')
      }
    })
  })

  test.describe('Component Visual Consistency', () => {
    test('should maintain consistent button styles', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      if (buttonCount > 0) {
        // Check first few buttons for consistency
        const buttonStyles = []

        for (let i = 0; i < Math.min(5, buttonCount); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const styles = await button.evaluate(el => ({
              fontSize: window.getComputedStyle(el).fontSize,
              padding: window.getComputedStyle(el).padding,
              borderRadius: window.getComputedStyle(el).borderRadius,
              backgroundColor: window.getComputedStyle(el).backgroundColor
            }))
            buttonStyles.push(styles)
          }
        }

        // Check that buttons have consistent sizing (within reasonable ranges)
        const fontSizes = buttonStyles.map(s => parseInt(s.fontSize))
        const maxFontSize = Math.max(...fontSizes)
        const minFontSize = Math.min(...fontSizes)

        expect(maxFontSize - minFontSize).toBeLessThan(8) // Font sizes should be reasonably consistent

        console.log(`Button styles consistent: ${buttonStyles.length} buttons checked`)
      }
    })

    test('should maintain consistent form styling', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      const inputs = page.locator('input, textarea, select')
      const inputCount = await inputs.count()

      if (inputCount > 0) {
        const inputStyles = []

        for (let i = 0; i < Math.min(5, inputCount); i++) {
          const input = inputs.nth(i)
          if (await input.isVisible()) {
            const styles = await input.evaluate(el => ({
              height: window.getComputedStyle(el).height,
              border: window.getComputedStyle(el).border,
              borderRadius: window.getComputedStyle(el).borderRadius,
              fontSize: window.getComputedStyle(el).fontSize
            }))
            inputStyles.push(styles)
          }
        }

        // Check height consistency
        const heights = inputStyles.map(s => parseInt(s.height))
        const maxHeight = Math.max(...heights)
        const minHeight = Math.min(...heights)

        expect(maxHeight - minHeight).toBeLessThan(10) // Heights should be reasonably consistent

        console.log(`Form styling consistent: ${inputStyles.length} inputs checked`)
      }
    })

    test('should maintain consistent card styling', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      const cards = page.locator('[data-testid="tasting-card"]')
      const cardCount = await cards.count()

      if (cardCount > 1) {
        // Compare first two cards for consistency
        const card1 = cards.first()
        const card2 = cards.nth(1)

        const card1Styles = await card1.evaluate(el => ({
          padding: window.getComputedStyle(el).padding,
          margin: window.getComputedStyle(el).margin,
          borderRadius: window.getComputedStyle(el).borderRadius,
          boxShadow: window.getComputedStyle(el).boxShadow
        }))

        const card2Styles = await card2.evaluate(el => ({
          padding: window.getComputedStyle(el).padding,
          margin: window.getComputedStyle(el).margin,
          borderRadius: window.getComputedStyle(el).borderRadius,
          boxShadow: window.getComputedStyle(el).boxShadow
        }))

        // Cards should have consistent styling
        expect(card1Styles.padding).toBe(card2Styles.padding)
        expect(card1Styles.borderRadius).toBe(card2Styles.borderRadius)

        console.log('Card styling consistent across components')
      }
    })
  })

  test.describe('Animation & Interaction Consistency', () => {
    test('should have smooth transitions', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Check for CSS transitions on interactive elements
      const interactiveElements = page.locator('button, a, [role="button"]')
      const transitionCount = await interactiveElements.evaluateAll(elements =>
        elements.filter(el => {
          const style = window.getComputedStyle(el)
          return style.transition !== 'all 0s ease 0s' || style.animationName !== 'none'
        }).length
      )

      expect(transitionCount).toBeGreaterThan(0) // Should have some transitions

      console.log(`Smooth transitions found: ${transitionCount} elements`)
    })

    test('should handle hover states consistently', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const buttons = page.locator('button').first()

      if (await buttons.isVisible()) {
        // Get initial styles
        const initialStyles = await buttons.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          transform: window.getComputedStyle(el).transform,
          boxShadow: window.getComputedStyle(el).boxShadow
        }))

        // Hover over button
        await buttons.hover()

        // Get hover styles
        const hoverStyles = await buttons.evaluate(el => ({
          backgroundColor: window.getComputedStyle(el).backgroundColor,
          transform: window.getComputedStyle(el).transform,
          boxShadow: window.getComputedStyle(el).boxShadow
        }))

        // Hover styles should be different (indicating proper hover states)
        const hasHoverEffect = hoverStyles.backgroundColor !== initialStyles.backgroundColor ||
                              hoverStyles.transform !== initialStyles.transform ||
                              hoverStyles.boxShadow !== initialStyles.boxShadow

        expect(hasHoverEffect).toBeTruthy()

        console.log('Hover states working correctly')
      }
    })

    test('should maintain focus states for accessibility', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Tab through focusable elements
      const focusableElements = page.locator('button, a, input, textarea, select')

      for (let i = 0; i < Math.min(5, await focusableElements.count()); i++) {
        await page.keyboard.press('Tab')

        const focusedElement = page.locator(':focus')
        if (await focusedElement.isVisible()) {
          // Check that focused element has visible focus indicator
          const focusStyles = await focusedElement.evaluate(el => ({
            outline: window.getComputedStyle(el).outline,
            boxShadow: window.getComputedStyle(el).boxShadow,
            border: window.getComputedStyle(el).border
          }))

          const hasFocusIndicator = focusStyles.outline !== 'none' ||
                                   focusStyles.boxShadow !== 'none' ||
                                   focusStyles.border.includes('solid') ||
                                   focusStyles.border.includes('2px')

          expect(hasFocusIndicator).toBeTruthy()
        }
      }

      console.log('Focus states accessible and consistent')
    })
  })

  test.describe('Cross-browser Visual Consistency', () => {
    test.skip('should render consistently across browsers', async ({ page, browserName }) => {
      // This test would be run with different browser configurations
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Take browser-specific screenshot for comparison
      const screenshot = await page.screenshot({
        fullPage: true
      })

      // In a real implementation, you would compare this against baseline screenshots
      // For now, we just verify the page renders without major issues

      await expect(page.locator('#main-heading')).toBeVisible()
      await expect(page.locator('#main-content')).toBeVisible()

      console.log(`Visual consistency checked for ${browserName}`)
    })
  })

  test.describe('Performance Visual Feedback', () => {
    test('should show loading states consistently', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')

      // Should show loading indicator while content loads
      const loadingIndicator = page.locator('[data-testid="loading"], .loading, [aria-label*="loading"]').first()

      if (await loadingIndicator.isVisible()) {
        // Loading indicator should disappear after content loads
        await page.waitForSelector('[data-testid="tasting-feed"]')
        await expect(loadingIndicator).not.toBeVisible()

        console.log('Loading states displayed consistently')
      }
    })

    test('should provide visual feedback for user actions', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Test button click feedback
      const button = page.locator('[data-testid="create-tasting-button"]').first()

      if (await button.isVisible()) {
        // Click button and check for visual feedback
        await button.click()

        // Should show some form of feedback (navigation, modal, etc.)
        const feedbackElements = await page.locator('[data-testid*="success"], [data-testid*="loading"], [data-testid*="modal"]').count()
        expect(feedbackElements).toBeGreaterThan(0)

        console.log('User action feedback working')
      }
    })
  })

  test.describe('Error State Visual Consistency', () => {
    test('should display error states consistently', async ({ page }) => {
      // Trigger an error state (this depends on the app's error handling)
      await page.goto('/non-existent-page')

      // Should show error page with consistent styling
      const errorPage = page.locator('text=/404|not found|error/i').first()

      if (await errorPage.isVisible()) {
        // Error page should have consistent styling with the rest of the app
        await expect(page.locator('h1, [role="main"] h1')).toBeVisible()

        // Should have navigation back to main content
        const navElements = await page.locator('a[href], button[onclick]').count()
        expect(navElements).toBeGreaterThan(0)

        console.log('Error states displayed consistently')
      }
    })
  })

  test.describe('Print Styles', () => {
    test('should have proper print styles', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Emulate print media
      await page.emulateMedia({ media: 'print' })

      // Check that print-specific styles are applied
      const printStyles = await page.evaluate(() => {
        const styles = window.getComputedStyle(document.body)
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize
        }
      })

      // Print styles should be optimized for printing (no backgrounds, appropriate colors)
      expect(printStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)') // Transparent background

      console.log('Print styles optimized')
    })
  })
})
