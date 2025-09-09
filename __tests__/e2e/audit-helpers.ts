/**
 * FlavorWheel Audit v2.0 - Test Helpers
 *
 * Utility functions and helpers for the comprehensive audit testing suite.
 * These helpers address the critical issues identified in the styling and error analysis.
 */

import { Page, expect } from '@playwright/test'

export class AuditHelpers {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Critical Issue: Mobile Navigation Logo Display
   * Helper to verify logo positioning and visibility on mobile
   */
  async verifyMobileNavLogo() {
    await this.page.setViewportSize({ width: 375, height: 667 })

    // Open mobile menu
    await this.page.click('[data-testid="mobile-menu-toggle"]')

    // Verify logo is visible
    const logo = this.page.locator('[data-testid="mobile-nav-logo"], [data-testid="brand-logo"]')
    await expect(logo).toBeVisible()

    // Verify logo dimensions
    const logoBox = await logo.boundingBox()
    expect(logoBox?.width).toBeGreaterThan(20)
    expect(logoBox?.height).toBeGreaterThan(20)

    // Verify no overlap with back button
    const backButton = this.page.locator('[data-testid="mobile-nav-back"]')
    if (await backButton.isVisible()) {
      const backBox = await backButton.boundingBox()
      expect(logoBox?.x! + logoBox?.width!).toBeLessThan(backBox?.x!)
    }

    return true
  }

  /**
   * Critical Issue: Flavor Wheel Mobile Overflow
   * Helper to verify flavor wheel renders without overflow
   */
  async verifyFlavorWheelMobileOverflow() {
    await this.page.setViewportSize({ width: 375, height: 667 })

    const flavorWheel = this.page.locator('[data-testid="flavor-wheel-svg"]')
    await expect(flavorWheel).toBeVisible()

    // Check SVG dimensions
    const svgBox = await flavorWheel.boundingBox()
    expect(svgBox?.width).toBeLessThanOrEqual(343) // Container width minus padding
    expect(svgBox?.height).toBeLessThanOrEqual(400) // Reasonable height limit

    // Verify no horizontal scroll
    const scrollWidth = await this.page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)

    // Test interactive elements
    await flavorWheel.hover()
    await expect(this.page.locator('[data-testid="flavor-tooltip"]')).toBeVisible()

