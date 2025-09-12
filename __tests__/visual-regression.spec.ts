import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.describe('Design System Components', () => {
    test('Button variants - light mode', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Wait for buttons to load
      await page.waitForSelector('[data-testid="button-primary"]')

      // Take screenshot of button variants
      await expect(page.locator('[data-testid="button-section"]')).toHaveScreenshot('buttons-light.png', {
        threshold: 0.1,
        fullPage: false
      })
    })

    test('Button variants - dark mode', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      // Switch to dark mode
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="dark"]')

      // Wait for buttons to load
      await page.waitForSelector('[data-testid="button-primary"]')

      // Take screenshot of button variants in dark mode
      await expect(page.locator('[data-testid="button-section"]')).toHaveScreenshot('buttons-dark.png', {
        threshold: 0.1,
        fullPage: false
      })
    })

    test('Input components', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      await page.waitForSelector('[data-testid="input-section"]')

      await expect(page.locator('[data-testid="input-section"]')).toHaveScreenshot('inputs.png', {
        threshold: 0.1,
        fullPage: false
      })
    })

    test('Loading states', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      await page.waitForSelector('[data-testid="loading-section"]')

      await expect(page.locator('[data-testid="loading-section"]')).toHaveScreenshot('loading-states.png', {
        threshold: 0.1,
        fullPage: false
      })
    })

    test('Empty states', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      await page.waitForSelector('[data-testid="empty-section"]')

      await expect(page.locator('[data-testid="empty-section"]')).toHaveScreenshot('empty-states.png', {
        threshold: 0.1,
        fullPage: false
      })
    })
  })

  test.describe('Page Layouts', () => {
    test('Landing page - desktop', async ({ page }) => {
      await page.goto('/en')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-page-desktop.png', {
        threshold: 0.05,
        fullPage: true
      })
    })

    test('Landing page - mobile', async ({ page, context }) => {
      // Set mobile viewport
      await context.addCookies([{ name: 'viewport', value: 'mobile', domain: 'localhost' }])
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/en')
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveScreenshot('landing-page-mobile.png', {
        threshold: 0.05,
        fullPage: true
      })
    })

    test('Flavor wheels page', async ({ page }) => {
      await page.goto('/en/flavor-wheels')
      await page.waitForLoadState('networkidle')

      // Wait for flavor wheel to render
      await page.waitForSelector('[data-testid="flavor-wheel"]', { timeout: 10000 })

      await expect(page.locator('[data-testid="flavor-wheel-container"]')).toHaveScreenshot('flavor-wheel.png', {
        threshold: 0.1,
        fullPage: false
      })
    })

    test('Navigation - desktop', async ({ page }) => {
      await page.goto('/en')
      await page.waitForLoadState('networkidle')

      await expect(page.locator('[data-testid="desktop-navigation"]')).toHaveScreenshot('navigation-desktop.png', {
        threshold: 0.05,
        fullPage: false
      })
    })

    test('Navigation - mobile', async ({ page, context }) => {
      await context.addCookies([{ name: 'viewport', value: 'mobile', domain: 'localhost' }])
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/en')
      await page.waitForLoadState('networkidle')

      await expect(page.locator('[data-testid="mobile-navigation"]')).toHaveScreenshot('navigation-mobile.png', {
        threshold: 0.05,
        fullPage: false
      })
    })
  })

  test.describe('Theme Consistency', () => {
    test('Theme switching - light to dark', async ({ page }) => {
      await page.goto('/en')

      // Capture light mode
      await expect(page.locator('body')).toHaveScreenshot('theme-light.png', {
        threshold: 0.05,
        fullPage: false
      })

      // Switch to dark mode
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="dark"]')

      // Capture dark mode
      await expect(page.locator('body')).toHaveScreenshot('theme-dark.png', {
        threshold: 0.05,
        fullPage: false
      })

      // Switch to high contrast
      await page.click('[data-testid="theme-toggle"]')
      await page.waitForSelector('[data-theme="high-contrast"]')

      // Capture high contrast mode
      await expect(page.locator('body')).toHaveScreenshot('theme-high-contrast.png', {
        threshold: 0.05,
        fullPage: false
      })
    })
  })

  test.describe('Interactive States', () => {
    test('Button hover states', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      const button = page.locator('[data-testid="button-primary"]').first()

      // Normal state
      await expect(button).toHaveScreenshot('button-normal.png', {
        threshold: 0.05,
        fullPage: false
      })

      // Hover state
      await button.hover()
      await page.waitForTimeout(100) // Wait for hover effect
      await expect(button).toHaveScreenshot('button-hover.png', {
        threshold: 0.05,
        fullPage: false
      })
    })

    test('Input focus states', async ({ page }) => {
      await page.goto('/en/test/visual-regression')

      const input = page.locator('[data-testid="input-field"]').first()

      // Normal state
      await expect(input).toHaveScreenshot('input-normal.png', {
        threshold: 0.05,
        fullPage: false
      })

      // Focus state
      await input.focus()
      await page.waitForTimeout(100) // Wait for focus effect
      await expect(input).toHaveScreenshot('input-focus.png', {
        threshold: 0.05,
        fullPage: false
      })
    })
  })

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'desktop-xl', width: 1920, height: 1080 }
    ]

    for (const breakpoint of breakpoints) {
      test(`Layout at ${breakpoint.name} breakpoint`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        await page.goto('/en')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('main')).toHaveScreenshot(`layout-${breakpoint.name}.png`, {
          threshold: 0.1,
          fullPage: false
        })
      })
    }
  })
})
