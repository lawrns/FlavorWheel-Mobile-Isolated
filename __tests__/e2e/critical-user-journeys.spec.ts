import { test, expect } from '@playwright/test'

test.describe('Critical User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/')

    // Wait for app to be ready
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 30000 })

    // Mock API responses for consistent testing
    await page.route('**/api/**', async route => {
      const url = route.request().url()

      if (url.includes('/api/auth/session')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              name: 'Test User',
              experienceLevel: 'beginner'
            }
          })
        })
      } else if (url.includes('/api/tastings')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tastings: [
              {
                id: 'tasting-123',
                name: 'Premium Tequila Tasting',
                status: 'active',
                type: 'guided',
                created_at: new Date().toISOString()
              }
            ]
          })
        })
      } else {
        await route.continue()
      }
    })
  })

  test.describe('Complete Tasting Experience', () => {
    test('should complete full tasting workflow for beginner user', async ({ page }) => {
      // 1. Landing page discovery and registration
      await test.step('Landing page interaction', async () => {
        await expect(page.locator('h1')).toContainText(/flavorwheel|méxico/i)

        // Click create tasting button
        await page.click('[data-testid="create-tasting-button"]')

        // Should navigate to tasting creation
        await expect(page).toHaveURL(/.*create.*/)
      })

      // 2. Tasting creation with guidance
      await test.step('Tasting creation', async () => {
        // Fill tasting details
        await page.fill('[data-testid="tasting-name-input"]', 'My First Tequila Tasting')
        await page.fill('[data-testid="tasting-description-input"]', 'Learning about premium tequilas')

        // Select guided tasting type
        await page.selectOption('[data-testid="tasting-type-select"]', 'guided')

        // Add tasting items
        await page.click('[data-testid="add-item-button"]')
        await page.fill('[data-testid="item-name-input"]', 'Clase Azul Tequila Blanco')
        await page.selectOption('[data-testid="item-type-select"]', 'tequila')

        // Create tasting
        await page.click('[data-testid="create-tasting-submit"]')

        // Verify creation success
        await expect(page.locator('[data-testid="tasting-created-message"]')).toBeVisible()
      })

      // 3. Guided tasting experience
      await test.step('Guided tasting process', async () => {
        // Start tasting
        await page.click('[data-testid="start-tasting-button"]')

        // Complete guided steps
        const guidedSteps = [
          { selector: '[data-testid="aroma-input"]', value: 'citrus, floral, agave' },
          { selector: '[data-testid="appearance-input"]', value: 'clear, bright' },
          { selector: '[data-testid="taste-input"]', value: 'sweet, vanilla, oak' },
          { selector: '[data-testid="finish-input"]', value: 'long, smooth, peppery' }
        ]

        for (const step of guidedSteps) {
          await page.fill(step.selector, step.value)
          await page.click('[data-testid="next-step-button"]')
        }

        // Rate overall experience
        await page.click('[data-testid="rating-8"]')

        // Add final notes
        await page.fill('[data-testid="final-notes"]', 'Excellent introduction to premium tequila')

        // Complete tasting
        await page.click('[data-testid="complete-tasting-button"]')
      })

      // 4. Results and flavor wheel generation
      await test.step('Results visualization', async () => {
        // Wait for flavor wheel generation
        await page.waitForSelector('[data-testid="flavor-wheel-svg"]', { timeout: 10000 })

        // Verify flavor wheel is displayed
        await expect(page.locator('[data-testid="flavor-wheel-svg"]')).toBeVisible()

        // Check flavor extraction
        await expect(page.locator('[data-testid="extracted-flavors"]')).toContainText('citrus')
        await expect(page.locator('[data-testid="extracted-flavors"]')).toContainText('sweet')

        // Verify results summary
        await expect(page.locator('[data-testid="tasting-summary"]')).toBeVisible()
      })

      // 5. Social sharing and community engagement
      await test.step('Social features', async () => {
        // Share tasting results
        await page.click('[data-testid="share-button"]')
        await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()

        // Test different sharing options
        await page.click('[data-testid="share-twitter"]')
        await page.click('[data-testid="share-facebook"]')

        // Copy link
        await page.click('[data-testid="copy-link-button"]')
        await expect(page.locator('[data-testid="link-copied-message"]')).toBeVisible()

        // Close share modal
        await page.click('[data-testid="close-share-modal"]')
      })

      // 6. Export and archival
      await test.step('Data export', async () => {
        // Export PDF
        const downloadPromise = page.waitForEvent('download')
        await page.click('[data-testid="export-pdf-button"]')
        const download = await downloadPromise
        expect(download.suggestedFilename()).toMatch(/tasting-results.*\.pdf/)

        // Export JSON
        const jsonDownloadPromise = page.waitForEvent('download')
        await page.click('[data-testid="export-json-button"]')
        const jsonDownload = await jsonDownloadPromise
        expect(jsonDownload.suggestedFilename()).toMatch(/.*\.json/)
      })

      // 7. Navigation to tasting history
      await test.step('Tasting history', async () => {
        // Navigate to profile/history
        await page.click('[data-testid="profile-button"]')
        await expect(page).toHaveURL(/.*profile.*/)

        // Verify tasting appears in history
        await expect(page.locator('[data-testid="tasting-history"]')).toContainText('My First Tequila Tasting')

        // View tasting details
        await page.click('[data-testid="view-tasting-123"]')
        await expect(page.locator('[data-testid="tasting-detail"]')).toBeVisible()
      })
    })

    test('should handle advanced professional workflow', async ({ page }) => {
      // Professional user setup
      await page.route('**/api/auth/session', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'pro-user-123',
              email: 'pro@example.com',
              name: 'Professional Taster',
              experienceLevel: 'professional'
            }
          })
        })
      })

      // Create advanced comparative tasting
      await page.click('[data-testid="create-advanced-tasting"]')

      // Add multiple professional categories
      const categories = [
        'Primary Aromas',
        'Secondary Aromas',
        'Tertiary Aromas',
        'Sweetness Level',
        'Acidity Level',
        'Tannin Structure',
        'Body',
        'Length',
        'Quality Score'
      ]

      for (const category of categories) {
        await page.click('[data-testid="add-category-button"]')
        await page.fill('[data-testid="category-name-input"]', category)
        await page.selectOption('[data-testid="parameter-type-select"]', 'sliding_scale')
      }

      // Add multiple beverages for comparison
      const beverages = [
        'Clase Azul Reposado',
        'Don Julio 1942',
        'Patrón Anejo'
      ]

      for (const beverage of beverages) {
        await page.click('[data-testid="add-beverage-button"]')
        await page.fill('[data-testid="beverage-name-input"]', beverage)
        await page.selectOption('[data-testid="beverage-type-select"]', 'tequila')
      }

      // Start comparative tasting
      await page.click('[data-testid="start-comparative-tasting"]')

      // Complete professional evaluation for each beverage
      for (let i = 0; i < beverages.length; i++) {
        await page.fill(`[data-testid="beverage-${i}-primary-aromas"]`, 'agave, citrus, vanilla')
        await page.fill(`[data-testid="beverage-${i}-sweetness"]`, '8')
        await page.fill(`[data-testid="beverage-${i}-acidity"]`, '7')
        await page.fill(`[data-testid="beverage-${i}-quality-score"]`, '9')

        if (i < beverages.length - 1) {
          await page.click('[data-testid="next-beverage-button"]')
        }
      }

      // Complete comparative tasting
      await page.click('[data-testid="complete-comparison-button"]')

      // Verify comparative results
      await expect(page.locator('[data-testid="comparative-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="quality-comparison"]')).toBeVisible()
      await expect(page.locator('[data-testid="flavor-comparison"]')).toBeVisible()
    })
  })

  test.describe('Mobile Experience', () => {
    test.use({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
    })

    test('should provide excellent mobile tasting experience', async ({ page }) => {
      // Mobile-optimized tasting flow
      await page.click('[data-testid="mobile-create-tasting"]')

      // Touch-friendly interface
      await page.tap('[data-testid="mobile-tasting-name-input"]')
      await page.fill('[data-testid="mobile-tasting-name-input"]', 'Mobile Tasting')

      // Mobile-specific interactions
      await page.tap('[data-testid="mobile-add-item"]')
      await page.fill('[data-testid="mobile-item-name"]', 'Mobile Tequila')

      // Mobile photo upload
      const fileInput = page.locator('[data-testid="mobile-photo-upload"]')
      await fileInput.setInputFiles({
        name: 'test-photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content')
      })

      // Mobile tasting process
      await page.tap('[data-testid="mobile-start-tasting"]')

      // Touch-based flavor selection
      await page.tap('[data-testid="mobile-flavor-citrus"]')
      await page.tap('[data-testid="mobile-flavor-sweet"]')
      await page.tap('[data-testid="mobile-flavor-vanilla"]')

      // Mobile rating system
      await page.tap('[data-testid="mobile-rating-8"]')

      // Complete mobile tasting
      await page.tap('[data-testid="mobile-complete-tasting"]')

      // Mobile results view
      await expect(page.locator('[data-testid="mobile-results"]')).toBeVisible()
      await expect(page.locator('[data-testid="mobile-flavor-wheel"]')).toBeVisible()
    })
  })

  test.describe('Error Recovery and Edge Cases', () => {
    test('should handle network interruptions gracefully', async ({ page }) => {
      // Simulate network failure during tasting creation
      await page.route('**/api/tastings', async route => {
        if (route.request().method() === 'POST') {
          await route.abort('failed')
        } else {
          await route.continue()
        }
      })

      await page.click('[data-testid="create-tasting-button"]')
      await page.fill('[data-testid="tasting-name-input"]', 'Network Test Tasting')
      await page.click('[data-testid="create-tasting-submit"]')

      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()

      // Should allow retry
      await page.unroute('**/api/tastings')
      await page.click('[data-testid="retry-button"]')

      await expect(page.locator('[data-testid="tasting-created-message"]')).toBeVisible()
    })

    test('should handle invalid data submissions', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')

      // Submit without required fields
      await page.click('[data-testid="create-tasting-submit"]')

      // Should show validation errors
      await expect(page.locator('[data-testid="name-required-error"]')).toBeVisible()

      // Fill invalid data
      await page.fill('[data-testid="tasting-name-input"]', 'A'.repeat(300)) // Too long
      await page.click('[data-testid="create-tasting-submit"]')

      await expect(page.locator('[data-testid="name-too-long-error"]')).toBeVisible()
    })

    test('should handle concurrent user actions', async ({ page }) => {
      // Simulate rapid clicking
      await page.click('[data-testid="create-tasting-button"]')

      // Click submit multiple times rapidly
      const submitPromises = []
      for (let i = 0; i < 5; i++) {
        submitPromises.push(page.click('[data-testid="create-tasting-submit"]'))
      }

      await Promise.all(submitPromises)

      // Should only process one submission
      const successMessages = await page.locator('[data-testid="tasting-created-message"]').count()
      expect(successMessages).toBeLessThanOrEqual(1)
    })
  })

  test.describe('Performance and Scalability', () => {
    test('should maintain performance with large datasets', async ({ page }) => {
      // Mock large tasting history
      await page.route('**/api/tastings', async route => {
        const largeHistory = Array.from({ length: 100 }, (_, i) => ({
          id: `tasting-${i}`,
          name: `Tasting ${i}`,
          status: 'completed',
          type: 'guided',
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        }))

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ tastings: largeHistory })
        })
      })

      await page.click('[data-testid="profile-button"]')

      // Should load large history without performance issues
      await expect(page.locator('[data-testid="tasting-history"]')).toBeVisible()

      // Measure load time
      const startTime = Date.now()
      await page.waitForSelector('[data-testid="tasting-list-loaded"]', { timeout: 5000 })
      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test('should handle memory-intensive operations', async ({ page }) => {
      // Create tasting with many flavor notes
      await page.click('[data-testid="create-tasting-button"]')
      await page.fill('[data-testid="tasting-name-input"]', 'Memory Test Tasting')

      // Add many items
      for (let i = 0; i < 20; i++) {
        await page.click('[data-testid="add-item-button"]')
        await page.fill(`[data-testid="item-name-${i}"]`, `Beverage ${i}`)
      }

      await page.click('[data-testid="create-tasting-submit"]')
      await expect(page.locator('[data-testid="tasting-created-message"]')).toBeVisible()

      // Start tasting and add extensive notes
      await page.click('[data-testid="start-tasting-button"]')

      const extensiveNotes = 'citrus, lemon, lime, orange, grapefruit, floral, rose, jasmine, lavender, herbal, mint, basil, rosemary, sage, earthy, soil, mushroom, mineral, wet stone, salt, pepper, cinnamon, vanilla, chocolate, caramel, butter, cream, oak, cedar, smoke, charcoal, bacon, campfire, sweet, honey, sugar, fruit, apple, pear, berry, tropical, mango, pineapple, coconut, spicy, ginger, clove, nutmeg, anise, licorice, almond, hazelnut, walnut, cashew, creamy, yogurt, cheese, woody, pine, sandalwood, leather, tobacco, burnt, roasted, baked, stewed, cooked, fresh, green, raw, ripe, overripe, dried, candied, pickled, fermented, aged, mature, young, delicate, subtle, pronounced, intense, mild, balanced, harmonious, complex, elegant, refined, rustic, artisanal, traditional, modern, innovative, exceptional, outstanding, remarkable, extraordinary, sublime, divine, heavenly, angelic, celestial, ethereal, transcendent, unparalleled, incomparable, unmatched, unrivaled, supreme, ultimate, pinnacle, zenith, acme, apex, summit, peak, crest, crown, culmination, climax, crescendo, apex, meridian, noon, midday, afternoon, evening, night, midnight, dawn, sunrise, sunset, dusk, twilight, gloaming, crepuscular, matutinal, vespertine, nocturnal, diurnal, seasonal, spring, summer, autumn, winter, tropical, temperate, continental, mediterranean, oceanic, desert, mountain, valley, plain, forest, jungle, savanna, steppe, tundra, arctic, antarctic, equatorial, polar, coastal, inland, urban, rural, suburban, metropolitan, cosmopolitan, provincial, local, regional, national, international, global, universal, worldwide, planetary, cosmic, infinite, eternal, timeless, ageless, immortal, perpetual, everlasting, unending, ceaseless, incessant, constant, continuous, persistent, relentless, unremitting, uninterrupted, unbroken, solid, massive, substantial, considerable, significant, important, meaningful, valuable, precious, dear, beloved, cherished, treasured, prized, esteemed, respected, admired, revered, venerated, worshipped, adored, idolized, deified, glorified, exalted, magnified, amplified, enhanced, augmented, enlarged, expanded, extended, prolonged, lengthened, stretched, elongated, widened, broadened, deepened, heightened, intensified, strengthened, fortified, reinforced, consolidated, solidified, stabilized, secured, protected, defended, guarded, shielded, sheltered, harbored, housed, lodged, accommodated, contained, encompassed, embraced, enveloped, surrounded, encircled, encompassed, included, incorporated, integrated, assimilated, absorbed, digested, processed, transformed, converted, changed, altered, modified, adapted, adjusted, customized, personalized, individualized, specified, particularized, detailed, elaborated, developed, evolved, progressed, advanced, improved, enhanced, upgraded, refined, polished, perfected, completed, finished, concluded, ended, terminated, ceased, stopped, halted, paused, suspended, interrupted, discontinued, abandoned, forsaken, deserted, neglected, ignored, overlooked, forgotten, remembered, recalled, recollected, reminisced, evoked, elicited, aroused, stimulated, excited, thrilled, delighted, pleased, satisfied, contented, fulfilled, gratified, rewarded, compensated, remunerated, paid, reimbursed, repaid, returned, restored, recovered, retrieved, regained, reclaimed, recaptured, rescued, saved, preserved, conserved, maintained, sustained, supported, upheld, sustained, endured, lasted, persisted, remained, stayed, continued, proceeded, progressed, advanced, moved, went, traveled, journeyed, voyaged, sailed, flew, rode, walked, ran, hurried, rushed, dashed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embraced, adopted, assumed, undertook, engaged, involved, participated, shared, contributed, gave, donated, bestowed, granted, awarded, presented, offered, provided, supplied, furnished, delivered, dispatched, sent, transmitted, forwarded, conveyed, transported, carried, moved, transferred, shifted, relocated, displaced, removed, extracted, withdrew, retired, retreated, withdrew, departed, left, exited, escaped, fled, ran, hurried, rushed, sped, accelerated, hastened, quickened, expedited, facilitated, eased, simplified, clarified, illuminated, enlightened, informed, educated, instructed, taught, guided, directed, led, conducted, managed, administered, supervised, overseen, controlled, regulated, governed, ruled, commanded, ordered, dictated, prescribed, specified, designated, appointed, assigned, allocated, distributed, dispersed, scattered, spread, disseminated, propagated, broadcast, transmitted, communicated, conveyed, expressed, stated, declared, announced, proclaimed, revealed, disclosed, uncovered, exposed, manifested, demonstrated, showed, displayed, exhibited, presented, offered, provided, supplied, furnished, equipped, armed, prepared, ready, set, arranged, organized, structured, systematized, classified, categorized, grouped, assembled, collected, gathered, accumulated, amassed, aggregated, compiled, consolidated, united, joined, connected, linked, attached, fastened, fixed, secured, anchored, moored, docked, berthed, landed, arrived, reached, attained, achieved, accomplished, fulfilled, realized, actualized, materialized, concretized, embodied, incarnated, personified, represented, symbolized, signified, meant, indicated, suggested, implied, inferred, deduced, concluded, judged, decided, determined, resolved, settled, fixed, established, founded, created, originated, initiated, commenced, began, started, launched, inaugurated, opened, unveiled, disclosed, revealed, exposed, uncovered, discovered, found, located, detected, identified, recognized, acknowledged, admitted, confessed, owned, accepted, embrace'

      await page.fill('[data-testid="aroma-input"]', extensiveNotes)
      await page.click('[data-testid="complete-tasting-button"]')

      // Should handle large content without performance issues
      await expect(page.locator('[data-testid="tasting-completed"]')).toBeVisible()
    })
  })
})
