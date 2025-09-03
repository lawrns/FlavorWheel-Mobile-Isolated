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
 * Simplified 4-button navigation configuration for FlavorWheel
 * Single source of truth for all navigation items across desktop and mobile
 * Exactly 4 core buttons as requested in client feedback
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // Core 4-button navigation (simplified per client feedback)
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
    id: 'social',
    label: 'Social',
    icon: HiUsers,
    emoji: '👥',
    href: '/social',
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

  // Legacy items for backward compatibility (not shown in main navigation)
  {
    id: 'flavor-wheels',
    label: 'Flavor Wheels',
    icon: HiSparkles,
    emoji: '🎯',
    href: '/flavor-wheels',
    color: 'elegant-brown',
    requiredLevel: 'beginner',
  },
  {
    id: 'menu',
    label: 'Menu',
    icon: HiCog,
    emoji: '☰',
    href: '/menu',
    color: 'neutral-gray',
  },
  {
    id: 'join',
    label: 'Join Event',
    icon: HiUsers,
    emoji: '📱',
    href: '/join',
    color: 'wine-green',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: HiTemplate,
    emoji: '📋',
    href: '/templates',
    color: 'elegant-brown',
    requiredLevel: 'beginner',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: HiChartBar,
    emoji: '📊',
    href: '/analytics',
    color: 'elegant-brown',
    requiredLevel: 'intermediate',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: HiUser,
    emoji: '👤',
    href: '/profile',
    color: 'neutral-gray',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: HiCog,
    emoji: '⚙️',
    href: '/settings',
    color: 'neutral-gray',
  },
]

/**
 * Route to navigation item mapping
 * Maps page routes to their corresponding navigation item IDs
 */
export const ROUTE_TO_NAV_MAPPING: Record<string, string> = {
  // Core pages - Updated per client feedback
  '/': 'home',
  '/landing': 'home',
  '/create': 'create',
  '/social': 'social',
  '/review': 'review',
  '/create-wheel': 'review',
  '/test-sunburst-wheel': 'review',
  '/flavor-wheels': 'flavor-wheels',
  '/menu': 'menu',

  // Legacy routes
  '/join': 'join',
  '/templates': 'templates',
  '/analytics': 'analytics',
  '/profile': 'profile',
  '/settings': 'settings',

  // Feature pages that map to core navigation
  '/flavor-wheel': 'flavor-wheels',
  '/progress': 'profile',
  '/tastings': 'home',
  '/design-system': 'settings',
}

/**
 * Mobile navigation items (exactly 4 core buttons per client feedback)
 * Optimized for mobile bottom navigation - Simplified to core 4 buttons only
 */
export const MOBILE_NAV_ITEMS = NAVIGATION_ITEMS.filter(item =>
  ['home', 'create', 'social', 'review'].includes(item.id)
)

/**
 * Desktop navigation items (full navigation)
 * All navigation items for desktop/tablet navigation
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
