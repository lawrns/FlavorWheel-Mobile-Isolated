/**
 * ARIA helpers for navigation semantics and accessibility compliance
 * Provides consistent ARIA attributes across the application
 */

/**
 * Navigation props for proper ARIA semantics
 * @param label - Accessible name for the navigation landmark
 * @returns Object with proper ARIA attributes
 */
export const navProps = (label = 'Primary'): Record<string, string> => ({
  role: 'navigation',
  'aria-label': label
})

/**
 * Button props for navigation items
 * @param isActive - Whether the button represents the current page
 * @param label - Accessible name for the button
 * @returns Object with proper ARIA attributes
 */
export const navButtonProps = (isActive: boolean = false, label?: string): Record<string, any> => ({
  role: 'button',
  'aria-current': isActive ? 'page' : undefined,
  'aria-label': label,
  tabIndex: 0
})

/**
 * Tab props for tab-based navigation (use only with proper tabpanel structure)
 * @param isActive - Whether the tab is currently selected
 * @param label - Accessible name for the tab
 * @param controls - ID of the tabpanel this tab controls
 * @returns Object with proper ARIA attributes
 */
export const tabProps = (isActive: boolean = false, label?: string, controls?: string): Record<string, any> => ({
  role: 'tab',
  'aria-selected': isActive,
  'aria-label': label,
  'aria-controls': controls,
  tabIndex: isActive ? 0 : -1
})

/**
 * Skip link props for keyboard navigation
 * @param target - ID of the element to skip to
 * @returns Object with proper ARIA attributes
 */
export const skipLinkProps = (target: string): Record<string, string> => ({
  'aria-label': `Skip to ${target}`,
  href: `#${target}`
})

/**
 * Focus management utilities
 */
export const focusProps = {
  /**
   * Enhanced focus ring for better visibility
   */
  focusRing: 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--fx-focus)]',
  
  /**
   * Remove default focus styles (use with custom focus implementation)
   */
  noDefaultFocus: 'focus:outline-none',
  
  /**
   * Keyboard-only focus (hides focus ring for mouse users)
   */
  keyboardOnly: 'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--fx-focus)]'
}

/**
 * Screen reader only content
 */
export const srOnly = 'sr-only'

/**
 * Live region props for dynamic content announcements
 * @param politeness - How urgently to announce changes
 * @returns Object with proper ARIA attributes
 */
export const liveRegionProps = (politeness: 'polite' | 'assertive' = 'polite'): Record<string, string> => ({
  'aria-live': politeness,
  'aria-atomic': 'true'
})

