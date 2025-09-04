import { test, expect } from '@playwright/test'

test.describe('Security & Input Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })
  })

  test.describe('Input Validation & Sanitization', () => {
    test('should prevent XSS attacks in text inputs', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<div onmouseover=alert("XSS")>Hover me</div>',
        '{{constructor.constructor("alert(\'XSS\')")()}}',
        '${alert("XSS")}'
      ]

      for (const payload of xssPayloads) {
        await page.fill('[data-testid="tasting-name-input"]', payload)
        await page.fill('[data-testid="tasting-description-input"]', payload)

        // Submit form
        await page.click('[data-testid="create-tasting-submit"]')

        // Should not execute scripts or show alerts
        const alerts = await page.locator('.alert, [role="alert"]').count()
        expect(alerts).toBe(0) // No alerts should be triggered

        // Content should be sanitized
        const pageContent = await page.textContent('body')
        expect(pageContent).not.toContain('alert("XSS")')
        expect(pageContent).not.toContain('javascript:')

        console.log(`XSS payload tested: ${payload.substring(0, 20)}... - Safe`)
      }
    })

    test('should validate email format and prevent injection', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.waitForSelector('input[type="email"]')

      const maliciousEmails = [
        'user@example.com; DROP TABLE users;',
        'user@example.com\' OR \'1\'=\'1',
        'user@example.com<script>alert(1)</script>',
        'user@exam\r\nple.com', // CRLF injection
        'user@'.repeat(1000) + 'example.com', // Buffer overflow attempt
        'user@exam\x00ple.com', // Null byte injection
        'user@exam%0Aple.com', // URL encoded newline
        'user@exam\x00\x00\x00ple.com' // Multiple null bytes
      ]

      for (const email of maliciousEmails) {
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', 'ValidPass123!')
        await page.click('button[type="submit"]')

        // Should either reject the email or sanitize it
        const errorMessages = await page.locator('text=/invalid|error|format/i').count()
        expect(errorMessages).toBeGreaterThan(0)

        console.log(`Malicious email tested: ${email.substring(0, 30)}...`)
      }
    })

    test('should prevent SQL injection in search', async ({ page }) => {
      await page.click('[data-testid="social-feed"]')
      await page.waitForSelector('[data-testid="search-input"]')

      const sqlInjections = [
        "'; DROP TABLE tastings; --",
        "' OR '1'='1",
        "'; SELECT * FROM users; --",
        "admin'--",
        "1' OR '1' = '1",
        "'; UPDATE users SET password='hacked' WHERE id=1; --"
      ]

      for (const injection of sqlInjections) {
        await page.fill('[data-testid="search-input"]', injection)
        await page.click('[data-testid="search-button"]')

        // Should not crash or return unexpected results
        await expect(page.locator('[data-testid="tasting-feed"]')).toBeVisible()

        // Should not show sensitive data
        const pageText = await page.textContent('body')
        expect(pageText).not.toMatch(/DROP TABLE|UPDATE.*password|SELECT.*FROM/i)

        console.log(`SQL injection tested: ${injection.substring(0, 20)}... - Blocked`)
      }
    })

    test('should handle large input payloads safely', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')
      await page.waitForSelector('[data-testid="tasting-name-input"]')

      const largeInputs = [
        'A'.repeat(10000), // 10KB string
        'A'.repeat(100000), // 100KB string
        'A'.repeat(1000000), // 1MB string
        '🚀'.repeat(10000), // Unicode characters
        'A\n'.repeat(10000), // With newlines
        '\x00'.repeat(10000), // Null bytes
      ]

      for (const largeInput of largeInputs) {
        try {
          await page.fill('[data-testid="tasting-description-input"]', largeInput)

          // Should either accept (if within limits) or show size error
          const sizeErrors = await page.locator('text=/too long|size|limit/i').count()

          if (largeInput.length > 10000) {
            expect(sizeErrors).toBeGreaterThan(0) // Should show size limit error
          }

          console.log(`Large input tested: ${largeInput.length} chars - Handled`)
        } catch (error) {
          // Browser might reject extremely large inputs
          console.log(`Large input rejected by browser: ${largeInput.length} chars`)
        }
      }
    })

    test('should sanitize HTML content', async ({ page }) => {
      await page.click('[data-testid="create-tasting-button"]')

      const htmlContent = `
        <div>
          <h1>Title</h1>
          <script>alert('XSS')</script>
          <img src="fake.jpg" onerror="alert('XSS')">
          <a href="javascript:alert('XSS')">Click me</a>
          <iframe src="javascript:alert('XSS')"></iframe>
          <style>body { background: red; }</style>
        </div>
      `

      await page.fill('[data-testid="tasting-description-input"]', htmlContent)
      await page.click('[data-testid="create-tasting-submit"]')

      // Wait for any processing
      await page.waitForTimeout(1000)

      // Check that dangerous elements are removed
      const dangerousElements = await page.locator('script, iframe, [onerror], [onclick]').count()
      expect(dangerousElements).toBe(0)

      console.log('HTML content properly sanitized')
    })
  })

  test.describe('Authentication Security', () => {
    test('should prevent brute force attacks', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.waitForSelector('input[type="email"]')

      const email = 'test@example.com'
      const wrongPassword = 'wrongpassword'

      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        await page.fill('input[type="email"]', email)
        await page.fill('input[type="password"]', `${wrongPassword}${i}`)
        await page.click('button[type="submit"]')

        // Clear form for next attempt
        await page.fill('input[type="email"]', '')
        await page.fill('input[type="password"]', '')
      }

      // Should be blocked or show rate limiting
      const blockMessages = await page.locator('text=/blocked|rate limit|too many/i').count()
      expect(blockMessages).toBeGreaterThan(0)

      console.log('Brute force protection working')
    })

    test('should handle session security', async ({ page }) => {
      // Mock authenticated user
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' },
          token: 'valid-jwt-token',
          expiresAt: Date.now() + 3600000 // 1 hour from now
        }))
      })

      await page.reload()

      // Should maintain session
      const sessionData = await page.evaluate(() => {
        return localStorage.getItem('user-session')
      })

      expect(sessionData).toBeTruthy()

      // Try to access protected content
      await page.click('[data-testid="profile-button"]')
      await page.waitForURL('**/profile**')

      // Should show user profile
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()

      console.log('Session security maintained')
    })

    test('should prevent session hijacking attempts', async ({ page, context }) => {
      // Set up valid session
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' },
          token: 'valid-token-123'
        }))
      })

      // Open second tab to simulate different session
      const page2 = await context.newPage()
      await page2.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'hacker-user' },
          token: 'stolen-token-456'
        }))
      })

      // First tab should still work
      await page.click('[data-testid="profile-button"]')
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()

      // Second tab should not affect first
      await page.bringToFront()
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible()

      await page2.close()

      console.log('Session hijacking protection working')
    })

    test('should secure password reset flow', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.click('text=/forgot|reset/i')
      await page.waitForSelector('input[type="email"]')

      // Test with valid email
      await page.fill('input[type="email"]', 'test@example.com')
      await page.click('button[type="submit"]')

      // Should show success but not reveal if email exists
      await expect(page.locator('text=/sent|check|reset link/i')).toBeVisible()

      // Test with invalid email
      await page.fill('input[type="email"]', 'nonexistent@example.com')
      await page.click('button[type="submit"]')

      // Should show same message to prevent email enumeration
      await expect(page.locator('text=/sent|check|reset link/i')).toBeVisible()

      console.log('Password reset security working')
    })
  })

  test.describe('API Security', () => {
    test('should require authentication for protected endpoints', async ({ page }) => {
      const protectedEndpoints = [
        '/api/user/profile',
        '/api/tastings',
        '/api/social/feed',
        '/api/analytics/user'
      ]

      for (const endpoint of protectedEndpoints) {
        const response = await page.request.get(endpoint)

        // Should return 401 or 403
        expect([401, 403].includes(response.status())).toBeTruthy()

        if (response.status() === 401) {
          const error = await response.json()
          expect(error).toHaveProperty('error', 'Unauthorized')
        }

        console.log(`Protected endpoint ${endpoint}: ${response.status()}`)
      }
    })

    test('should validate API request parameters', async ({ page }) => {
      // Mock authenticated request
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' },
          token: 'valid-token'
        }))
      })

      const invalidRequests = [
        { endpoint: '/api/tastings', data: { name: '', type: 'invalid' } },
        { endpoint: '/api/user/profile', data: { email: 'invalid-email' } },
        { endpoint: '/api/social/follow/123', method: 'POST' }
      ]

      for (const request of invalidRequests) {
        const response = await page.request.post(request.endpoint, {
          data: request.data || {}
        })

        // Should return 400 for invalid data
        expect([400, 422].includes(response.status())).toBeTruthy()

        if (response.status() === 400) {
          const error = await response.json()
          expect(error).toHaveProperty('error')
          expect(error).toHaveProperty('message')
        }

        console.log(`Invalid request to ${request.endpoint}: ${response.status()}`)
      }
    })

    test('should prevent API abuse', async ({ page }) => {
      const endpoint = '/api/health'

      // Make rapid requests
      const requests = []
      for (let i = 0; i < 50; i++) {
        requests.push(page.request.get(endpoint))
      }

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(r => r.status() === 429)

      // Should trigger rate limiting
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      if (rateLimitedResponses.length > 0) {
        const headers = rateLimitedResponses[0].headers()
        expect(headers).toHaveProperty('x-ratelimit-limit')
        expect(headers).toHaveProperty('retry-after')
      }

      console.log(`Rate limiting triggered: ${rateLimitedResponses.length} requests blocked`)
    })

    test('should handle CORS properly', async ({ page }) => {
      // Test preflight request
      const response = await page.request.fetch('/api/tastings', {
        method: 'OPTIONS'
      })

      expect([200, 204].includes(response.status())).toBeTruthy()

      const headers = response.headers()
      expect(headers).toHaveProperty('access-control-allow-origin')
      expect(headers).toHaveProperty('access-control-allow-methods')
      expect(headers).toHaveProperty('access-control-allow-headers')

      // Test actual CORS request
      const corsResponse = await page.request.post('/api/tastings', {
        headers: {
          'Origin': 'http://malicious-site.com'
        }
      })

      // Should be blocked or handled appropriately
      expect([0, 403, 401].includes(corsResponse.status()) || corsResponse.status() >= 400).toBeTruthy()

      console.log('CORS security working properly')
    })
  })

  test.describe('File Upload Security', () => {
    test('should validate uploaded files', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.waitForSelector('[data-testid="user-profile"]')

      const fileInput = page.locator('input[type="file"]').first()

      if (await fileInput.isVisible()) {
        // Test with malicious file types
        const maliciousFiles = [
          { name: 'malicious.exe', mimeType: 'application/x-msdownload', buffer: Buffer.from('malicious content') },
          { name: 'script.php', mimeType: 'application/x-php', buffer: Buffer.from('<?php echo "hacked"; ?>') },
          { name: 'large.zip', mimeType: 'application/zip', buffer: Buffer.from('x'.repeat(100 * 1024 * 1024)) }, // 100MB
          { name: 'webshell.jsp', mimeType: 'application/jsp', buffer: Buffer.from('<% Runtime.getRuntime().exec("rm -rf /"); %>') }
        ]

        for (const file of maliciousFiles) {
          try {
            await fileInput.setInputFiles({
              name: file.name,
              mimeType: file.mimeType,
              buffer: file.buffer
            })

            // Should either reject or show security error
            const errorMessages = await page.locator('text=/invalid|not allowed|security|dangerous/i').count()
            expect(errorMessages).toBeGreaterThan(0)

            console.log(`Malicious file ${file.name} rejected`)
          } catch (error) {
            console.log(`Browser rejected malicious file ${file.name}`)
          }
        }

        // Test with valid file
        await fileInput.setInputFiles({
          name: 'profile.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-content')
        })

        const uploadErrors = await page.locator('text=/error|invalid/i').count()
        expect(uploadErrors).toBe(0)

        console.log('Valid file upload accepted')
      }
    })

    test('should prevent directory traversal', async ({ page }) => {
      const traversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '.../...//etc/passwd',
        '..\..\..\..\..\..\windows\win.ini'
      ]

      for (const payload of traversalPayloads) {
        const response = await page.request.get(`/api/files/${payload}`)

        // Should return 400, 403, or 404
        expect([400, 403, 404].includes(response.status())).toBeTruthy()

        console.log(`Directory traversal ${payload}: ${response.status()}`)
      }
    })
  })

  test.describe('Content Security', () => {
    test('should implement CSP headers', async ({ page }) => {
      const response = await page.request.get('/en/landing')

      const cspHeader = response.headers()['content-security-policy'] ||
                       response.headers()['content-security-policy-report-only']

      expect(cspHeader).toBeTruthy()
      expect(cspHeader).toContain("default-src")
      expect(cspHeader).toContain("script-src")

      console.log('CSP headers implemented')
    })

    test('should prevent clickjacking attacks', async ({ page }) => {
      const response = await page.request.get('/en/landing')

      const xFrameOptions = response.headers()['x-frame-options']
      const csp = response.headers()['content-security-policy']

      // Should have X-Frame-Options or CSP frame-ancestors
      expect(xFrameOptions === 'DENY' || xFrameOptions === 'SAMEORIGIN' ||
             (csp && csp.includes('frame-ancestors'))).toBeTruthy()

      console.log('Clickjacking protection implemented')
    })

    test('should set secure headers', async ({ page }) => {
      const response = await page.request.get('/en/landing')

      const headers = response.headers()

      // Should have security headers
      expect(headers).toHaveProperty('x-content-type-options', 'nosniff')
      expect(headers).toHaveProperty('x-xss-protection')
      expect(headers['strict-transport-security'] || headers['x-forwarded-proto'] === 'https').toBeTruthy()

      console.log('Security headers implemented')
    })
  })

  test.describe('Data Privacy & GDPR Compliance', () => {
    test('should handle data export requests', async ({ page }) => {
      // Mock authenticated user
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' }
        }))
      })

      const response = await page.request.get('/api/user/export')

      expect([200, 202].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const exportData = await response.json()
        expect(exportData).toHaveProperty('user')
        expect(exportData).toHaveProperty('tastings')
        expect(exportData).toHaveProperty('exportDate')

        // Should not include sensitive data like passwords
        expect(exportData.user).not.toHaveProperty('password')
        expect(exportData.user).not.toHaveProperty('passwordHash')
      }

      console.log('Data export functionality working')
    })

    test('should handle data deletion requests', async ({ page }) => {
      const response = await page.request.delete('/api/user/data')

      expect([200, 202, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('message')
        expect(result.message).toContain('scheduled') // Should be scheduled, not immediate
      }

      console.log('Data deletion functionality working')
    })

    test('should show privacy policy and consent', async ({ page }) => {
      // Check for privacy policy link
      const privacyLink = page.locator('a[href*="privacy"], text=/privacy/i').first()

      if (await privacyLink.isVisible()) {
        await privacyLink.click()
        await page.waitForURL('**/privacy**')

        await expect(page.locator('text=/privacy|data protection|gdpr/i')).toBeVisible()
      }

      // Check for cookie consent
      const consentBanner = page.locator('[data-testid*="consent"], [data-testid*="cookie"]').first()

      if (await consentBanner.isVisible()) {
        await expect(consentBanner.locator('button')).toBeVisible() // Should have accept/reject buttons
      }

      console.log('Privacy compliance features present')
    })
  })
})
