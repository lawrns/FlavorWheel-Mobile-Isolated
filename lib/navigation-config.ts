import {
  Home as HiHome,
  Plus as HiPlus,
  Sparkles as HiSparkles,
  User as HiUser,
  Cog as HiCog,
  BarChart3 as HiChartBar,
  Users as HiUsers,
  LayoutTemplate as HiTemplate,
  Star as HiStar,
  Eye as HiEye,
  Zap as HiLightningBolt,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useTranslations } from './utils'

export interface NavigationItem {
  id: string
  label: string
  icon: ComponentType<any>
  emoji?: string
  href?: string
  color?: string
  requiredLevel?: 'beginner' | 'intermediate' | 'advanced'
  premium?: boolean
  disabled?: boolean
  badge?: string | number
}

/**
 * Clean 4-button navigation configuration for FlavorWheel
 * Single source of truth for all navigation items
 * Only includes working pages to avoid broken links
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Core 4-button navigation (only working pages)
  {
    id: 'home',
    label: 'Home',
    icon: HiHome,
    emoji: '🏠',
    href: '/landing',
    color: 'wine-green',
  },
  {
    id: 'create',
    label: 'Create',
    icon: HiPlus,
    emoji: '➕',
    href: '/create',
    color: 'wine-green',
  },
  {
    id: 'review',
    label: 'Review',
    icon: HiStar,
    emoji: '⭐',
    href: '/review',
    color: 'elegant-brown',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: HiUser,
    emoji: '👤',
    href: '/profile',
    color: 'neutral-gray',
  },
]

/**
 * Route to navigation item mapping
 * Maps page routes to their corresponding navigation item IDs
 * Only includes working pages to avoid broken navigation
 */
export const ROUTE_TO_NAV_MAPPING: Record<string, string> = {
  // Core pages (only working ones)
  '/': 'home',
  '/landing': 'home',
  '/create': 'create',
  '/review': 'review',
  '/profile': 'profile',

  // Feature pages that map to core navigation
  '/tastings': 'home',
  '/create-wheel': 'review',
  '/test-sunburst-wheel': 'review',
}

/**
 * Mobile navigation items (exactly 4 core buttons)
 * All core navigation items for mobile bottom navigation
 */
export const MOBILE_NAV_ITEMS = NAVIGATION_ITEMS

/**
 * Desktop navigation items (same as mobile for consistency)
 */
export const DESKTOP_NAV_ITEMS = NAVIGATION_ITEMS

/**
 * Get navigation item by ID
 */
export function getNavigationItem(id: string): NavigationItem | undefined {
  return NAVIGATION_ITEMS.find(item => item.id === id)
}

/**
 * Get navigation item for current route
 */
export function getNavigationItemForRoute(route: string): NavigationItem | undefined {
  // Remove locale prefix and normalize route
  const normalizedRoute = route.replace(/^\/([a-z]{2})(-[A-Z]{2})?\b/, '') || '/'
  const navId = ROUTE_TO_NAV_MAPPING[normalizedRoute]
  return navId ? getNavigationItem(navId) : getNavigationItem('home')
}

/**
 * Get active navigation ID for current route
 */
export function getActiveNavId(route: string): string {
  const normalizedRoute = route.replace(/^\/([a-z]{2})(-[A-Z]{2})?\b/, '') || '/'
  return ROUTE_TO_NAV_MAPPING[normalizedRoute] || 'home'
}

/**
 * Check if navigation item is available for user level
 */
export function isNavigationItemAvailable(
  item: NavigationItem,
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): boolean {
  if (item.disabled) return false
  if (item.premium) return false // TODO: Check premium status

  if (item.requiredLevel) {
    const levels = ['beginner', 'intermediate', 'advanced']
    const userLevelIndex = levels.indexOf(userLevel)
    const requiredLevelIndex = levels.indexOf(item.requiredLevel)
    return userLevelIndex >= requiredLevelIndex
  }

  return true
}

/**
 * Get filtered navigation items for user
 */
export function getAvailableNavigationItems(
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  isMobile: boolean = false
): NavigationItem[] {
  const items = isMobile ? MOBILE_NAV_ITEMS : DESKTOP_NAV_ITEMS
  return items.filter(item => isNavigationItemAvailable(item, userLevel))
}
