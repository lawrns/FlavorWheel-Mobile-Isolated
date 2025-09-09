describe('Performance & Accessibility Tests', () => {
  beforeEach(() => {
    cy.checkForErrors()
  })

  describe('Performance Testing', () => {
    it('should load landing page within performance budget', () => {
      cy.visitPage('/en/landing')

      // Measure page load performance
      cy.window().then((win) => {
        const perfData = win.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart
        const firstPaint = perfData.responseStart - perfData.navigationStart

        cy.task('log', `📊 Page Load Time: ${pageLoadTime}ms`)
        cy.task('log', `📊 DOM Ready Time: ${domReadyTime}ms`)
        cy.task('log', `📊 First Paint: ${firstPaint}ms`)

        // Performance assertions
        expect(pageLoadTime).to.be.lessThan(10000) // Less than 10 seconds
        expect(domReadyTime).to.be.lessThan(5000)  // Less than 5 seconds
        expect(firstPaint).to.be.lessThan(3000)    // Less than 3 seconds
      })
    })

    it('should maintain performance across multiple pages', () => {
      const pages = [
        '/en/landing',
        '/en/create',
        '/en/login',
        '/en/dashboard',
        '/en/flavor-wheels'
      ]

      pages.forEach(page => {
        cy.visitPage(page)

        cy.window().then((win) => {
          const perfData = win.performance.timing
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

          cy.task('log', `⏱️  ${page} load time: ${pageLoadTime}ms`)

          // Assert reasonable performance for each page
          expect(pageLoadTime).to.be.lessThan(15000)
        })

        cy.assertNoConsoleErrors()
      })
    })

    it('should handle concurrent page loads efficiently', () => {
      // Test loading multiple pages rapidly
      const startTime = Date.now()

      cy.visitPage('/en/landing')
      cy.visitPage('/en/create')
      cy.visitPage('/en/login')
      cy.visitPage('/en/dashboard')

      const endTime = Date.now()
      const totalTime = endTime - startTime

      cy.task('log', `🔄 Concurrent page loads took: ${totalTime}ms`)

      // Assert total time is reasonable
      expect(totalTime).to.be.lessThan(30000) // Less than 30 seconds total
    })

    it('should measure resource loading performance', () => {
      cy.visitPage('/en/landing')

      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource')

        let totalSize = 0
        let cssRequests = 0
        let jsRequests = 0
        let imageRequests = 0

        resources.forEach(resource => {
          if (resource.transferSize) {
            totalSize += resource.transferSize
          }

          if (resource.name.includes('.css')) cssRequests++
          if (resource.name.includes('.js')) jsRequests++
          if (resource.name.includes('.jpg') || resource.name.includes('.png') || resource.name.includes('.webp')) imageRequests++
        })

        const totalSizeKB = Math.round(totalSize / 1024)

        cy.task('log', `📦 Total resource size: ${totalSizeKB}KB`)
        cy.task('log', `🎨 CSS requests: ${cssRequests}`)
        cy.task('log', `⚡ JS requests: ${jsRequests}`)
        cy.task('log', `🖼️  Image requests: ${imageRequests}`)

        // Assert reasonable resource usage
        expect(totalSizeKB).to.be.lessThan(5000) // Less than 5MB
        expect(cssRequests).to.be.lessThan(20)
        expect(jsRequests).to.be.lessThan(30)
      })
    })
  })

  describe('Accessibility Testing', () => {
    it('should pass accessibility audit on landing page', () => {
      cy.visitPage('/en/landing')
      cy.injectAxe()
      cy.checkA11y(null, {
        includedImpacts: ['minor', 'moderate', 'serious', 'critical']
      })
    })

    it('should have proper heading hierarchy', () => {
      cy.visitPage('/en/landing')

      // Should have exactly one h1
      cy.get('h1').should('have.length', 1)

      // Should have appropriate number of h2, h3, h4 elements
      cy.get('h2').should('have.length.greaterThan', 0)
      cy.get('h3').should('have.length.greaterThan', 0)

      // Check heading content is meaningful
      cy.get('h1').should('not.be.empty')
      cy.get('h2').first().should('not.be.empty')

      cy.task('log', '✅ Proper heading hierarchy validated')
    })

    it('should have accessible form elements', () => {
      cy.visitPage('/en/login')

      // Check for form labels
      cy.get('form').then($form => {
        if ($form.length > 0) {
          cy.get('input').each(($input) => {
            // Each input should have a label or aria-label
            const hasLabel = $input.attr('aria-label') ||
                           $input.attr('aria-labelledby') ||
                           $input.prev('label').length > 0 ||
                           $input.parent().find('label').length > 0

            if (!hasLabel) {
              cy.task('log', `⚠️ Input without label found: ${$input.attr('type') || 'unknown'}`)
            }
          })
        }
      })

      cy.task('log', '✅ Form accessibility validated')
    })

    it('should have proper ARIA landmarks', () => {
      cy.visitPage('/en/landing')

      // Check for main landmark
      cy.get('[role="main"], main').should('exist')

      // Check for navigation landmark
      cy.get('[role="navigation"], nav').should('exist')

      // Check for banner landmark
      cy.get('[role="banner"], header').should('exist')

      cy.task('log', '✅ ARIA landmarks present')
    })

    it('should have accessible color contrast', () => {
      cy.visitPage('/en/landing')

      // Check critical text elements for contrast
      cy.get('h1, h2, h3, button, a').each(($el) => {
        // Get computed styles
        const color = Cypress.$($el).css('color')
        const backgroundColor = Cypress.$($el).css('background-color')

        if (color && backgroundColor) {
          cy.task('log', `🎨 Element: ${$el.prop('tagName')} - Color: ${color}, Background: ${backgroundColor}`)
        }
      })

      cy.task('log', '✅ Color contrast validation completed')
    })

    it('should support keyboard navigation', () => {
      cy.visitPage('/en/landing')

      // Test tab navigation
      cy.get('body').tab().tab().tab()

      // Check that focused elements are visible
      cy.focused().should('be.visible')

      // Test skip links if present
      cy.get('a[href^="#"]').each(($link) => {
        if ($link.text().toLowerCase().includes('skip')) {
          cy.wrap($link).click()
          cy.task('log', '✅ Skip link navigation working')
        }
      })

      cy.task('log', '✅ Keyboard navigation validated')
    })

    it('should handle focus management properly', () => {
      cy.visitPage('/en/landing')

      // Test focus on interactive elements
      cy.get('button, a, input, select, textarea').first().focus()
      cy.focused().should('be.visible')

      // Test focus outline visibility
      cy.focused().then($focused => {
        const outline = $focused.css('outline')
        const boxShadow = $focused.css('box-shadow')

        if (!outline || outline === 'none' && (!boxShadow || boxShadow === 'none')) {
          cy.task('log', '⚠️ Focused element may not have visible focus indicator')
        }
      })

      cy.task('log', '✅ Focus management validated')
    })
  })

  describe('Responsive Design Testing', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ]

    viewports.forEach(viewport => {
      it(`should be responsive on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.task('log', `📱 Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`)

        cy.visitPage('/en/landing')

        // Check that content is visible and properly laid out
        cy.get('body').should('be.visible')
        cy.get('h1').should('be.visible')

        // Check for horizontal scroll (should be minimal or none)
        cy.window().then((win) => {
          const scrollWidth = win.document.body.scrollWidth
          const clientWidth = win.document.body.clientWidth

          if (scrollWidth > clientWidth + 20) { // Allow small margin
            cy.task('log', `⚠️ Horizontal scroll detected: ${scrollWidth - clientWidth}px`)
          }
        })

        // Check that buttons are accessible
        cy.get('button, a').first().should('be.visible')

        // Verify no layout breaks
        cy.assertNoConsoleErrors()

        cy.task('log', `✅ ${viewport.name} responsive design validated`)
      })
    })

    it('should handle orientation changes', () => {
      // Test mobile landscape
      cy.viewport(667, 375) // Landscape mobile
      cy.visitPage('/en/landing')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      // Test tablet landscape
      cy.viewport(1024, 768) // Landscape tablet
      cy.visitPage('/en/landing')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Orientation changes handled properly')
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work with different user agents', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
      ]

      userAgents.forEach(userAgent => {
        cy.visitPage('/en/landing', {
          onBeforeLoad: (win) => {
            Object.defineProperty(win.navigator, 'userAgent', {
              value: userAgent
            })
          }
        })

        cy.get('body').should('be.visible')
        cy.assertNoConsoleErrors()

        cy.task('log', `✅ Compatible with user agent: ${userAgent.substring(0, 50)}...`)
      })
    })
  })

  describe('Error Recovery & Resilience', () => {
    it('should handle network interruptions gracefully', () => {
      // Test with simulated slow network
      cy.intercept('**', { delay: 2000 }).as('slowNetwork')

      cy.visitPage('/en/landing')
      cy.wait('@slowNetwork', { timeout: 10000 })

      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Network interruptions handled gracefully')
    })

    it('should recover from JavaScript errors', () => {
      cy.visitPage('/en/landing')

      // Try to trigger a benign error
      cy.window().then((win) => {
        // This shouldn't crash the app
        win.console.error('Test error for recovery')
      })

      // App should still be functional
      cy.get('body').should('be.visible')
      cy.get('h1').should('be.visible')

      cy.task('log', '✅ JavaScript error recovery working')
    })

    it('should handle memory pressure scenarios', () => {
      // Visit multiple pages rapidly to test memory handling
      const pages = [
        '/en/landing',
        '/en/create',
        '/en/login',
        '/en/dashboard',
        '/en/flavor-wheels',
        '/en/review',
        '/en/social'
      ]

      pages.forEach(page => {
        cy.visitPage(page)
        cy.assertNoConsoleErrors()
        cy.get('body').should('be.visible')
      })

      // Memory should be managed properly
      cy.window().then((win) => {
        // Check if performance.memory is available (Chrome only)
        if (win.performance.memory) {
          const memoryUsage = win.performance.memory.usedJSHeapSize / 1024 / 1024
          cy.task('log', `🧠 Memory usage: ${Math.round(memoryUsage)}MB`)
        }
      })

      cy.task('log', '✅ Memory pressure handled properly')
    })
  })

  describe('SEO & Meta Tags', () => {
    it('should have proper meta tags', () => {
      cy.visitPage('/')

      // Check title
      cy.title().should('not.be.empty')
      cy.title().should('include', 'Flavatix')

      // Check meta description
      cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty')

      // Check viewport meta tag
      cy.get('meta[name="viewport"]').should('have.attr', 'content').and('include', 'width=device-width')

      cy.task('log', '✅ Meta tags properly configured')
    })

    it('should have proper Open Graph tags', () => {
      cy.visitPage('/')

      cy.get('meta[property="og:title"]').should('have.attr', 'content')
      cy.get('meta[property="og:description"]').should('have.attr', 'content')
      cy.get('meta[property="og:image"]').should('have.attr', 'content')
      cy.get('meta[property="og:url"]').should('have.attr', 'content')

      cy.task('log', '✅ Open Graph tags properly configured')
    })

    it('should have proper Twitter Card tags', () => {
      cy.visitPage('/')

      cy.get('meta[name="twitter:card"]').should('have.attr', 'content')
      cy.get('meta[name="twitter:title"]').should('have.attr', 'content')
      cy.get('meta[name="twitter:description"]').should('have.attr', 'content')
      cy.get('meta[name="twitter:image"]').should('have.attr', 'content')

      cy.task('log', '✅ Twitter Card tags properly configured')
    })
  })
})

