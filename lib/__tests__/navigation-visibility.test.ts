import { shouldShowNav, getNavRules, addNavRule } from '../navigation-visibility'
import { describe, it, expect } from 'vitest'


describe('Navigation Visibility', () => {
  describe('shouldShowNav', () => {
    const testCases = [
      // Routes where navigation should be visible
      { path: '/es/home', expect: true, description: 'home page' },
      { path: '/en/landing', expect: true, description: 'landing page' },
      { path: '/es/dashboard', expect: true, description: 'dashboard page' },
      { path: '/en/tasting/123', expect: true, description: 'tasting page' },
      { path: '/es/create', expect: true, description: 'create page' },
      { path: '/en/review', expect: true, description: 'review page' },
      { path: '/es/profile', expect: true, description: 'profile page' },
      { path: '/en/settings', expect: true, description: 'settings page' },
      { path: '/es/flavor-wheels', expect: true, description: 'flavor wheels page' },
      { path: '/en/social', expect: true, description: 'social page' },
      { path: '/es/competition/123', expect: true, description: 'competition page' },
      { path: '/en/quick-tasting', expect: true, description: 'quick tasting page' },
      { path: '/es/tastings', expect: true, description: 'tastings page' },
      { path: '/en/analytics', expect: true, description: 'analytics page' },

      // Routes where navigation should be hidden
      { path: '/es/onboarding/start', expect: false, description: 'onboarding page' },
      { path: '/en/auth/login', expect: false, description: 'auth page' },
      { path: '/es/login', expect: false, description: 'login page' },
      { path: '/en/register', expect: false, description: 'register page' },
      { path: '/es/forgot-password', expect: false, description: 'forgot password page' },

      // Edge cases
      { path: undefined, expect: true, description: 'undefined path' },
      { path: '', expect: true, description: 'empty path' },
      { path: '/unknown-route', expect: true, description: 'unknown route (default to show)' },
    ]

    testCases.forEach(({ path, expect: expected, description }) => {
      it(`should ${expected ? 'show' : 'hide'} navigation on ${description}`, () => {
        expect(shouldShowNav(path)).toBe(expected)
      })
    })
  })

  describe('getNavRules', () => {
    it('should return all navigation rules', () => {
      const rules = getNavRules()
      expect(Array.isArray(rules)).toBe(true)
      expect(rules.length).toBeGreaterThan(0)

      // Check that we have both show and hide rules
      const showRules = rules.filter(rule => rule.show)
      const hideRules = rules.filter(rule => !rule.show)

      expect(showRules.length).toBeGreaterThan(0)
      expect(hideRules.length).toBeGreaterThan(0)
    })
  })

  describe('addNavRule', () => {
    it('should allow adding custom navigation rules', () => {
      const initialRules = getNavRules()
      const initialCount = initialRules.length

      addNavRule({
        pattern: '/custom-route',
        show: false,
        description: 'Custom test route'
      })

      const updatedRules = getNavRules()
      expect(updatedRules.length).toBe(initialCount + 1)

      // Test that the new rule works
      expect(shouldShowNav('/en/custom-route')).toBe(false)
    })
  })
})