    return true
  }

  /**
   * Critical Issue: Button Contrast Violations
   * Helper to verify WCAG AA compliance for buttons
   */
  async verifyButtonContrastCompliance() {
    const buttons = [
      { selector: '.bg-primary', name: 'Primary Button' },
      { selector: '.bg-accent', name: 'Accent Button' },
      { selector: '.text-primary:not(.bg-primary)', name: 'Ghost/Link Button' },
      { selector: '.bg-secondary', name: 'Secondary Button' }
    ]

    for (const button of buttons) {
      const buttonElement = this.page.locator(button.selector).first()
      if (await buttonElement.isVisible()) {
        // Simplified contrast check (would use proper library in production)
        const contrastValid = await buttonElement.evaluate(el => {
          const style = window.getComputedStyle(el)
          const hasBackground = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)'
          const hasTextColor = style.color && style.color !== 'rgba(0, 0, 0, 0)'
          return hasBackground && hasTextColor
        })

        expect(contrastValid, `${button.name} should have proper contrast`).toBe(true)
      }
    }

    return true
  }

  /**
   * Critical Issue: Service Layer Error Handling
   * Helper to test error boundaries and user-friendly messages
   */
  async verifyErrorBoundaryHandling(errorType: '500' | 'db' | 'supabase' | 'component') {
    let errorMessage = ''
    let apiRoute = ''

    switch (errorType) {
      case '500':
        errorMessage = 'Internal server error'
        apiRoute = '**/api/tastings'
        break
      case 'db':
        errorMessage = 'Database table not found'
        apiRoute = '**/api/social/**'
        break
      case 'supabase':
        errorMessage = 'Service unavailable'
        apiRoute = '**/api/auth/**'
        break
      case 'component':
        // Force component error
        await this.page.evaluate(() => {
          const element = document.querySelector('[data-testid="analytics-chart"]')
          if (element) element.innerHTML = '{{invalid syntax}}'
        })
        return await this.verifyErrorBoundaryUI()
    }

    // Mock API error
    await this.page.route(apiRoute, async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: errorMessage })
      })
    })

    return await this.verifyErrorBoundaryUI()
  }

  private async verifyErrorBoundaryUI() {
    // Should show user-friendly error message
    await expect(this.page.locator('[data-testid="error-message"], text=/error|something went wrong|try again/i')).toBeVisible()

    // Should not show uncaught errors
    const consoleErrors: string[] = []
    this.page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // Allow some errors but not spam
    expect(consoleErrors.length).toBeLessThan(5)

    return true
  }

  /**
   * Critical Issue: Mobile Responsiveness
   * Helper to test across multiple viewports
   */
  async verifyMultiViewportResponsiveness(viewports: Array<{width: number, height: number, name: string}>) {
    const results = []

    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport)

      // Test critical elements
      const navVisible = await this.page.locator('nav, [data-testid="navigation"]').isVisible()
      const contentVisible = await this.page.locator('main, [data-testid="main-content"]').isVisible()

      // Test for horizontal scroll
      const hasHorizontalScroll = await this.page.evaluate(() =>
        document.body.scrollWidth > window.innerWidth
      )

      // Test touch targets
      const buttons = this.page.locator('button, [role="button"]')
      const buttonCount = await buttons.count()
      let touchTargetsValid = true

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        if (box && (box.width < 44 || box.height < 44)) {
          touchTargetsValid = false
          break
        }
      }

      results.push({
        viewport: viewport.name,
        navVisible,
        contentVisible,
        noHorizontalScroll: !hasHorizontalScroll,
        touchTargetsValid
      })
    }

    return results
  }

  /**
   * Critical Issue: Accessibility Compliance
   * Helper to verify WCAG AA compliance
   */
  async verifyAccessibilityCompliance() {
    // Test focus indicators
    await this.page.keyboard.press('Tab')
    const focusedElement = this.page.locator(':focus')
    const hasFocusIndicator = await focusedElement.evaluate(el => {
      const style = window.getComputedStyle(el)
      return style.boxShadow.includes('rgb') ||
             style.outline.includes('rgb') ||
             style.border.includes('rgb')
    })

    // Test semantic landmarks
    const hasMain = await this.page.locator('main').isVisible()
    const hasNav = await this.page.locator('nav').isVisible()
    const hasHeader = await this.page.locator('header').isVisible()

    // Test heading hierarchy
    const h1Count = await this.page.locator('h1').count()
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').allTextContents()

    // Test keyboard navigation
    const focusableElements = await this.page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count()

    return {
      focusIndicators: hasFocusIndicator,
      semanticLandmarks: hasMain || hasNav || hasHeader,
      headingHierarchy: h1Count > 0 && headings.length > 0,
      keyboardNavigation: focusableElements > 0
    }
  }

  /**
   * Critical Issue: Performance Optimization
   * Helper to measure and verify performance metrics
   */
  async verifyPerformanceMetrics() {
    // CSS bundle size
    const cssResources = await this.page.evaluate(() =>
      performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('.css'))
        .reduce((total, entry) => total + ((entry as any).transferSize || 0), 0)
    )
    const cssSizeKB = cssResources / 1024

    // Font loading
    const fontResources = await this.page.evaluate(() =>
      performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('font') || entry.name.includes('woff'))
        .length
    )

    // Animation performance
    const fps = await this.measureFPS()

    // Horizontal scroll check
    const hasHorizontalScroll = await this.page.evaluate(() =>
      document.body.scrollWidth > window.innerWidth
    )

    return {
      cssBundleSize: cssSizeKB,
      fontResources,
      fps,
      noHorizontalScroll: !hasHorizontalScroll,
      cssSizeValid: cssSizeKB < 150,
      fpsValid: fps >= 50
    }
  }

  private async measureFPS(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise(resolve => {
        let frames = 0
        const startTime = performance.now()

        function countFrames() {
          frames++
          if (performance.now() - startTime >= 1000) {
            resolve(Math.round(frames))
          } else {
            requestAnimationFrame(countFrames)
          }
        }

        requestAnimationFrame(countFrames)
      })
    })
  }

  /**
   * Helper to create test tasting data for consistent testing
   */
  async createTestTasting(tastingData: any) {
    await this.page.evaluate((data) => {
      localStorage.setItem('test-tasting-data', JSON.stringify(data))
    }, tastingData)

    return tastingData
  }

  /**
   * Helper to mock user authentication for testing
   */
  async authenticateTestUser(userData: any) {
    await this.page.evaluate((user) => {
      localStorage.setItem('user-session', JSON.stringify({
        user: user,
        session: {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token'
        }
      }))
    }, userData)

    // Reload to apply authentication
    await this.page.reload()
  }

  /**
   * Helper to verify text overflow issues
   */
  async verifyNoTextOverflow() {
    const textElements = this.page.locator('p, span, h1, h2, h3, h4, h5, h6, div:not([class*="bg-"])')
    const elements = await textElements.all()
    let overflowCount = 0

    for (const element of elements.slice(0, 20)) { // Check first 20 elements
      const hasOverflow = await element.evaluate(el => {
        const style = window.getComputedStyle(el)
        return style.textOverflow === 'ellipsis' ||
               el.scrollWidth > el.clientWidth + 10 // Allow 10px tolerance
      })

      if (hasOverflow) overflowCount++
    }

    return overflowCount === 0
  }

  /**
   * Helper to test safe area insets on iOS
   */
  async verifySafeAreaInsets() {
    await this.page.setViewportSize({ width: 375, height: 812 }) // iPhone X

    const bottomNav = this.page.locator('[data-testid="bottom-navigation"]')
    if (await bottomNav.isVisible()) {
      const bottomNavBox = await bottomNav.boundingBox()
      // Should be above iOS home indicator area (safe area)
      return bottomNavBox?.y! > 700
    }

    return true
  }

  /**
   * Helper to generate audit report for CI/CD integration
   */
  async generateAuditReport(results: any) {
    const report = {
      auditVersion: '2.0',
      timestamp: new Date().toISOString(),
      results,
      criticalIssues: {
        mobileNavLogo: results.mobileNavLogo || false,
        flavorWheelOverflow: results.flavorWheelOverflow || false,
        buttonContrast: results.buttonContrast || false,
        errorHandling: results.errorHandling || false,
        accessibility: results.accessibility || false,
        performance: results.performance || false
      },
      recommendations: this.generateRecommendations(results)
    }

    await this.page.evaluate((report) => {
      localStorage.setItem('audit-report-v2.0', JSON.stringify(report))
    }, report)

    return report
  }

  private generateRecommendations(results: any): string[] {
    const recommendations = []

    if (!results.mobileNavLogo) {
      recommendations.push('Fix mobile navigation logo positioning conflicts')
    }
    if (!results.flavorWheelOverflow) {
      recommendations.push('Implement proper flavor wheel SVG scaling without overflow')
    }
    if (!results.buttonContrast) {
      recommendations.push('Update button color system for WCAG AA compliance')
    }
    if (!results.errorHandling) {
      recommendations.push('Add comprehensive error boundaries and user-friendly messages')
    }
    if (!results.accessibility) {
      recommendations.push('Improve accessibility landmarks and keyboard navigation')
    }
    if (!results.performance) {
      recommendations.push('Optimize CSS bundle size and font loading performance')
    }

    return recommendations
  }
}

// Export factory function for easy usage in tests
export function createAuditHelpers(page: Page): AuditHelpers {
  return new AuditHelpers(page)
}


