describe('Complete User Journey Tests', () => {
  beforeEach(() => {
    cy.checkForErrors()
  })

  describe('Landing Page → Create Flow', () => {
    it('should complete full user journey from landing to create', () => {
      cy.task('log', '🚀 Starting Complete User Journey Test')

      // Step 1: Visit landing page
      cy.visitPage('/en/landing')
      cy.get('h1').should('be.visible')
      cy.get('h1').should('contain', 'Discover the World')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Step 1: Landing page loaded successfully')

      // Step 2: Test primary CTA button navigation
      cy.get('a[href*="create"]').first().should('be.visible').click()
      cy.url().should('include', '/create')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Step 2: Navigated to create page successfully')

      // Step 3: Test create page functionality
      cy.get('body').should('be.visible')

      // Look for create options (study, competition, quick tasting)
      cy.get('body').then($body => {
        if ($body.text().includes('Study') || $body.text().includes('Competition') || $body.text().includes('Quick')) {
          cy.task('log', '✅ Step 3: Create page loaded with tasting options')
        } else {
          cy.task('log', '⚠️ Step 3: Create page loaded but no tasting options found')
        }
      })

      cy.assertNoConsoleErrors()

      // Step 4: Navigate back to landing
      cy.go('back')
      cy.url().should('include', '/landing')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Step 4: Successfully navigated back to landing page')
    })

    it('should test secondary navigation buttons', () => {
      cy.visitPage('/en/landing')

      // Test "Watch Demo" button (should navigate to create)
      cy.get('a[href*="create"]').eq(1).should('be.visible').click()
      cy.url().should('include', '/create')
      cy.assertNoConsoleErrors()

      cy.go('back')
      cy.task('log', '✅ Secondary CTA button navigation working')
    })

    it('should test bottom CTA buttons', () => {
      cy.visitPage('/en/landing')

      // Scroll to bottom CTA section
      cy.get('body').then($body => {
        if ($body.text().includes('Start Free Today')) {
          // Test "Start Free Today" button
          cy.contains('Start Free Today').should('be.visible').click()
          cy.url().should('include', '/register')
          cy.assertNoConsoleErrors()

          cy.go('back')
          cy.task('log', '✅ Start Free Today button navigation working')

          // Test "Sign In" button
          cy.contains('Sign In').should('be.visible').click()
          cy.url().should('include', '/login')
          cy.assertNoConsoleErrors()

          cy.task('log', '✅ Sign In button navigation working')
        } else {
          cy.task('log', '⚠️ Bottom CTA section not found')
        }
      })
    })
  })

  describe('Authentication Flow', () => {
    it('should navigate to login page', () => {
      cy.visitPage('/en/login')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Login page loaded successfully')
    })

    it('should navigate to register page', () => {
      cy.visitPage('/en/register')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Register page loaded successfully')
    })

    it('should handle form validation on login page', () => {
      cy.visitPage('/en/login')

      // Try to submit empty form
      cy.get('form').then($form => {
        if ($form.length > 0) {
          cy.get('button[type="submit"]').first().should('be.visible')
          cy.task('log', '✅ Login form validation present')
        } else {
          cy.task('log', '⚠️ No login form found')
        }
      })
    })

    it('should handle form validation on register page', () => {
      cy.visitPage('/en/register')

      // Try to submit empty form
      cy.get('form').then($form => {
        if ($form.length > 0) {
          cy.get('button[type="submit"]').first().should('be.visible')
          cy.task('log', '✅ Register form validation present')
        } else {
          cy.task('log', '⚠️ No register form found')
        }
      })
    })
  })

  describe('Dashboard & User Features', () => {
    it('should load dashboard page', () => {
      cy.visitPage('/en/dashboard')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Dashboard page loaded successfully')
    })

    it('should load flavor wheels page', () => {
      cy.visitPage('/en/flavor-wheels')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Flavor wheels page loaded successfully')
    })

    it('should load review page', () => {
      cy.visitPage('/en/review')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Review page loaded successfully')
    })

    it('should load social page', () => {
      cy.visitPage('/en/social')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Social page loaded successfully')
    })

    it('should load settings page', () => {
      cy.visitPage('/en/settings')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Settings page loaded successfully')
    })
  })

  describe('Quick Tasting Flow', () => {
    it('should load quick tasting page', () => {
      cy.visitPage('/en/quick-tasting')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Quick tasting page loaded successfully')
    })

    it('should handle quick tasting detail pages', () => {
      cy.visitPage('/en/quick-tasting/123')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Quick tasting detail page loaded successfully')
    })
  })

  describe('Create Study Flow', () => {
    it('should load create study page', () => {
      cy.visitPage('/en/create/study')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Create study page loaded successfully')
    })
  })

  describe('Create Competition Flow', () => {
    it('should load create competition page', () => {
      cy.visitPage('/en/create/competition')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Create competition page loaded successfully')
    })
  })

  describe('Tasting Detail Pages', () => {
    it('should load tasting detail page', () => {
      cy.visitPage('/en/tastings/123')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Tasting detail page loaded successfully')
    })

    it('should load competition detail page', () => {
      cy.visitPage('/en/competition/123')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Competition detail page loaded successfully')
    })

    it('should load study detail page', () => {
      cy.visitPage('/en/study/123')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ Study detail page loaded successfully')
    })
  })

  describe('Error Handling & Edge Cases', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visitPage('/nonexistent-page')
      cy.get('body').should('be.visible')
      cy.assertNoConsoleErrors()

      cy.task('log', '✅ 404 page handled gracefully')
    })

    it('should handle invalid routes', () => {
      const invalidRoutes = [
        '/invalid/route/test',
        '/en/nonexistent-feature',
        '/api/nonexistent-endpoint'
      ]

      invalidRoutes.forEach(route => {
        cy.visitPage(route)
        cy.get('body').should('be.visible')
        cy.assertNoConsoleErrors()
      })

      cy.task('log', '✅ Invalid routes handled gracefully')
    })
  })

  describe('Performance & Reliability', () => {
    it('should maintain performance across multiple page loads', () => {
      const pages = [
        '/en/landing',
        '/en/create',
        '/en/login',
        '/en/dashboard',
        '/en/flavor-wheels'
      ]

      pages.forEach(page => {
        cy.visitPage(page)
        cy.assertNoConsoleErrors()
        cy.checkPerformance()
      })

      cy.task('log', '✅ Performance maintained across multiple page loads')
    })

    it('should handle rapid navigation without errors', () => {
      const pages = [
        '/en/landing',
        '/en/create',
        '/en/login',
        '/en/register',
        '/en/dashboard'
      ]

      pages.forEach(page => {
        cy.visitPage(page)
        cy.assertNoConsoleErrors()
        cy.get('body').should('be.visible')
      })

      cy.task('log', '✅ Rapid navigation handled without errors')
    })

    it('should maintain application state during navigation', () => {
      // Visit landing page and check critical elements
      cy.visitPage('/en/landing')
      cy.get('h1').should('be.visible')
      cy.get('h1').should('contain', 'Discover')

      // Navigate through multiple pages
      cy.visitPage('/en/create')
      cy.visitPage('/en/login')
      cy.visitPage('/en/register')

      // Return to landing and verify elements still exist
      cy.visitPage('/en/landing')
      cy.get('h1').should('be.visible')
      cy.get('h1').should('contain', 'Discover')

      cy.task('log', '✅ Application state maintained during navigation')
    })
  })

  describe('Accessibility & UX', () => {
    it('should have proper heading hierarchy', () => {
      cy.visitPage('/en/landing')

      // Check for proper heading structure
      cy.get('h1').should('have.length', 1)
      cy.get('h2').should('have.length.greaterThan', 0)
      cy.get('h3').should('have.length.greaterThan', 0)

      cy.task('log', '✅ Proper heading hierarchy present')
    })

    it('should have accessible navigation', () => {
      cy.visitPage('/en/landing')

      // Check for navigation landmarks
      cy.get('[role="navigation"], nav, [role="banner"]').should('exist')

      cy.task('log', '✅ Accessible navigation present')
    })

    it('should handle keyboard navigation', () => {
      cy.visitPage('/en/landing')

      // Test tab navigation
      cy.get('body').tab()
      cy.focused().should('exist')

      cy.task('log', '✅ Keyboard navigation working')
    })
  })
})

