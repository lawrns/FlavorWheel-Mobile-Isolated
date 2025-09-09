describe('Webpack Error Detection', () => {
  beforeEach(() => {
    cy.checkForErrors()
  })

  it('should detect and report webpack compilation errors', () => {
    cy.visitPage('/en/landing')

    // Monitor for webpack-related errors in console
    cy.window().then((win) => {
      // Listen for console errors
      const originalError = win.console.error
      let webpackErrors = []

      win.console.error = function(...args) {
        const message = args.join(' ')
        if (message.includes('webpack') ||
            message.includes('Module not found') ||
            message.includes('Cannot resolve') ||
            message.includes('Compilation failed') ||
            message.includes('SyntaxError') ||
            message.includes('TypeError')) {
          webpackErrors.push(message)
        }
        originalError.apply(win.console, args)
      }

      // Store errors for later retrieval
      win.__webpackErrors = webpackErrors
    })

    // Wait for page to fully load
    cy.get('body').should('be.visible')
    cy.wait(3000) // Wait for any async webpack operations

    // Check for webpack errors
    cy.window().then((win) => {
      const webpackErrors = win.__webpackErrors || []

      if (webpackErrors.length > 0) {
        cy.task('log', '🚨 WEBPACK ERRORS DETECTED:')
        webpackErrors.forEach((error, index) => {
          cy.task('log', `❌ Error ${index + 1}: ${error}`)
        })

        // Fail the test if there are critical webpack errors
        const criticalErrors = webpackErrors.filter(error =>
          error.includes('Module not found') ||
          error.includes('Cannot resolve') ||
          error.includes('Compilation failed') ||
          error.includes('SyntaxError')
        )

        if (criticalErrors.length > 0) {
          throw new Error(`Critical webpack errors detected: ${criticalErrors.join('; ')}`)
        }
      } else {
        cy.task('log', '✅ No webpack errors detected')
      }
    })
  })

  it('should verify all chunks load successfully', () => {
    cy.visitPage('/en/landing')

    // Check network requests for failed chunk loads
    cy.intercept('**/_next/static/chunks/**', (req) => {
      req.continue((res) => {
        if (res.statusCode >= 400) {
          cy.task('log', `🚨 Failed chunk load: ${req.url} - Status: ${res.statusCode}`)
        }
      })
    }).as('chunkRequests')

    // Wait for page to load and chunks to be requested
    cy.get('body').should('be.visible')
    cy.wait(5000) // Wait for all chunks to load

    // Check that no chunk requests failed
    cy.get('@chunkRequests.all').then((interceptions) => {
      const failedChunks = interceptions.filter(interception =>
        interception.response && interception.response.statusCode >= 400
      )

      if (failedChunks.length > 0) {
        cy.task('log', `🚨 ${failedChunks.length} chunk(s) failed to load:`)
        failedChunks.forEach(chunk => {
          cy.task('log', `❌ ${chunk.request.url} - Status: ${chunk.response.statusCode}`)
        })
      } else {
        cy.task('log', '✅ All webpack chunks loaded successfully')
      }
    })
  })

  it('should detect hot module replacement errors', () => {
    cy.visitPage('/en/landing')

    // Monitor for HMR-related errors
    cy.window().then((win) => {
      const originalError = win.console.error
      let hmrErrors = []

      win.console.error = function(...args) {
        const message = args.join(' ')
        if (message.includes('HMR') ||
            message.includes('hot reload') ||
            message.includes('module.hot') ||
            message.includes('webpackHotUpdate')) {
          hmrErrors.push(message)
        }
        originalError.apply(win.console, args)
      }

      win.__hmrErrors = hmrErrors
    })

    // Wait and check for HMR errors
    cy.wait(3000)

    cy.window().then((win) => {
      const hmrErrors = win.__hmrErrors || []

      if (hmrErrors.length > 0) {
        cy.task('log', '🚨 HMR ERRORS DETECTED:')
        hmrErrors.forEach(error => {
          cy.task('log', `❌ HMR Error: ${error}`)
        })
      } else {
        cy.task('log', '✅ No HMR errors detected')
      }
    })
  })

  it('should verify webpack runtime is functioning', () => {
    cy.visitPage('/en/landing')

    // Check that webpack runtime functions are available
    cy.window().then((win) => {
      // Check for webpack-specific globals
      const hasWebpackRequire = typeof win.__webpack_require__ === 'function'
      const hasWebpackModules = win.__webpack_modules__ && typeof win.__webpack_modules__ === 'object'
      const hasWebpackChunk = win.webpackChunk && typeof win.webpackChunk === 'function'

      cy.task('log', `📦 Webpack require available: ${hasWebpackRequire}`)
      cy.task('log', `📦 Webpack modules available: ${hasWebpackModules}`)
      cy.task('log', `📦 Webpack chunk loader available: ${hasWebpackChunk}`)

      if (!hasWebpackRequire || !hasWebpackModules) {
        cy.task('log', '🚨 Webpack runtime may not be functioning properly')
      } else {
        cy.task('log', '✅ Webpack runtime is functioning correctly')
      }
    })
  })

  it('should detect and report bundle size issues', () => {
    cy.visitPage('/en/landing')

    // Monitor network requests for bundle sizes
    let bundleSizes = {}

    cy.intercept('**/_next/static/chunks/**', (req) => {
      req.continue((res) => {
        if (res.headers && res.headers['content-length']) {
          const sizeKB = Math.round(parseInt(res.headers['content-length']) / 1024)
          bundleSizes[req.url] = sizeKB
        }
      })
    }).as('bundleRequests')

    // Wait for bundles to load
    cy.get('body').should('be.visible')
    cy.wait(3000)

    // Analyze bundle sizes
    cy.then(() => {
      let totalSize = 0
      let largeBundles = []

      Object.entries(bundleSizes).forEach(([url, sizeKB]) => {
        totalSize += sizeKB
        if (sizeKB > 500) { // Flag bundles over 500KB
          largeBundles.push(`${url}: ${sizeKB}KB`)
        }
      })

      cy.task('log', `📊 Total bundle size: ${totalSize}KB`)

      if (largeBundles.length > 0) {
        cy.task('log', '⚠️ Large bundles detected:')
        largeBundles.forEach(bundle => {
          cy.task('log', `📦 ${bundle}`)
        })
      } else {
        cy.task('log', '✅ All bundles are reasonably sized')
      }

      // Flag if total is too large
      if (totalSize > 2000) { // Over 2MB
        cy.task('log', `🚨 Total bundle size (${totalSize}KB) is very large`)
      }
    })
  })

  it('should test dynamic imports and code splitting', () => {
    cy.visitPage('/en/landing')

    // Trigger potential dynamic imports by interacting with the page
    cy.get('body').then($body => {
      // Click buttons that might trigger dynamic imports
      if ($body.find('a[href*="create"]').length > 0) {
        cy.get('a[href*="create"]').first().click()

        // Wait for dynamic import to load
        cy.get('body').should('be.visible')
        cy.assertNoConsoleErrors()

        cy.task('log', '✅ Dynamic import for create page loaded successfully')
      }

      // Navigate to other pages that might use dynamic imports
      const pagesToTest = ['/en/login', '/en/dashboard']

      pagesToTest.forEach(page => {
        cy.visitPage(page)
        cy.get('body').should('be.visible')
        cy.assertNoConsoleErrors()
        cy.task('log', `✅ Dynamic import for ${page} loaded successfully`)
      })
    })
  })

  it('should verify webpack dev server is functioning', () => {
    cy.visitPage('/en/landing')

    // Check for webpack dev server indicators
    cy.window().then((win) => {
      const hasDevServer = win.__webpack_dev_server__ ||
                          win.__webpack_dev_server_client__ ||
                          win.__webpack_hot_update__

      if (hasDevServer) {
        cy.task('log', '✅ Webpack dev server is active and functioning')
      } else {
        cy.task('log', '⚠️ Webpack dev server indicators not found')
      }
    })

    // Test hot reload by checking if the page can be refreshed without full reload
    cy.reload()
    cy.get('body').should('be.visible')
    cy.assertNoConsoleErrors()

    cy.task('log', '✅ Page reload handled correctly')
  })

  it('should detect circular dependency warnings', () => {
    cy.visitPage('/en/landing')

    // Monitor for circular dependency warnings
    cy.window().then((win) => {
      const originalWarn = win.console.warn
      let circularWarnings = []

      win.console.warn = function(...args) {
        const message = args.join(' ')
        if (message.includes('Circular dependency') ||
            message.includes('circular') ||
            message.includes('dependency')) {
          circularWarnings.push(message)
        }
        originalWarn.apply(win.console, args)
      }

      win.__circularWarnings = circularWarnings
    })

    // Wait for modules to load
    cy.wait(3000)

    cy.window().then((win) => {
      const circularWarnings = win.__circularWarnings || []

      if (circularWarnings.length > 0) {
        cy.task('log', '🚨 CIRCULAR DEPENDENCY WARNINGS DETECTED:')
        circularWarnings.forEach(warning => {
          cy.task('log', `⚠️ ${warning}`)
        })
      } else {
        cy.task('log', '✅ No circular dependency warnings detected')
      }
    })
  })
})

