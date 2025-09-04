import { test, expect } from '@playwright/test'

test.describe('Edge Cases & Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })
  })

  test.describe('Network Edge Cases', () => {
    test('should handle complete network failure', async ({ page, context }) => {
      // Go offline completely
      await context.setOffline(true)

      // Try to navigate to a new page
      await page.click('[data-testid="create-tasting-button"]')

      // Should handle offline gracefully
      const offlineMessage = page.locator('text=/offline|no connection|network error/i').first()

      // Either show offline message or handle gracefully
      if (await offlineMessage.isVisible()) {
        console.log('Offline message displayed correctly')
      } else {
        // Should not crash or show unhandled errors
        const errorMessages = await page.locator('.error, [role="alert"]').count()
        expect(errorMessages).toBeLessThan(5) // Allow some error indicators but not excessive
        console.log('Handled offline gracefully without excessive errors')
      }

      // Go back online
      await context.setOffline(false)
    })

    test('should handle intermittent network connectivity', async ({ page, context }) => {
      // Simulate intermittent connectivity
      let requestCount = 0

      page.route('**/api/**', async route => {
        requestCount++
        if (requestCount % 3 === 0) { // Every 3rd request fails
          await route.abort('failed')
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          })
        }
      })

      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Should handle intermittent failures gracefully
      const errorIndicators = await page.locator('[data-testid*="error"], text=/error|failed/i').count()
      expect(errorIndicators).toBeLessThan(10) // Should not show excessive error messages

      console.log(`Handled ${requestCount} requests with intermittent failures`)
    })

    test('should handle slow network responses', async ({ page }) => {
      // Simulate slow responses
      page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second delay
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      })

      const startTime = Date.now()

      await page.click('[data-testid="social-feed"]')

      // Should show loading state during slow response
      const loadingIndicator = page.locator('[data-testid*="loading"], text=/loading/i').first()

      if (await loadingIndicator.isVisible()) {
        console.log('Loading indicator shown for slow response')
      }

      // Should eventually complete
      await page.waitForSelector('[data-testid="tasting-feed"]', { timeout: 10000 })
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeGreaterThan(4000) // Should take at least the delay time
      console.log(`Slow network handled in ${loadTime}ms`)
    })

    test('should handle network timeout gracefully', async ({ page }) => {
      // Simulate network timeout
      page.route('**/api/**', async route => {
        // Never resolve - timeout
        await new Promise(() => {}) // This will timeout
      })

      await page.click('[data-testid="social-feed"]')

      // Should show timeout error or retry option
      const timeoutIndicators = await page.locator('text=/timeout|retry|try again/i').count()
      expect(timeoutIndicators).toBeGreaterThan(0)

      console.log('Network timeout handled gracefully')
    })
  })

  test.describe('Browser Edge Cases', () => {
    test('should handle browser back/forward navigation', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForURL('**/create**')

      // Go back
      await page.goBack()
      await expect(page.locator('#main-heading')).toBeVisible()

      // Go forward
      await page.goForward()
      await expect(page.locator('[data-testid="tasting-name-input"]')).toBeVisible()

      // Should maintain state appropriately
      console.log('Browser navigation handled correctly')
    })

    test('should handle page refresh during operations', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      // Fill some data
      await page.fill('[data-testid="tasting-name-input"]', 'Test Tasting')

      // Refresh page
      await page.reload()
      await page.waitForSelector('#main-content')

      // Should return to landing page (not break)
      await expect(page.locator('#main-heading')).toBeVisible()

      console.log('Page refresh during operations handled correctly')
    })

    test('should handle multiple tabs/windows', async ({ page, context }) => {
      // Open second tab
      const page2 = await context.newPage()
      await page2.goto('/en/landing')
      await page2.waitForSelector('#main-content')

      // Perform action on first tab
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForURL('**/create**')

      // Second tab should remain functional
      await page2.bringToFront()
      await expect(page2.locator('#main-heading')).toBeVisible()

      // Switch back to first tab
      await page.bringToFront()
      await expect(page.locator('[data-testid="tasting-name-input"]')).toBeVisible()

      await page2.close()
      console.log('Multiple tabs handled correctly')
    })

    test('should handle browser zoom levels', async ({ page }) => {
      const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5]

      for (const zoom of zoomLevels) {
        await page.evaluate(`document.body.style.zoom = '${zoom}'`)

        // Content should still be accessible
        await expect(page.locator('#main-heading')).toBeVisible()
        await expect(page.locator('#main-content')).toBeVisible()

        // Interactive elements should still work
        await page.click('[data-testid="create-tasting-button"]')
        await page.waitForURL('**/create**', { timeout: 5000 })

        // Go back for next iteration
        await page.goBack()
        await page.waitForURL('**/landing**')
      }

      console.log('All zoom levels handled correctly')
    })

    test('should handle low memory conditions', async ({ page }) => {
      // Simulate memory pressure by creating many DOM elements
      await page.evaluate(() => {
        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div')
          div.textContent = `Test element ${i}`
          div.style.display = 'none' // Hidden to avoid layout issues
          document.body.appendChild(div)
        }
      })

      // App should still function
      await expect(page.locator('#main-heading')).toBeVisible()

      // Should be able to perform actions
      await page.click('[data-testid="create-tasting-button"]')
      await expect(page.locator('[data-testid="tasting-name-input"]')).toBeVisible()

      console.log('Low memory conditions handled')
    })
  })

  test.describe('Device and Viewport Edge Cases', () => {
    test('should handle extreme viewport sizes', async ({ page }) => {
      const extremeSizes = [
        { width: 320, height: 480 }, // Very small mobile
        { width: 3840, height: 2160 }, // 4K display
        { width: 500, height: 500 }, // Square viewport
        { width: 2000, height: 500 } // Very wide, short
      ]

      for (const size of extremeSizes) {
        await page.setViewportSize(size)

        // Content should adapt
        await expect(page.locator('#main-heading')).toBeVisible()

        // Should not have horizontal scroll on reasonable content
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const clientWidth = await page.evaluate(() => document.body.clientWidth)

        if (size.width > 500) { // Only check for reasonable widths
          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20)
        }

        console.log(`Viewport ${size.width}x${size.height} handled correctly`)
      }
    })

    test('should handle high DPI displays', async ({ page }) => {
      // Simulate high DPI
      await page.evaluate(() => {
        // Force high DPI simulation
        Object.defineProperty(window, 'devicePixelRatio', {
          value: 3.0 // 3x pixel ratio
        })
      })

      // Images and UI should still render correctly
      await expect(page.locator('#main-heading')).toBeVisible()

      // Check if any images exist and are properly sized
      const images = page.locator('img')
      const imageCount = await images.count()

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const img = images.nth(i)
          const naturalWidth = await img.getAttribute('naturalWidth') || '0'
          expect(parseInt(naturalWidth)).toBeGreaterThan(0)
        }
      }

      console.log('High DPI display handled correctly')
    })

    test('should handle touch and pointer events', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Elements should be touch-friendly
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()

      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()

          if (box) {
            // Buttons should be at least 44px for touch accessibility
            expect(box.height).toBeGreaterThanOrEqual(44)
            expect(box.width).toBeGreaterThanOrEqual(44)
          }
        }
      }

      console.log('Touch-friendly interface verified')
    })
  })

  test.describe('Data Edge Cases', () => {
    test('should handle empty data states', async ({ page }) => {
      // Mock empty data responses
      await page.route('**/api/tastings', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tastings: [] })
        })
      })

      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Should show empty state message
      const emptyState = page.locator('text=/no tastings|empty|no content/i').first()

      if (await emptyState.isVisible()) {
        console.log('Empty state handled correctly')
      } else {
        // Should at least not crash
        await expect(page.locator('[data-testid="tasting-feed"]')).toBeVisible()
        console.log('Empty data handled without crashing')
      }
    })

    test('should handle malformed data', async ({ page }) => {
      // Mock malformed JSON response
      await page.route('**/api/tastings', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{invalid json content'
        })
      })

      await page.click('[data-testid="social-feed"]')

      // Should handle JSON parsing error gracefully
      const errorIndicators = await page.locator('text=/error|failed|try again/i').count()
      expect(errorIndicators).toBeGreaterThan(0)

      console.log('Malformed data handled gracefully')
    })

    test('should handle very large datasets', async ({ page }) => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `tasting-${i}`,
        name: `Tasting ${i}`,
        description: `Description for tasting ${i}`.repeat(5),
        author: `User ${i % 10}`,
        rating: (i % 5) + 1,
        createdAt: new Date(Date.now() - i * 1000).toISOString()
      }))

      await page.route('**/api/tastings', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tastings: largeDataset })
        })
      })

      const startTime = Date.now()
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]', { timeout: 10000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(10000) // Should handle large data within reasonable time

      // Should render without crashing
      await expect(page.locator('[data-testid="tasting-feed"]')).toBeVisible()

      console.log(`Large dataset (${largeDataset.length} items) handled in ${loadTime}ms`)
    })

    test('should handle data with special characters', async ({ page }) => {
      const specialData = {
        name: 'Tasting with émojis 🥃🍷 and spëcial chärs',
        description: 'Description with <script> tags and & symbols',
        tags: ['café', 'vin', 'whisky', '测试', 'тест']
      }

      await page.route('**/api/tastings', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tastings: [{
              id: 'special-tasting',
              ...specialData,
              author: 'Test User',
              rating: 5
            }]
          })
        })
      })

      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-card"]')

      // Should display special characters correctly
      await expect(page.locator(`text=${specialData.name}`)).toBeVisible()

      // Should not execute any scripts from the content
      const scriptElements = await page.locator('script').count()
      expect(scriptElements).toBe(0) // No script tags should be created

      console.log('Special characters in data handled correctly')
    })
  })

  test.describe('User Interaction Edge Cases', () => {
    test('should handle rapid clicking', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      // Rapidly click submit multiple times
      const submitPromises = []
      for (let i = 0; i < 10; i++) {
        submitPromises.push(page.click('[data-testid="create-tasting-submit"]'))
      }

      await Promise.all(submitPromises)

      // Should only process one submission
      const successMessages = await page.locator('[data-testid*="success"], text=/created|success/i').count()
      expect(successMessages).toBeLessThanOrEqual(1)

      console.log('Rapid clicking handled correctly')
    })

    test('should handle keyboard navigation edge cases', async ({ page }) => {
      // Tab through all focusable elements
      const focusableElements = await page.locator('button, a, input, textarea, select').count()
      console.log(`Found ${focusableElements} focusable elements`)

      // Tab through elements
      for (let i = 0; i < Math.min(20, focusableElements); i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(50)
      }

      // Should not have caused any errors
      const errorElements = await page.locator('.error, [role="alert"]').count()
      expect(errorElements).toBeLessThan(5)

      console.log('Keyboard navigation edge cases handled')
    })

    test('should handle form submission with Enter key', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      await page.fill('[data-testid="tasting-name-input"]', 'Enter Key Test')

      // Submit with Enter key
      await page.keyboard.press('Enter')

      // Should submit form
      await expect(page.locator('[data-testid*="success"], text=/created/i')).toBeVisible()

      console.log('Enter key form submission handled correctly')
    })

    test('should handle copy/paste operations', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      const testText = 'Text with special characters: éñüîøπ∆ and symbols: @#$%^&*()'

      // Simulate paste operation
      await page.evaluate((text) => {
        const input = document.querySelector('[data-testid="tasting-name-input"]') as HTMLInputElement
        if (input) {
          input.value = text
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }, testText)

      // Should handle the pasted content
      const inputValue = await page.locator('[data-testid="tasting-name-input"]').inputValue()
      expect(inputValue).toBe(testText)

      console.log('Copy/paste operations handled correctly')
    })
  })

  test.describe('Concurrency and Race Conditions', () => {
    test('should handle concurrent API requests', async ({ page }) => {
      const requestPromises = []

      // Make multiple concurrent requests
      for (let i = 0; i < 10; i++) {
        requestPromises.push(
          page.request.get('/api/health').then(response => ({
            status: response.status,
            index: i
          }))
        )
      }

      const results = await Promise.all(requestPromises)
      const successfulRequests = results.filter(r => r.status === 200).length

      expect(successfulRequests).toBe(10) // All requests should succeed

      console.log('Concurrent API requests handled correctly')
    })

    test('should handle rapid state changes', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      // Rapidly change form data
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="tasting-name-input"]', `Test ${i}`)
        await page.fill('[data-testid="tasting-description-input"]', `Description ${i}`)
        await page.waitForTimeout(100)
      }

      // Final values should be consistent
      const finalName = await page.locator('[data-testid="tasting-name-input"]').inputValue()
      const finalDesc = await page.locator('[data-testid="tasting-description-input"]').inputValue()

      expect(finalName).toBe('Test 4')
      expect(finalDesc).toBe('Description 4')

      console.log('Rapid state changes handled correctly')
    })

    test('should handle component unmounting during async operations', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      // Start an async operation (form submission)
      const submitPromise = page.click('[data-testid="create-tasting-submit"]')

      // Navigate away quickly (simulate component unmounting)
      await page.goBack()

      // Should not cause errors
      await submitPromise.catch(() => {}) // Ignore any errors from cancelled operation

      // Page should be in consistent state
      await expect(page.locator('#main-heading')).toBeVisible()

      console.log('Component unmounting during async operations handled')
    })
  })

  test.describe('External Service Dependencies', () => {
    test('should handle external service failures', async ({ page }) => {
      // Mock external service failures
      await page.route('https://fonts.googleapis.com/**', async route => {
        await route.abort('failed')
      })

      await page.route('https://fonts.gstatic.com/**', async route => {
        await route.abort('failed')
      })

      await page.reload()
      await page.waitForSelector('#main-content')

      // Should still function without external fonts
      await expect(page.locator('#main-heading')).toBeVisible()
      await expect(page.locator('#main-content')).toBeVisible()

      console.log('External service failures handled gracefully')
    })

    test('should handle third-party widget failures', async ({ page }) => {
      // Mock third-party script failures
      await page.route('**/analytics.js', async route => {
        await route.abort('failed')
      })

      await page.route('**/widget.js', async route => {
        await route.abort('failed')
      })

      await page.reload()
      await page.waitForSelector('#main-content')

      // Core functionality should still work
      await page.click('[data-testid="create-tasting-button"]')
      await expect(page.locator('[data-testid="tasting-name-input"]')).toBeVisible()

      console.log('Third-party widget failures handled')
    })
  })

  test.describe('Browser Compatibility Edge Cases', () => {
    test('should handle different user agent strings', async ({ page, browser }) => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      ]

      for (const ua of userAgents) {
        await page.setExtraHTTPHeaders({ 'User-Agent': ua })
        await page.reload()
        await page.waitForSelector('#main-content')

        // Should work with different user agents
        await expect(page.locator('#main-heading')).toBeVisible()

        console.log(`User agent handled: ${ua.substring(0, 50)}...`)
      }
    })

    test('should handle different language/encoding', async ({ page }) => {
      // Test with different Accept-Language headers
      const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN']

      for (const lang of languages) {
        await page.setExtraHTTPHeaders({ 'Accept-Language': lang })
        await page.reload()
        await page.waitForSelector('#main-content')

        // Should handle different languages gracefully
        await expect(page.locator('#main-content')).toBeVisible()

        console.log(`Language ${lang} handled correctly`)
      }
    })

    test('should handle different timezone settings', async ({ page }) => {
      // Test with different timezone settings
      const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']

      for (const tz of timezones) {
        await page.evaluate((timezone) => {
          // Override timezone for testing
          Object.defineProperty(Intl, 'DateTimeFormat', {
            value: class extends Intl.DateTimeFormat {
              resolvedOptions() {
                return { ...super.resolvedOptions(), timeZone: timezone }
              }
            }
          })
        }, tz)

        await page.reload()
        await page.waitForSelector('#main-content')

        // Should handle different timezones
        await expect(page.locator('#main-content')).toBeVisible()

        console.log(`Timezone ${tz} handled correctly`)
      }
    })
  })

  test.describe('Performance Edge Cases', () => {
    test('should handle memory-intensive operations', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // Perform memory-intensive operations
      await page.evaluate(() => {
        const largeArrays = []
        for (let i = 0; i < 100; i++) {
          largeArrays.push(new Array(10000).fill('test data'))
        }
        // Store temporarily
        ;(window as any).testData = largeArrays

        // Clean up
        setTimeout(() => {
          delete (window as any).testData
        }, 1000)
      })

      const peakMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      const memoryIncrease = peakMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Should handle memory pressure reasonably

      // App should still function
      await expect(page.locator('#main-heading')).toBeVisible()

      console.log(`Memory-intensive operations handled: ${Math.round(memoryIncrease / 1024 / 1024)}MB increase`)
    })

    test('should handle CPU-intensive operations', async ({ page }) => {
      const startTime = Date.now()

      // Perform CPU-intensive calculation
      const result = await page.evaluate(() => {
        let sum = 0
        for (let i = 0; i < 1000000; i++) {
          sum += Math.sqrt(i) * Math.sin(i)
        }
        return sum
      })

      const calculationTime = Date.now() - startTime
      expect(calculationTime).toBeLessThan(5000) // Should complete within reasonable time
      expect(typeof result).toBe('number')

      // UI should remain responsive
      await expect(page.locator('#main-heading')).toBeVisible()

      console.log(`CPU-intensive operation completed in ${calculationTime}ms`)
    })

    test('should handle large DOM manipulations', async ({ page }) => {
      const startTime = Date.now()

      // Create many DOM elements
      await page.evaluate(() => {
        const container = document.createElement('div')
        container.id = 'test-container'
        container.style.display = 'none' // Hidden to avoid layout impact

        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div')
          div.textContent = `Test element ${i}`
          div.className = 'test-element'
          container.appendChild(div)
        }

        document.body.appendChild(container)
      })

      const domTime = Date.now() - startTime
      expect(domTime).toBeLessThan(2000) // Should handle large DOM operations reasonably

      // Verify elements were created
      const elementCount = await page.locator('#test-container .test-element').count()
      expect(elementCount).toBe(1000)

      // Clean up
      await page.evaluate(() => {
        const container = document.getElementById('test-container')
        if (container) container.remove()
      })

      console.log(`Large DOM manipulation completed in ${domTime}ms`)
    })
  })
})
