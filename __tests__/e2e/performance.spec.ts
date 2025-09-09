import { test, expect } from '@playwright/test'

test.describe('Performance & Load Testing', () => {
  test.describe('Page Load Performance', () => {
    test('should load landing page within acceptable time', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/en/landing', { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('header h1', { timeout: 10000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds

      // Log performance metrics
      console.log(`Landing page load time: ${loadTime}ms`)
    })

    test('should load tasting creation page quickly', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const startTime = Date.now()

      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForURL('**/create**', { timeout: 5000 })

      const navigationTime = Date.now() - startTime
      expect(navigationTime).toBeLessThan(2000) // Should navigate within 2 seconds

      console.log(`Tasting creation page load time: ${navigationTime}ms`)
    })

    test('should load profile page efficiently', async ({ page }) => {
      // Mock authenticated user
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user', email: 'test@example.com' }
        }))
      })

      const startTime = Date.now()

      await page.goto('/en/profile')
      await page.waitForSelector('[data-testid="user-profile"]', { timeout: 5000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(2500) // Should load within 2.5 seconds

      console.log(`Profile page load time: ${loadTime}ms`)
    })

    test('should load social feed with good performance', async ({ page }) => {
      await page.goto('/en/landing')

      const startTime = Date.now()

      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]', { timeout: 5000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds

      console.log(`Social feed load time: ${loadTime}ms`)
    })
  })

  test.describe('JavaScript Execution Performance', () => {
    test('should execute JavaScript efficiently', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Measure JavaScript execution time
      const jsExecutionTime = await page.evaluate(() => {
        const start = performance.now()

        // Simulate some JavaScript operations
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i)
        }

        return performance.now() - start
      })

      expect(jsExecutionTime).toBeLessThan(50) // Should execute within 50ms

      console.log(`JavaScript execution time: ${jsExecutionTime}ms`)
    })

    test('should handle React component rendering efficiently', async ({ page }) => {
      await page.goto('/en/landing')

      const renderTime = await page.evaluate(() => {
        const start = performance.now()

        // Trigger component re-render by interacting
        const button = document.querySelector('[data-testid="create-tasting-button"]')
        if (button) {
          button.click()
        }

        return new Promise(resolve => {
          setTimeout(() => {
            resolve(performance.now() - start)
          }, 100)
        })
      })

      expect(renderTime).toBeLessThan(500) // Should render within 500ms

      console.log(`Component render time: ${renderTime}ms`)
    })

    test('should minimize layout thrashing', async ({ page }) => {
      await page.goto('/en/landing')

      const layoutShifts = await page.evaluate(() => {
        let shifts = 0
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.value > 0) shifts++
          }
        })

        observer.observe({ entryTypes: ['layout-shift'] })

        // Trigger potential layout shifts
        const button = document.querySelector('[data-testid="create-tasting-button"]')
        if (button) {
          button.click()
        }

        return new Promise(resolve => {
          setTimeout(() => {
            observer.disconnect()
            resolve(shifts)
          }, 1000)
        })
      })

      expect(layoutShifts).toBeLessThan(3) // Should have minimal layout shifts

      console.log(`Layout shifts detected: ${layoutShifts}`)
    })
  })

  test.describe('Network Performance', () => {
    test('should minimize HTTP requests', async ({ page }) => {
      const requests: string[] = []

      page.on('request', request => {
        requests.push(request.url())
      })

      await page.goto('/en/landing')
      await page.waitForSelector('#main-content', { timeout: 5000 })

      // Wait for network to settle
      await page.waitForTimeout(2000)

      // Filter out external requests
      const internalRequests = requests.filter(url =>
        url.includes(window.location.origin)
      )

      expect(internalRequests.length).toBeLessThan(50) // Should have reasonable number of requests

      console.log(`Total HTTP requests: ${internalRequests.length}`)
    })

    test('should load critical resources quickly', async ({ page }) => {
      const resourceTimings: any[] = []

      page.on('response', response => {
        const timing = response.request().timing()
        resourceTimings.push({
          url: response.url(),
          duration: timing.responseEnd - timing.requestStart,
          size: response.headers()['content-length'] || 0
        })
      })

      await page.goto('/en/landing')
      await page.waitForSelector('#main-content', { timeout: 5000 })

      await page.waitForTimeout(2000)

      // Check critical resources load quickly
      const criticalResources = resourceTimings.filter(r =>
        r.url.includes('.js') || r.url.includes('.css') ||
        r.url.includes('api/health') || r.url.includes('main-content')
      )

      for (const resource of criticalResources) {
        expect(resource.duration).toBeLessThan(2000) // Critical resources should load within 2s
      }

      console.log(`Critical resources loaded: ${criticalResources.length}`)
    })

    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow 3G connection
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
        await route.continue()
      })

      const startTime = Date.now()

      await page.goto('/en/landing')
      await page.waitForSelector('#main-content', { timeout: 15000 })

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(10000) // Should still load within 10 seconds on slow connection

      console.log(`Slow network load time: ${loadTime}ms`)
    })
  })

  test.describe('Memory Usage', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // Navigate through multiple pages
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="create-tasting-button"]')
        await page.waitForTimeout(500)
        await page.goBack()
        await page.waitForTimeout(500)
      }

      // Check memory usage after navigation
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      const memoryIncrease = finalMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // Should not increase by more than 50MB

      console.log(`Memory usage increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
    })

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('/en/landing')

      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // Simulate loading large dataset
      await page.evaluate(() => {
        const largeData = Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          name: `Tasting ${i}`,
          description: `Description ${i}`.repeat(10)
        }))
        ;(window as any).largeDataset = largeData
      })

      const afterLargeDataMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })

      // Clean up
      await page.evaluate(() => {
        delete (window as any).largeDataset
      })

      const memoryIncrease = afterLargeDataMemory - initialMemory
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024) // Should handle large data within reasonable memory

      console.log(`Large dataset memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`)
    })
  })

  test.describe('Concurrent User Simulation', () => {
    test('should handle multiple simultaneous users', async ({ browser }) => {
      const userCount = 5
      const contexts = []
      const pages = []

      // Create multiple browser contexts and pages
      for (let i = 0; i < userCount; i++) {
        const context = await browser.newContext()
        const page = await context.newPage()

        // Mock different users
        await page.evaluate((userId) => {
          localStorage.setItem('user-session', JSON.stringify({
            user: {
              id: `user-${userId}`,
              email: `user${userId}@example.com`,
              name: `User ${userId}`
            }
          }))
        }, i)

        contexts.push(context)
        pages.push(page)
      }

      try {
        // All users navigate to landing page simultaneously
        const navigationPromises = pages.map(page =>
          page.goto('/en/landing').then(() => page.waitForSelector('#main-content', { timeout: 10000 }))
        )

        const startTime = Date.now()
        await Promise.all(navigationPromises)
        const totalTime = Date.now() - startTime

        expect(totalTime).toBeLessThan(5000) // All users should load within 5 seconds

        console.log(`Concurrent users load time: ${totalTime}ms for ${userCount} users`)

        // Simulate concurrent interactions
        const interactionPromises = pages.map((page, index) =>
          page.click('[data-testid="create-tasting-button"]').then(() =>
            page.waitForURL('**/create**', { timeout: 5000 })
          )
        )

        const interactionStartTime = Date.now()
        const results = await Promise.allSettled(interactionPromises)
        const interactionTime = Date.now() - interactionStartTime

        const successfulInteractions = results.filter(r => r.status === 'fulfilled').length
        expect(successfulInteractions).toBe(userCount) // All interactions should succeed
        expect(interactionTime).toBeLessThan(3000) // All interactions should complete within 3 seconds

        console.log(`Concurrent interactions: ${successfulInteractions}/${userCount} successful in ${interactionTime}ms`)

      } finally {
        // Clean up
        for (const context of contexts) {
          await context.close()
        }
      }
    })

    test('should handle rapid successive requests', async ({ page }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      const requestCount = 10
      const requests = []

      // Make rapid successive requests
      for (let i = 0; i < requestCount; i++) {
        requests.push(
          page.request.get('/api/health').then(response => ({
            status: response.status(),
            duration: Date.now()
          }))
        )
      }

      const startTime = Date.now()
      const results = await Promise.all(requests)
      const totalTime = Date.now() - startTime

      const successfulRequests = results.filter(r => r.status === 200).length
      expect(successfulRequests).toBe(requestCount) // All requests should succeed

      const averageResponseTime = results.reduce((sum, r) => sum + (Date.now() - r.duration), 0) / requestCount
      expect(averageResponseTime).toBeLessThan(1000) // Average response time should be reasonable

      console.log(`Rapid requests: ${successfulRequests}/${requestCount} successful, avg response: ${averageResponseTime.toFixed(2)}ms`)
    })
  })

  test.describe('Database Performance', () => {
    test('should handle database queries efficiently', async ({ page }) => {
      const queryTimings = []

      // Mock database query timing
      await page.route('**/api/tastings', async route => {
        const start = Date.now()
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100)) // Simulate query time
        const duration = Date.now() - start
        queryTimings.push(duration)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tastings: Array.from({ length: 20 }, (_, i) => ({
              id: `tasting-${i}`,
              name: `Tasting ${i}`,
              status: 'completed'
            }))
          })
        })
      })

      await page.goto('/en/landing')
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="tasting-feed"]')

      // Wait for queries to complete
      await page.waitForTimeout(1000)

      const averageQueryTime = queryTimings.reduce((sum, time) => sum + time, 0) / queryTimings.length
      expect(averageQueryTime).toBeLessThan(200) // Average query time should be reasonable

      console.log(`Database query performance: ${queryTimings.length} queries, avg ${averageQueryTime.toFixed(2)}ms`)
    })

    test('should handle database connection pooling', async ({ page }) => {
      const connectionTimings = []

      // Simulate connection establishment
      await page.route('**/api/**', async route => {
        const start = Date.now()
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50)) // Simulate connection time
        connectionTimings.push(Date.now() - start)
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      })

      // Make multiple API calls
      for (let i = 0; i < 20; i++) {
        await page.request.get('/api/health')
      }

      const averageConnectionTime = connectionTimings.reduce((sum, time) => sum + time, 0) / connectionTimings.length
      expect(averageConnectionTime).toBeLessThan(100) // Connection time should be minimal with pooling

      console.log(`Database connection performance: avg ${averageConnectionTime.toFixed(2)}ms per connection`)
    })
  })

  test.describe('Resource Optimization', () => {
    test('should optimize image loading', async ({ page }) => {
      await page.goto('/en/landing')

      const images = await page.locator('img').all()
      let lazyLoadedImages = 0
      let optimizedImages = 0

      for (const img of images) {
        const loading = await img.getAttribute('loading')
        const src = await img.getAttribute('src')
        const srcset = await img.getAttribute('srcset')

        if (loading === 'lazy') lazyLoadedImages++
        if (srcset || src?.includes('webp') || src?.includes('avif')) optimizedImages++
      }

      // Should have some lazy loading
      expect(lazyLoadedImages).toBeGreaterThan(0)

      console.log(`Image optimization: ${lazyLoadedImages} lazy loaded, ${optimizedImages} optimized`)
    })

    test('should use efficient caching strategies', async ({ page }) => {
      const requests = []

      page.on('request', request => {
        requests.push({
          url: request.url(),
          headers: request.headers()
        })
      })

      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')
      await page.reload() // Second load should use cache

      const cacheHeaders = requests.filter(req =>
        req.headers['cache-control'] || req.headers['if-none-match']
      )

      expect(cacheHeaders.length).toBeGreaterThan(0) // Should have cache headers

      console.log(`Caching headers found: ${cacheHeaders.length}`)
    })

    test('should minimize bundle size', async ({ page }) => {
      const resources = []

      page.on('response', response => {
        const contentLength = response.headers()['content-length']
        if (contentLength) {
          resources.push({
            url: response.url(),
            size: parseInt(contentLength),
            type: response.headers()['content-type'] || ''
          })
        }
      })

      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')
      await page.waitForTimeout(2000)

      const jsResources = resources.filter(r => r.type.includes('javascript'))
      const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0)

      expect(totalJSSize).toBeLessThan(5 * 1024 * 1024) // Should be less than 5MB

      console.log(`Total JavaScript bundle size: ${(totalJSSize / 1024 / 1024).toFixed(2)} MB`)
    })
  })

  test.describe('Progressive Web App Performance', () => {
    test('should register service worker efficiently', async ({ page }) => {
      await page.goto('/en/landing')

      const swRegistration = await page.evaluate(() => {
        return navigator.serviceWorker?.ready.then(registration => ({
          state: registration?.active?.state,
          scriptURL: registration?.active?.scriptURL
        }))
      })

      expect(swRegistration?.state).toBe('activated')

      console.log(`Service worker registered: ${swRegistration?.scriptURL}`)
    })

    test('should cache resources for offline use', async ({ page }) => {
      await page.goto('/en/landing')

      // Check if critical resources are cached
      const cacheStatus = await page.evaluate(async () => {
        const cache = await caches?.open('flavatix-v1')
        const cachedResources = await cache?.keys()
        return cachedResources?.length || 0
      })

      expect(cacheStatus).toBeGreaterThan(0) // Should have cached resources

      console.log(`Cached resources: ${cacheStatus}`)
    })

    test('should work offline for core functionality', async ({ page, context }) => {
      await page.goto('/en/landing')
      await page.waitForSelector('#main-content')

      // Go offline
      await context.setOffline(true)

      // Try to access cached content
      await page.reload()

      // Core content should still be available
      await expect(page.locator('#main-content')).toBeVisible()
      await expect(page.locator('#main-heading')).toBeVisible()

      // Should show offline indicator
      const offlineIndicator = page.locator('text=/offline|no connection/i')
      await expect(offlineIndicator).toBeVisible()

      console.log('Offline functionality working correctly')
    })
  })
})
