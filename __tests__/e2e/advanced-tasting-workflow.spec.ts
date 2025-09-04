import { test, expect } from '@playwright/test'

test.describe('Advanced Tasting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Mock authenticated user
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          experienceLevel: 'intermediate'
        }
      }))
    })
  })

  test.describe('Advanced Tasting Creation', () => {
    test('should create multi-step professional tasting', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-type-select"], select[name="type"]')

      // Select advanced tasting type
      await page.selectOption('[data-testid="tasting-type-select"]', 'professional')

      // Fill basic information
      await page.fill('[data-testid="tasting-name-input"]', 'Professional Whiskey Tasting')
      await page.fill('[data-testid="tasting-description-input"]', 'Comprehensive analysis of premium whiskeys')

      // Add custom categories
      await page.click('[data-testid="add-category-button"]')

      const categories = [
        'Nose Analysis',
        'Palate Structure',
        'Finish Characteristics',
        'Overall Balance',
        'Value Assessment'
      ]

      for (let i = 0; i < categories.length; i++) {
        await page.fill(`[data-testid="category-${i}-name"]`, categories[i])
        await page.selectOption(`[data-testid="category-${i}-type"]`, 'rating_scale')
      }

      // Add multiple beverages
      const beverages = [
        { name: 'Macallan 18', type: 'whiskey', price: '$150' },
        { name: 'Lagavulin 16', type: 'whiskey', price: '$90' },
        { name: 'Laphroaig Quarter Cask', type: 'whiskey', price: '$70' }
      ]

      for (let i = 0; i < beverages.length; i++) {
        await page.click('[data-testid="add-beverage-button"]')
        await page.fill(`[data-testid="beverage-${i}-name"]`, beverages[i].name)
        await page.selectOption(`[data-testid="beverage-${i}-type"]`, beverages[i].type)
        await page.fill(`[data-testid="beverage-${i}-price"]`, beverages[i].price)
      }

      // Set tasting preferences
      await page.check('[data-testid="blind-tasting"]')
      await page.selectOption('[data-testid="glassware-select"]', 'tuliped')
      await page.fill('[data-testid="temperature-input"]', '20')
      await page.selectOption('[data-testid="lighting-select"]', 'controlled')

      // Add participants
      await page.click('[data-testid="add-participant-button"]')
      await page.fill('[data-testid="participant-email"]', 'taster1@example.com')
      await page.fill('[data-testid="participant-email"]', 'taster2@example.com')

      // Create tasting
      await page.click('[data-testid="create-tasting-submit"]')

      // Verify creation
      await expect(page.locator('[data-testid="tasting-created-message"]')).toBeVisible()
      await expect(page.locator('text=Professional Whiskey Tasting')).toBeVisible()
    })

    test('should handle comparative tasting setup', async ({ page }) => {
      await page.click('[data-testid="create-advanced-tasting"]')
      await page.selectOption('[data-testid="tasting-type-select"]', 'comparative')

      // Set comparison criteria
      await page.fill('[data-testid="comparison-theme"]', 'Bourbon vs Scotch')
      await page.selectOption('[data-testid="comparison-method"]', 'sequential')

      // Add comparison parameters
      const parameters = ['Sweetness', 'Smokiness', 'Oak Influence', 'Fruitiness', 'Length']

      for (const param of parameters) {
        await page.click('[data-testid="add-parameter-button"]')
        await page.fill('[data-testid="parameter-name"]', param)
        await page.selectOption('[data-testid="parameter-scale"]', '1-10')
      }

      // Add beverages for comparison
      await page.click('[data-testid="add-comparison-item"]')
      await page.fill('[data-testid="item-0-name"]', 'Jim Beam White Label')
      await page.fill('[data-testid="item-0-price"]', '$25')

      await page.click('[data-testid="add-comparison-item"]')
      await page.fill('[data-testid="item-1-name"]', 'Glenfiddich 12')
      await page.fill('[data-testid="item-1-price"]', '$60')

      await page.click('[data-testid="create-comparison-button"]')

      // Should show comparison interface
      await expect(page.locator('[data-testid="comparison-interface"]')).toBeVisible()
      await expect(page.locator('text=Bourbon vs Scotch')).toBeVisible()
    })

    test('should validate tasting creation data', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')

      // Try to submit empty form
      await page.click('[data-testid="create-tasting-submit"]')

      // Should show validation errors
      await expect(page.locator('[data-testid="name-required"]')).toBeVisible()
      await expect(page.locator('[data-testid="type-required"]')).toBeVisible()

      // Fill invalid data
      await page.fill('[data-testid="tasting-name-input"]', 'A'.repeat(200)) // Too long
      await page.click('[data-testid="create-tasting-submit"]')

      await expect(page.locator('text=/too long|maximum/i')).toBeVisible()

      // Test duplicate tasting names
      await page.fill('[data-testid="tasting-name-input"]', 'Existing Tasting')
      await page.selectOption('[data-testid="tasting-type-select"]', 'guided')
      await page.click('[data-testid="create-tasting-submit"]')

      await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible()
    })
  })

  test.describe('Guided Tasting Experience', () => {
    test('should complete full guided tasting workflow', async ({ page }) => {
      // Navigate to existing tasting
      await page.goto('/en/tastings/test-tasting-id')
      await page.click('[data-testid="start-tasting-button"]')

      // Step 1: Preparation
      await expect(page.locator('[data-testid="preparation-step"]')).toBeVisible()
      await page.check('[data-testid="nose-clear"]')
      await page.check('[data-testid="glass-clean"]')
      await page.fill('[data-testid="environment-notes"]', 'Quiet room, good lighting')
      await page.click('[data-testid="next-step"]')

      // Step 2: Visual Assessment
      await expect(page.locator('[data-testid="visual-step"]')).toBeVisible()
      await page.selectOption('[data-testid="color-select"]', 'amber')
      await page.selectOption('[data-testid="clarity-select"]', 'clear')
      await page.fill('[data-testid="visual-notes"]', 'Rich amber color with good clarity')
      await page.click('[data-testid="next-step"]')

      // Step 3: Aroma Analysis
      await expect(page.locator('[data-testid="aroma-step"]')).toBeVisible()

      // Add multiple aromas
      const aromas = ['vanilla', 'caramel', 'oak', 'fruit', 'spice']
      for (const aroma of aromas) {
        await page.click(`[data-testid="aroma-${aroma}"]`)
      }

      await page.fill('[data-testid="aroma-intensity"]', '8')
      await page.fill('[data-testid="aroma-notes"]', 'Complex aroma with vanilla and oak notes')
      await page.click('[data-testid="next-step"]')

      // Step 4: Taste Analysis
      await expect(page.locator('[data-testid="taste-step"]')).toBeVisible()
      await page.selectOption('[data-testid="sweetness-level"]', 'medium')
      await page.selectOption('[data-testid="acidity-level"]', 'low')
      await page.selectOption('[data-testid="tannin-level"]', 'medium')
      await page.fill('[data-testid="taste-notes"]', 'Balanced sweetness with good structure')
      await page.click('[data-testid="next-step"]')

      // Step 5: Finish Assessment
      await expect(page.locator('[data-testid="finish-step"]')).toBeVisible()
      await page.fill('[data-testid="finish-length"]', '45') // seconds
      await page.fill('[data-testid="finish-notes"]', 'Long, warming finish with spice')
      await page.click('[data-testid="next-step"]')

      // Step 6: Overall Rating
      await expect(page.locator('[data-testid="rating-step"]')).toBeVisible()
      await page.click('[data-testid="rating-9"]')
      await page.fill('[data-testid="overall-notes"]', 'Excellent whiskey with great balance')
      await page.click('[data-testid="complete-tasting"]')

      // Verify completion
      await expect(page.locator('[data-testid="tasting-completed"]')).toBeVisible()
      await expect(page.locator('[data-testid="flavor-wheel"]')).toBeVisible()
    })

    test('should handle tasting interruptions and resume', async ({ page }) => {
      await page.goto('/en/tastings/test-tasting-id')
      await page.click('[data-testid="start-tasting-button"]')

      // Complete first few steps
      await page.check('[data-testid="nose-clear"]')
      await page.click('[data-testid="next-step"]')

      await page.selectOption('[data-testid="color-select"]', 'amber')
      await page.click('[data-testid="next-step"]')

      // Simulate page refresh/navigation away
      await page.reload()

      // Should show resume option
      await expect(page.locator('[data-testid="resume-tasting"]')).toBeVisible()
      await page.click('[data-testid="resume-tasting"]')

      // Should continue from where left off
      await expect(page.locator('[data-testid="aroma-step"]')).toBeVisible()
    })

    test('should allow notes editing during tasting', async ({ page }) => {
      await page.goto('/en/tastings/test-tasting-id')
      await page.click('[data-testid="start-tasting-button"]')

      // Add initial notes
      await page.fill('[data-testid="aroma-notes"]', 'Initial aroma notes')

      // Go to next step
      await page.click('[data-testid="next-step"]')

      // Go back to edit
      await page.click('[data-testid="previous-step"]')

      // Edit notes
      await page.fill('[data-testid="aroma-notes"]', 'Updated aroma notes with more detail')

      // Continue
      await page.click('[data-testid="next-step"]')

      // Complete tasting
      await page.click('[data-testid="complete-tasting"]')

      // Verify updated notes are saved
      await expect(page.locator('text=Updated aroma notes with more detail')).toBeVisible()
    })
  })

  test.describe('Professional Tasting Features', () => {
    test('should support expert evaluation criteria', async ({ page }) => {
      await page.goto('/en/tastings/professional-tasting-id')
      await page.click('[data-testid="start-professional-tasting"]')

      // Expert criteria evaluation
      const criteria = [
        { name: 'Complexity', value: '9' },
        { name: 'Balance', value: '8' },
        { name: 'Length', value: '9' },
        { name: 'Typicity', value: '7' },
        { name: 'Harmony', value: '8' }
      ]

      for (let i = 0; i < criteria.length; i++) {
        await page.fill(`[data-testid="criteria-${i}-value"]`, criteria[i].value)
        await page.fill(`[data-testid="criteria-${i}-notes"]`, `Professional notes for ${criteria[i].name}`)
      }

      // Add technical analysis
      await page.fill('[data-testid="abv-analysis"]', '46% ABV')
      await page.fill('[data-testid="age-statement"]', '12 years')
      await page.fill('[data-testid="distillery-notes"]', 'Traditional distillation methods')

      await page.click('[data-testid="complete-professional-tasting"]')

      // Should generate detailed report
      await expect(page.locator('[data-testid="professional-report"]')).toBeVisible()
      await expect(page.locator('[data-testid="technical-analysis"]')).toBeVisible()
    })

    test('should handle multi-taster collaborative tasting', async ({ page, context }) => {
      // Simulate multiple users
      const user1Page = page
      const user2Page = await context.newPage()

      // Both users join the same tasting
      await user1Page.goto('/en/tastings/collaborative-tasting-id')
      await user2Page.goto('/en/tastings/collaborative-tasting-id')

      // User 1 starts tasting
      await user1Page.click('[data-testid="start-tasting-button"]')
      await user1Page.fill('[data-testid="aroma-notes"]', 'User 1 aroma notes')

      // User 2 starts tasting
      await user2Page.click('[data-testid="start-tasting-button"]')
      await user2Page.fill('[data-testid="aroma-notes"]', 'User 2 aroma notes')

      // Both complete tasting
      await user1Page.click('[data-testid="complete-tasting"]')
      await user2Page.click('[data-testid="complete-tasting"]')

      // Should show collaborative results
      await expect(user1Page.locator('[data-testid="collaborative-results"]')).toBeVisible()
      await expect(user2Page.locator('[data-testid="collaborative-results"]')).toBeVisible()

      // Should show both users' evaluations
      await expect(user1Page.locator('text=User 1 aroma notes')).toBeVisible()
      await expect(user1Page.locator('text=User 2 aroma notes')).toBeVisible()
    })

    test('should support tasting templates and reuse', async ({ page }) => {
      // Create a tasting template
      await page.click('[data-testid="create-tasting-template"]')

      await page.fill('[data-testid="template-name"]', 'Whiskey Tasting Template')
      await page.fill('[data-testid="template-description"]', 'Standard whiskey evaluation')

      // Add template criteria
      await page.click('[data-testid="add-template-criterion"]')
      await page.fill('[data-testid="criterion-name"]', 'Aroma Complexity')
      await page.selectOption('[data-testid="criterion-type"]', 'rating')

      await page.click('[data-testid="save-template"]')

      // Use template for new tasting
      await page.click('[data-testid="create-from-template"]')
      await page.click('text=Whiskey Tasting Template')

      // Should pre-populate with template criteria
      await expect(page.locator('text=Aroma Complexity')).toBeVisible()

      await page.fill('[data-testid="tasting-name-input"]', 'Template-based Tasting')
      await page.click('[data-testid="create-tasting-submit"]')

      // Should use template structure
      await expect(page.locator('[data-testid="tasting-created"]')).toBeVisible()
    })
  })

  test.describe('Data Persistence and Recovery', () => {
    test('should save tasting progress automatically', async ({ page }) => {
      await page.goto('/en/tastings/test-tasting-id')
      await page.click('[data-testid="start-tasting-button"]')

      // Add some tasting data
      await page.fill('[data-testid="aroma-notes"]', 'Auto-saved aroma notes')
      await page.fill('[data-testid="taste-notes"]', 'Auto-saved taste notes')

      // Wait for auto-save
      await page.waitForTimeout(3000)

      // Simulate browser crash/page refresh
      await page.reload()

      // Should recover auto-saved data
      await expect(page.locator('[value="Auto-saved aroma notes"]')).toBeVisible()
      await expect(page.locator('[value="Auto-saved taste notes"]')).toBeVisible()
    })

    test('should handle offline tasting and sync', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true)

      await page.goto('/en/tastings/offline-tasting-id')
      await page.click('[data-testid="start-tasting-button"]')

      // Complete tasting offline
      await page.fill('[data-testid="aroma-notes"]', 'Offline tasting notes')
      await page.click('[data-testid="rating-8"]')
      await page.click('[data-testid="complete-tasting"]')

      // Should show offline completion message
      await expect(page.locator('[data-testid="offline-completed"]')).toBeVisible()

      // Go back online
      await page.context().setOffline(false)

      // Should sync data
      await expect(page.locator('[data-testid="sync-completed"]')).toBeVisible()

      // Data should be available
      await page.reload()
      await expect(page.locator('text=Offline tasting notes')).toBeVisible()
    })

    test('should handle concurrent tasting edits', async ({ page, context }) => {
      const page2 = await context.newPage()

      // Both users edit same tasting
      await page.goto('/en/tastings/concurrent-tasting-id')
      await page2.goto('/en/tastings/concurrent-tasting-id')

      await page.click('[data-testid="start-tasting-button"]')
      await page2.click('[data-testid="start-tasting-button"]')

      // Both add different notes
      await page.fill('[data-testid="aroma-notes"]', 'User 1 notes')
      await page2.fill('[data-testid="aroma-notes"]', 'User 2 notes')

      // Both complete
      await page.click('[data-testid="complete-tasting"]')
      await page2.click('[data-testid="complete-tasting"]')

      // Should handle conflicts gracefully
      await expect(page.locator('[data-testid="tasting-completed"]')).toBeVisible()
      await expect(page2.locator('[data-testid="tasting-completed"]')).toBeVisible()
    })
  })

  test.describe('Advanced Analytics and Reporting', () => {
    test('should generate comprehensive tasting reports', async ({ page }) => {
      await page.goto('/en/tastings/completed-tasting-id/results')

      // Generate PDF report
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="generate-pdf-report"]')
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/tasting-report.*\.pdf/)

      // Generate Excel export
      const excelDownloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="export-excel"]')
      const excelDownload = await excelDownloadPromise

      expect(excelDownload.suggestedFilename()).toMatch(/.*\.xlsx/)
    })

    test('should provide tasting trend analysis', async ({ page }) => {
      await page.goto('/en/analytics/tastings')

      // Should show trend charts
      await expect(page.locator('[data-testid="taste-trends-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="flavor-preferences"]')).toBeVisible()

      // Should show tasting frequency
      await expect(page.locator('[data-testid="tasting-frequency"]')).toBeVisible()

      // Should show beverage type distribution
      await expect(page.locator('[data-testid="beverage-distribution"]')).toBeVisible()
    })

    test('should compare multiple tastings', async ({ page }) => {
      await page.goto('/en/compare')

      // Select tastings to compare
      await page.check('[data-testid="tasting-1-select"]')
      await page.check('[data-testid="tasting-2-select"]')
      await page.check('[data-testid="tasting-3-select"]')

      await page.click('[data-testid="compare-selected"]')

      // Should show comparison results
      await expect(page.locator('[data-testid="comparison-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="similarity-score"]')).toBeVisible()
      await expect(page.locator('[data-testid="difference-analysis"]')).toBeVisible()
    })
  })
})
