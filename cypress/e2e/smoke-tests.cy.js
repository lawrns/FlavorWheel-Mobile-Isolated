describe('FlavorWheel Smoke Tests', () => {
  beforeEach(() => {
    cy.checkForErrors()
  })

  it('should load the application without critical errors', () => {
    cy.visitPage('/')
    cy.assertNoConsoleErrors()
    cy.checkPerformance()
  })

  it('should load landing page successfully', () => {
    cy.visitPage('/en/landing')
    cy.get('h1').should('be.visible')
    cy.get('h1').should('contain', 'Discover the World')
    cy.assertNoConsoleErrors()
  })

  it('should navigate between pages without errors', () => {
    cy.visitPage('/en/landing')

    // Test primary CTA button
    cy.get('a[href*="create"]').first().should('be.visible').click()
    cy.url().should('include', '/create')
    cy.assertNoConsoleErrors()

    // Go back and test another button
    cy.go('back')
    cy.url().should('include', '/landing')
  })

  it('should handle responsive design', () => {
    cy.testResponsive(['mobile', 'tablet', 'desktop'])
    cy.visitPage('/en/landing')
    cy.get('h1').should('be.visible')
  })

  it('should test accessibility compliance', () => {
    cy.visitPage('/en/landing')
    cy.checkAccessibility()
  })
})

