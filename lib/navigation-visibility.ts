import { z } from 'zod'

const Rule = z.object({ 
  pattern: z.string(), 
  show: z.boolean(),
  description: z.string().optional()
})

export type NavRule = z.infer<typeof Rule>

/**
 * Navigation visibility rules configuration
 * Single source of truth for when mobile navigation should be visible
 */
const rules: NavRule[] = [
  { pattern: '/landing', show: true, description: 'Home/Hub after login and for guests' },
  { pattern: '/home', show: true, description: 'Main dashboard for authenticated users' },
  { pattern: '/dashboard', show: true, description: 'Alternative dashboard route' },
  { pattern: '/tasting', show: true, description: 'Create/continue tastings' },
  { pattern: '/create', show: true, description: 'Create new content' },
  { pattern: '/review', show: true, description: 'Review and rate items' },
  { pattern: '/profile', show: true, description: 'User profile and settings' },
  { pattern: '/settings', show: true, description: 'Account/app preferences' },
  { pattern: '/flavor-wheels', show: true, description: 'Flavor wheel visualization' },
  { pattern: '/social', show: true, description: 'Social features' },
  { pattern: '/competition', show: true, description: 'Competition features' },
  { pattern: '/quick-tasting', show: true, description: 'Quick tasting flow' },
  { pattern: '/tastings', show: true, description: 'Tasting history and management' },
  { pattern: '/analytics', show: true, description: 'Analytics dashboard' },
  // Routes where navigation should be hidden
  { pattern: '/onboarding', show: false, description: 'Guided onboarding steps' },
  { pattern: '/auth', show: false, description: 'Authentication screens' },
  { pattern: '/login', show: false, description: 'Login screen' },
  { pattern: '/register', show: false, description: 'Registration screen' },
  { pattern: '/forgot-password', show: false, description: 'Password reset flow' }
]

/**
 * Determines if navigation should be shown for a given pathname
 * @param pathname - The current route pathname
 * @returns boolean - True if navigation should be visible
 */
export function shouldShowNav(pathname?: string): boolean {
  if (!pathname) return true // Default safe value: show nav

  // Remove locale prefix if present (e.g., /en/landing -> /landing)
  const cleanPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/')
  
  // Find matching rule
  for (const rule of rules) {
    if (cleanPath.includes(rule.pattern)) {
      return rule.show
    }
  }
  
  return true // Default safe value: show nav
}

/**
 * Get all navigation rules for debugging/testing
 */
export function getNavRules(): NavRule[] {
  return [...rules]
}

/**
 * Add a custom navigation rule (for testing or dynamic configuration)
 */
export function addNavRule(rule: NavRule): void {
  rules.push(rule)
}

