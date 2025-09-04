import { test, expect } from '@playwright/test'

test.describe('Advanced Authentication & User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })
  })

  test.describe('User Registration Flow', () => {
    test('should handle complete registration with validation', async ({ page }) => {
      // Navigate to registration
      await page.click('[aria-label*="Create a new account"], [data-testid*="register"]')

      // Wait for registration form
      await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 5000 })

      // Test empty form submission
      const submitButton = page.locator('button[type="submit"], [aria-label*="Sign up"], [data-testid*="register-submit"]')
      await submitButton.click()

      // Should show validation errors
      await expect(page.locator('text=/required|empty|fill/i')).toBeVisible()

      // Fill form with valid data
      await page.fill('input[name="email"], input[type="email"]', 'test@example.com')
      await page.fill('input[name="password"], input[type="password"]', 'ValidPass123!')
      await page.fill('input[name="confirmPassword"], input[name="passwordConfirm"]', 'ValidPass123!')
      await page.fill('input[name="firstName"], input[name="name"]', 'Test User')
      await page.fill('input[name="lastName"]', 'Taster')

      // Accept terms if present
      const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], [data-testid*="terms-accept"]')
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check()
      }

      // Submit registration
      await submitButton.click()

      // Should show success or redirect to verification
      await expect(page.locator('text=/verify|check|success/i')).toBeVisible({ timeout: 10000 })
    })

    test('should validate email format', async ({ page }) => {
      await page.click('[aria-label*="Create a new account"]')
      await page.waitForSelector('input[type="email"]')

      const emailInput = page.locator('input[type="email"]')
      const submitButton = page.locator('button[type="submit"]')

      // Test invalid email formats
      const invalidEmails = ['invalid', 'invalid@', '@invalid.com', 'invalid..com']

      for (const invalidEmail of invalidEmails) {
        await emailInput.fill(invalidEmail)
        await submitButton.click()
        await expect(page.locator('text=/invalid email|email format/i')).toBeVisible()
      }

      // Test valid email
      await emailInput.fill('valid@example.com')
      await submitButton.click()
      await expect(page.locator('text=/invalid email|email format/i')).not.toBeVisible()
    })

    test('should validate password strength', async ({ page }) => {
      await page.click('[aria-label*="Create a new account"]')
      await page.waitForSelector('input[type="password"]')

      const passwordInput = page.locator('input[type="password"]').first()
      const submitButton = page.locator('button[type="submit"]')

      // Test weak passwords
      const weakPasswords = ['123', 'password', 'weak']

      for (const weakPassword of weakPasswords) {
        await passwordInput.fill(weakPassword)
        await submitButton.click()
        await expect(page.locator('text=/password.*strength|too weak|at least/i')).toBeVisible()
      }

      // Test strong password
      await passwordInput.fill('StrongPass123!')
      await submitButton.click()
      await expect(page.locator('text=/password.*strength|too weak/i')).not.toBeVisible()
    })

    test('should handle duplicate email registration', async ({ page }) => {
      await page.click('[aria-label*="Create a new account"]')
      await page.waitForSelector('input[type="email"]')

      // Try to register with existing email
      await page.fill('input[type="email"]', 'existing@example.com')
      await page.fill('input[type="password"]', 'ValidPass123!')
      await page.fill('input[name="confirmPassword"]', 'ValidPass123!')

      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // Should show email already exists error
      await expect(page.locator('text=/already exists|already registered|email taken/i')).toBeVisible()
    })
  })

  test.describe('User Login Flow', () => {
    test('should handle successful login', async ({ page }) => {
      // Navigate to login
      await page.click('[aria-label*="Log in"], [data-testid*="login"]')
      await page.waitForSelector('input[type="email"], input[name="email"]')

      // Fill login form
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com')
      await page.fill('input[type="password"], input[name="password"]', 'ValidPass123!')

      // Submit login
      await page.click('button[type="submit"], [aria-label*="Sign in"]')

      // Should redirect to dashboard or show success
      await expect(page.locator('[data-testid*="profile"], [data-testid*="dashboard"]')).toBeVisible({ timeout: 10000 })
    })

    test('should handle invalid credentials', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.waitForSelector('input[type="email"]')

      // Test invalid email
      await page.fill('input[type="email"]', 'invalid@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=/invalid credentials|wrong|incorrect/i')).toBeVisible()

      // Test empty fields
      await page.fill('input[type="email"]', '')
      await page.fill('input[type="password"]', '')
      await page.click('button[type="submit"]')

      await expect(page.locator('text=/required|empty/i')).toBeVisible()
    })

    test('should handle account lockout after failed attempts', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.waitForSelector('input[type="email"]')

      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await page.fill('input[type="email"]', 'test@example.com')
        await page.fill('input[type="password"]', 'wrongpassword' + i)
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1000)
      }

      // Should show account lockout message
      await expect(page.locator('text=/locked|too many|blocked/i')).toBeVisible()
    })

    test('should handle remember me functionality', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.waitForSelector('input[type="email"]')

      // Fill login form
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'ValidPass123!')

      // Check remember me
      const rememberCheckbox = page.locator('input[type="checkbox"][name*="remember"], [data-testid*="remember"]')
      if (await rememberCheckbox.isVisible()) {
        await rememberCheckbox.check()
      }

      await page.click('button[type="submit"]')

      // Verify login persists across browser restart (simulated)
      await page.reload()
      await expect(page.locator('[data-testid*="profile"]')).toBeVisible()
    })
  })

  test.describe('Password Management', () => {
    test('should handle forgot password flow', async ({ page }) => {
      await page.click('[aria-label*="Log in"]')
      await page.click('text=/forgot|reset/i')
      await page.waitForSelector('input[type="email"]')

      // Enter email for password reset
      await page.fill('input[type="email"]', 'test@example.com')
      await page.click('button[type="submit"], text=/reset|send/i')

      // Should show success message
      await expect(page.locator('text=/sent|check|reset link/i')).toBeVisible()
    })

    test('should handle password reset', async ({ page }) => {
      // Simulate clicking reset link (in real app this would come from email)
      await page.goto('/reset-password?token=valid-reset-token')
      await page.waitForSelector('input[type="password"]')

      // Fill new password
      await page.fill('input[name="newPassword"], input[type="password"]', 'NewStrongPass123!')
      await page.fill('input[name="confirmPassword"]', 'NewStrongPass123!')
      await page.click('button[type="submit"]')

      // Should show success and redirect to login
      await expect(page.locator('text=/updated|changed|success/i')).toBeVisible()
      await page.waitForURL('**/login**', { timeout: 5000 })
    })

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/reset-password?token=valid-reset-token')
      await page.waitForSelector('input[type="password"]')

      // Fill mismatched passwords
      await page.fill('input[name="newPassword"]', 'Password123!')
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!')
      await page.click('button[type="submit"]')

      // Should show mismatch error
      await expect(page.locator('text=/match|confirm|same/i')).toBeVisible()
    })
  })

  test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Assume user is logged in
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user', email: 'test@example.com', name: 'Test User' }
        }))
      })
    })

    test('should update user profile', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.waitForURL('**/profile**')

      // Update profile information
      await page.fill('input[name="firstName"]', 'Updated')
      await page.fill('input[name="lastName"]', 'User')
      await page.fill('input[name="bio"]', 'Experienced whiskey taster')

      // Update preferences
      await page.selectOption('select[name="experienceLevel"]', 'professional')
      await page.check('input[name="notifications"]')

      await page.click('button[type="submit"], text=/save|update/i')

      // Should show success message
      await expect(page.locator('text=/updated|saved|success/i')).toBeVisible()
    })

    test('should handle profile picture upload', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.waitForURL('**/profile**')

      // Upload profile picture
      const fileInput = page.locator('input[type="file"][accept*="image"], [data-testid*="avatar-upload"]')
      await fileInput.setInputFiles({
        name: 'profile.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-content')
      })

      await page.click('button[type="submit"], text=/upload|save/i')

      // Should show uploaded image
      await expect(page.locator('img[alt*="profile"], [data-testid*="profile-avatar"]')).toBeVisible()
    })

    test('should validate profile data', async ({ page }) => {
      await page.click('[data-testid="profile-button"]')
      await page.waitForURL('**/profile**')

      // Clear required fields and submit
      await page.fill('input[name="firstName"]', '')
      await page.click('button[type="submit"]')

      // Should show validation error
      await expect(page.locator('text=/required|empty/i')).toBeVisible()
    })
  })

  test.describe('Session Management', () => {
    test('should handle session timeout', async ({ page }) => {
      // Simulate expired session
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' },
          expiresAt: Date.now() - 1000 // Expired
        }))
      })

      await page.reload()

      // Should redirect to login or show session expired
      await expect(page.locator('text=/expired|login|session/i')).toBeVisible()
    })

    test('should handle logout correctly', async ({ page }) => {
      // Assume user is logged in
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user', email: 'test@example.com' }
        }))
      })

      await page.click('[data-testid="profile-button"]')
      await page.click('text=/logout|sign out/i')

      // Should clear session and redirect to home
      await expect(page.locator('[data-testid="profile-button"]')).not.toBeVisible()
      await page.waitForURL('**/landing**', { timeout: 5000 })
    })

    test('should handle multiple tabs synchronization', async ({ page, context }) => {
      // Simulate logged in user
      await page.evaluate(() => {
        localStorage.setItem('user-session', JSON.stringify({
          user: { id: 'test-user' }
        }))
      })

      // Open second tab
      const page2 = await context.newPage()
      await page2.goto('/en/landing')

      // Logout from first tab
      await page.click('[data-testid="profile-button"]')
      await page.click('text=/logout/i')

      // Second tab should also show logged out state
      await page2.reload()
      await expect(page2.locator('[data-testid="profile-button"]')).not.toBeVisible()
    })
  })
})
