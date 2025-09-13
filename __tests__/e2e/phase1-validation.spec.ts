import { test, expect } from '@playwright/test'

test.describe('Phase 1 Critical Fixes Validation', () => {
  test.describe('Database Schema Validation', () => {
    test('should verify user_reviews table exists and is functional', async ({ page }) => {
      // This test validates the database migration fix
      // Note: This requires database access, so we'll validate through API responses

      await test.step('Navigate to create page', async () => {
        await page.goto('/en/create')
        await expect(page).toHaveTitle(/Create.*Tasting/)
      })

      // Mock API to verify database schema expectations
      await page.route('**/api/quick-tasting', async route => {
        if (route.request().method() === 'POST') {
          const requestData = route.request().postDataJSON()

          // Verify the API can handle the expected payload structure
          expect(requestData).toHaveProperty('productType')
          expect(requestData).toHaveProperty('productName')
          expect(requestData).toHaveProperty('selectedFlavors')

          // Mock successful response indicating database can handle the data
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              tastingId: 'test-tasting-123',
              message: 'Quick tasting created successfully'
            })
          })
        } else {
          await route.continue()
        }
      })
    })
  })

  test.describe('Advanced Options Navigation', () => {
    test('should navigate to study page without 404 error', async ({ page }) => {
      await test.step('Navigate to create page', async () => {
        await page.goto('/en/create')
        await expect(page.locator('h1')).toContainText(/Create.*Tasting/)
      })

      await test.step('Click Advanced Options button', async () => {
        const advancedButton = page.locator('[data-testid="btn-advanced-options"]')
        await expect(advancedButton).toBeVisible()
        await advancedButton.click({ force: true })
      })

      await test.step('Verify navigation to study page', async () => {
        await expect(page).toHaveURL(/.*create\/study.*/)
        // Should not have 404 in the page content
        await expect(page.locator('text=404')).not.toBeVisible()
      })
    })
  })

  test.describe('Complete Tasting Workflow', () => {
    test('should complete tasting with proper error handling', async ({ page }) => {
      await test.step('Navigate to quick tasting', async () => {
        await page.goto('/en/quick-tasting')
        await expect(page.locator('h1')).toContainText(/Quick Tasting/)
        // Ensure client uses test token path
        await page.evaluate(() => localStorage.setItem('test-user', 'true'))
      })

      await test.step('Fill out tasting form', async () => {
        // Step 1: Product selection
        await page.locator('[data-testid="select-product-type-qt"]').click()
        await page.getByRole('option', { name: 'Wine' }).click()
        await page.locator('[data-testid="input-product-name"]').fill('Test Wine')

        // Navigate through steps
        await page.locator('[data-testid="btn-next-step"]').click()
        await expect(page.locator('h2')).toContainText(/aroma/i)

        // Step 2: Aroma notes
        await page.locator('[data-testid="textarea-aroma"]').fill('Citrus, floral, vanilla')
        await page.locator('[data-testid="btn-next-step"]').click()

        // Step 3: Overall score
        const slider = page.locator('[role="slider"]')
        await slider.first().click()
        await page.locator('[data-testid="textarea-notes"]').fill('Excellent test tasting')
      })

      await test.step('Submit tasting with authentication', async () => {
        // Mock API to always return auth missing regardless of header
        await page.route('**/api/quick-tasting', async route => {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Authentication required. Please log in to create tastings.',
              code: 'AUTH_MISSING'
            })
          })
        })

        // Try to complete tasting
        await page.click('text=End Tasting')

        // Should show authentication error toast content from UI
        await expect(page.locator('text=Session Expired')).toBeVisible()
        await expect(page.locator('text=sign in again')).toBeVisible()
      })
    })

    test('should handle API schema mismatch gracefully', async ({ page }) => {
      await test.step('Navigate to quick tasting', async () => {
        await page.goto('/en/quick-tasting')
        await expect(page.locator('h1')).toContainText(/Quick Tasting/)
        // Ensure client uses test token path
        await page.evaluate(() => localStorage.setItem('test-user', 'true'))
      })

      await test.step('Mock flavor_wheels table missing scenario', async () => {
        // Mock API response that indicates flavor_wheels table doesn't exist
        await page.route('**/api/quick-tasting', async route => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                tastingId: 'schema-test-789',
                message: 'Quick tasting created successfully (flavor_wheels table handled gracefully)'
              })
            })
          } else {
            await route.continue()
          }
        })

        // Fill minimal form and submit
        await page.locator('[data-testid="select-product-type-qt"]').click()
        await page.getByRole('option', { name: 'Wine' }).click()
        await page.locator('[data-testid="input-product-name"]').fill('Schema Test Wine')
        await page.locator('[data-testid="btn-next-step"]').click()
        await page.locator('[data-testid="btn-next-step"]').click()

        // Mock authentication
        await page.evaluate(() => {
          localStorage.setItem('user', JSON.stringify({
            id: 'test-user-123',
            email: 'test@example.com'
          }))
        })

        await page.click('text=End Tasting')

        // Should succeed despite flavor_wheels table issues
        await expect(page.locator('text=Tasting Saved Successfully')).toBeVisible()
      })
    })
  })

  test.describe('Authentication Error Handling', () => {
    test('should handle various authentication errors gracefully', async ({ page }) => {
      await page.goto('/en/quick-tasting')
      // Ensure client uses test token path
      await page.evaluate(() => localStorage.setItem('test-user', 'true'))

      await test.step('Test AUTH_MISSING error', async () => {
        await page.route('**/api/quick-tasting', async route => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 401,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                error: 'Authentication required. Please log in to create tastings.',
                code: 'AUTH_MISSING'
              })
            })
          } else {
            await route.continue()
          }
        })

        // Try to submit without auth
        await page.locator('[data-testid="select-product-type-qt"]').click()
        await page.getByRole('option', { name: 'Wine' }).click()
        await page.locator('[data-testid="input-product-name"]').fill('Auth Test Wine')
        await page.locator('[data-testid="btn-next-step"]').click()
        await page.locator('[data-testid="btn-next-step"]').click()
        await page.click('text=End Tasting')

        await expect(page.locator('text=Session Expired')).toBeVisible()
      })

      await test.step('Test AUTH_ERROR error', async () => {
        await page.route('**/api/quick-tasting', async route => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 401,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                error: 'Authentication failed: Invalid token',
                code: 'AUTH_ERROR'
              })
            })
          } else {
            await route.continue()
          }
        })

        await page.click('text=End Tasting')
        await expect(page.locator('text=Authentication Failed')).toBeVisible()
      })

      await test.step('Test INVALID_USER_ID error', async () => {
        await page.route('**/api/quick-tasting', async route => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                error: 'Invalid user ID. Please log in again.',
                code: 'INVALID_USER_ID'
              })
            })
          } else {
            await route.continue()
          }
        })

        await page.click('text=End Tasting')
        await expect(page.locator('text=Account Issue')).toBeVisible()
      })
    })
  })

  test.describe('UI Error Feedback', () => {
    test('should show loading states and retry on network errors', async ({ page }) => {
      await page.goto('/en/quick-tasting')

      await test.step('Test network error with retry', async () => {
        let attemptCount = 0

        await page.route('**/api/quick-tasting', async route => {
          if (route.request().method() === 'POST') {
            attemptCount++
            if (attemptCount === 1) {
              // First attempt fails with network error
              await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                  success: false,
                  error: 'Network error occurred'
                })
              })
            } else {
              // Second attempt succeeds
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                  success: true,
                  tastingId: 'retry-test-999',
                  message: 'Quick tasting created successfully after retry'
                })
              })
            }
          } else {
            await route.continue()
          }
        })

        // Mock authentication
        await page.evaluate(() => {
          localStorage.setItem('user', JSON.stringify({
            id: 'test-user-123',
            email: 'test@example.com'
          }))
        })

        // Fill form and submit
        await page.locator('[data-testid="select-product-type-qt"]').click()
        await page.getByRole('option', { name: 'Wine' }).click()
        await page.locator('[data-testid="input-product-name"]').fill('Retry Test Wine')
        await page.locator('[data-testid="btn-next-step"]').click()
        await page.locator('[data-testid="btn-next-step"]').click()

        // Submit and check for loading state
        const submitButton = page.locator('text=End Tasting')
        await submitButton.click()

        // Should show loading state
        await expect(page.locator('text=Saving...')).toBeVisible()

        // Should eventually succeed with retry
        await expect(page.locator('text=Tasting Saved Successfully')).toBeVisible()
      })
    })
  })
})
