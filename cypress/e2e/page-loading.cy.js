describe('Page Loading & Navigation Tests', () => {
  const criticalPages = [
    { path: '/', name: 'Root/Home Page', expectedTitle: 'Flavatix' },
    { path: '/en/landing', name: 'Landing Page', expectedTitle: 'Flavatix' },
    { path: '/en/create', name: 'Create Page', expectedTitle: 'Flavatix' },
    { path: '/en/login', name: 'Login Page', expectedTitle: 'Flavatix' },
    { path: '/en/register', name: 'Register Page', expectedTitle: 'Flavatix' },
    { path: '/en/dashboard', name: 'Dashboard Page', expectedTitle: 'Flavatix' },
    { path: '/en/flavor-wheels', name: 'Flavor Wheels Page', expectedTitle: 'Flavatix' },
    { path: '/en/review', name: 'Review Page', expectedTitle: 'Flavatix' },
    { path: '/en/social', name: 'Social Page', expectedTitle: 'Flavatix' },
    { path: '/en/settings', name: 'Settings Page', expectedTitle: 'Flavatix' },
    { path: '/en/quick-tasting', name: 'Quick Tasting Page', expectedTitle: 'Flavatix' }
  ]

  const nestedPages = [
    { path: '/en/create/study', name: 'Create Study Page' },
    { path: '/en/create/competition', name: 'Create Competition Page' },
    { path: '/en/quick-tasting/123', name: 'Quick Tasting Detail Page' },
    { path: '/en/tastings/123', name: 'Tasting Detail Page' },
    { path: '/en/competition/123', name: 'Competition Detail Page' },
    { path: '/en/study/123', name: 'Study Detail Page' }
  ]

  beforeEach(() => {
    cy.checkForErrors()
  })

  describe('Critical Pages Loading', () => {
    criticalPages.forEach(page => {
      it(`should load ${page.name} successfully`, () => {
        cy.task('log', `🔍 Testing ${page.name} (${page.path})`)

        // Test page load
        cy.visitPage(page.path)

        // Verify page loaded
        cy.get('body').should('be.visible')
        cy.get('html').should('have.attr', 'lang', 'en')

        // Check for critical elements
        cy.get('title').should('not.be.empty')

        // Verify no critical errors
        cy.assertNoConsoleErrors()

        // Check performance
        cy.checkPerformance()

        cy.task('log', `✅ ${page.name} loaded successfully`)
      })
    })
  })

  describe('Nested Pages Loading', () => {
    nestedPages.forEach(page => {
      it(`should load ${page.name} successfully`, () => {
        cy.task('log', `🔍 Testing ${page.name} (${page.path})`)

        cy.visitPage(page.path)
        cy.get('body').should('be.visible')
        cy.assertNoConsoleErrors()

        cy.task('log', `✅ ${page.name} loaded successfully`)
      })
    })
  })

  describe('Navigation & Routing', () => {
    it('should navigate between pages correctly', () => {
      cy.visitPage('/en/landing')

      // Test navigation to create page
      cy.get('a[href*="create"]').first().should('be.visible').click()
      cy.url().should('include', '/create')
      cy.assertNoConsoleErrors()

      // Navigate back
      cy.go('back')
      cy.url().should('include', '/landing')

      // Test navigation to register page
      cy.get('a[href*="register"]').first().should('be.visible').click()
      cy.url().should('include', '/register')
      cy.assertNoConsoleErrors()
    })

    it('should handle browser back/forward navigation', () => {
      cy.visitPage('/en/landing')
      cy.visitPage('/en/create')
      cy.visitPage('/en/login')

      // Test back navigation
      cy.go('back')
      cy.url().should('include', '/create')

      cy.go('back')
      cy.url().should('include', '/landing')

      // Test forward navigation
      cy.go('forward')
      cy.url().should('include', '/create')

      cy.go('forward')
      cy.url().should('include', '/login')
    })

    it('should handle direct URL navigation', () => {
      // Test direct navigation to various pages
      const pages = ['/en/dashboard', '/en/flavor-wheels', '/en/review']

      pages.forEach(page => {
        cy.visitPage(page)
        cy.url().should('include', page)
        cy.assertNoConsoleErrors()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visitPage('/nonexistent-page')
      cy.get('body').should('be.visible')
      // Should show error page or redirect gracefully
      cy.assertNoConsoleErrors()
    })

    it('should handle invalid routes', () => {
      cy.visitPage('/invalid/route/test')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()
    })
  })

  describe('Performance & Reliability', () => {
    it('should load pages within acceptable time limits', () => {
      cy.visitPage('/en/landing')

      // Measure page load time
      cy.window().then((win) => {
        const perfData = win.performance.timing
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart

        cy.task('log', `⏱️  Page load time: ${pageLoadTime}ms`)

        // Assert reasonable performance
        expect(pageLoadTime).to.be.lessThan(10000) // Less than 10 seconds
      })
    })

    it('should handle multiple rapid page navigations', () => {
      const pages = ['/en/landing', '/en/create', '/en/login', '/en/register']

      pages.forEach(page => {
        cy.visitPage(page)
        cy.assertNoConsoleErrors()
        cy.get('body').should('be.visible')
      })
    })

    it('should maintain state during navigation', () => {
      // Visit landing page
      cy.visitPage('/en/landing')

      // Check that critical elements are present
      cy.get('h1').should('be.visible')
      cy.get('h1').should('contain', 'Discover')

      // Navigate away and back
      cy.visitPage('/en/create')
      cy.visitPage('/en/landing')

      // Verify elements are still there
      cy.get('h1').should('be.visible')
      cy.get('h1').should('contain', 'Discover')
    })
  })
})

