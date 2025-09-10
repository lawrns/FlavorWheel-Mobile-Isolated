'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, User, Settings, Sparkles, QrCode, Menu, X, Star, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MOBILE_NAV_ITEMS } from '@/lib/navigation-config'
import { LogoOnly, BrandTitle } from '@/components/brand'
import { shouldShowNav } from '@/lib/navigation-visibility'
import { navProps, navButtonProps, focusProps } from '@/lib/a11y/roles'

interface MobileNavigationProps {
  activeScreen?: string
  onScreenChange?: (screen: string) => void
  className?: string
}

export function MobileNavigation({
  activeScreen = 'dashboard',
  onScreenChange,
  className = '',
}: MobileNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Use centralized navigation config - Updated per client feedback
  const mainNavItems = MOBILE_NAV_ITEMS.map(item => ({
    id: item.id,
    icon: item.icon,
    label: item.label,
    path: `/en${item.href}`
  }))

  const secondaryNavItems = [
    // Profile is now in main navigation, so only add additional items here
    { id: 'analytics', icon: Settings, label: 'Analytics', path: '/en/analytics' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/en/settings' },
  ]

  // Close expanded menu when screen changes
  useEffect(() => {
    setIsExpanded(false)
  }, [activeScreen])

  // Use centralized navigation visibility logic
  const shouldShowNavigation = shouldShowNav(pathname)

  // Debug logging removed for production performance

  // Instead of returning null, render an empty div to maintain hooks consistency
  if (!shouldShowNavigation) {
    return <div style={{ display: 'none' }} aria-hidden="true" data-debug="nav-hidden" />
  }

  return (
    <>
      {/* Mobile Bottom Navigation - Always Visible */}
      <nav
        data-testid="mobile-navigation-root"
        id="mobile-navigation"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[10] h-16', // fx-z-sticky = 10
          'pb-safe border-t border-fx-border-default',
          'bg-fx-card/95 backdrop-blur-md shadow-fx-lg will-change-transform',
          'supports-[backdrop-filter]:backdrop-blur-md',
          'md:hidden', // Only show on mobile
          className
        )}
        {...navProps('Bottom Navigation')}
        suppressHydrationWarning
        style={{
          backgroundColor: 'var(--fx-card, rgba(255, 255, 255, 0.95))',
          borderColor: 'var(--fx-border-default, #e5e7eb)',
          borderTop: '1px solid var(--fx-border-default, #e5e7eb)',
          // Force visibility
          display: 'block !important',
          visibility: 'visible !important',
          opacity: '1 !important'
        }}
      >
        <div className="flex items-center justify-around px-4 py-3">
          {mainNavItems.map(item => (
            <motion.button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  router.push(item.path)
                } else if (onScreenChange) {
                  onScreenChange(item.id)
                }
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (item.path) {
                    router.push(item.path)
                  } else if (onScreenChange) {
                    onScreenChange(item.id)
                  }
                }
              }}
              {...navButtonProps(activeScreen === item.id, `Navigate to ${item.label}`)}
              data-nav-item={item.id}
              className={cn(
                'flex min-w-[60px] min-h-[44px] flex-col items-center justify-center rounded-lg p-3 transition-all duration-base ease-standard haptic-light touch-manipulation',
                focusProps.keyboardOnly,
                activeScreen === item.id
                  ? 'bg-fx-primary/15 text-fx-primary shadow-fx-sm'
                  : 'text-fx-text-secondary hover:bg-fx-bg-subtle hover:text-fx-text-primary active:bg-fx-primary/8'
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              style={{
                color: activeScreen === item.id
                  ? 'var(--fx-primary, #8B4513)'
                  : 'var(--fx-text-secondary, #6B7280)',
                minHeight: '44px',
                minWidth: '60px'
              }}
            >
              <item.icon className="mb-1 h-5 w-5" />
              <span className="max-w-[60px] truncate text-center text-xs font-medium">
                {item.label}
              </span>

              {/* Active indicator */}
              {activeScreen === item.id && (
                <motion.div
                  className="absolute -top-1 left-1/2 h-1 w-1 rounded-full bg-green-600"
                  layoutId="activeIndicator"
                  style={{ x: '-50%' }}
                />
              )}
            </motion.button>
          ))}

          {/* More button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="More options"
            role="tab"
            tabIndex={0}
            data-testid="mobile-menu-button"
            className={cn(
              'flex min-w-[60px] min-h-[44px] flex-col items-center justify-center rounded-lg p-3 transition-all duration-base ease-standard focus-visible:ring-2 focus-visible:ring-fx-focus-ring focus-visible:ring-offset-2 haptic-medium',
              'touch-manipulation',
              isExpanded
                ? 'bg-fx-accent/15 text-fx-accent shadow-fx-sm'
                : 'text-fx-text-secondary hover:bg-fx-bg-subtle hover:text-fx-text-primary active:bg-fx-accent/8'
            )}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
            <span className="mt-1 text-xs font-medium">Menu</span>
          </motion.button>
        </div>
      </nav>

      {/* Expanded Menu Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 supports-[backdrop-filter]:backdrop-blur-sm will-change-transform md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Expanded Menu */}
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-[11] rounded-xl border border-fx-border-default bg-fx-card shadow-fx-lg md:hidden"
              data-testid="mobile-menu"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-4">
                {/* Header with Logo */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogoOnly size="sm" className="h-8 w-8" />
                    <BrandTitle size="sm" />
                  </div>
                </div>

                {/* Mobile Create Tasting Button */}
                <button
                  data-testid="mobile-create-tasting"
                  onClick={() => {
                    router.push('/en/create')
                    setIsExpanded(false)
                  }}
                  className="btn-primary-beautiful mb-4 w-full"
                >
                  Create New Tasting
                </button>

                {/* All Navigation Items */}
                <div className="grid grid-cols-2 gap-2">
                  {[...mainNavItems, ...secondaryNavItems].map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        if (item.path) {
                          router.push(item.path)
                        } else if (onScreenChange) {
                          onScreenChange(item.id)
                        }
                        setIsExpanded(false)
                      }}
                      className={cn(
                        'flex items-center space-x-3 rounded-lg border p-4 text-left transition-all duration-base ease-standard focus-visible:ring-2 focus-visible:ring-fx-focus-ring focus-visible:ring-offset-2 haptic-light',
                        'min-h-[48px] touch-manipulation',
                        activeScreen === item.id
                          ? 'border-fx-primary bg-fx-primary/10 text-fx-primary'
                          : 'border-fx-border-default text-fx-text-secondary hover:border-fx-accent hover:bg-fx-bg-subtle hover:text-fx-text-primary active:bg-fx-accent/5'
                      )}
                      data-nav-item={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Quick Actions now integrated into main navigation */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

interface TouchFriendlySliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

export function TouchFriendlySlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className = '',
}: TouchFriendlySliderProps) {
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <span className="text-sm text-muted-foreground">{value}</span>
        </div>
      )}

      <div className="relative">
        {/* Track */}
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          {/* Progress */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-wine-green to-elegant-brown"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 h-6 w-6 cursor-pointer rounded-full border-2 border-wine-green bg-surface-card-solid shadow-lg',
            isDragging ? 'scale-125' : 'scale-100'
          )}
          style={{
            left: `${percentage}%`,
            x: '-50%',
            y: '-50%',
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onDrag={(event: any, info: any) => {
            const rect = (info.point.x - info.offset.x) / window.innerWidth
            const newValue = Math.round(min + (max - min) * Math.max(0, Math.min(1, rect)))
            onChange(newValue)
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 1.2 }}
        />
      </div>
    </div>
  )
}

interface ProgressiveDisclosureProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  level?: 'primary' | 'secondary' | 'tertiary'
  className?: string
}

export function ProgressiveDisclosure({
  title,
  children,
  defaultOpen = false,
  level = 'primary',
  className = '',
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const levelStyles = {
    primary: 'text-lg font-semibold text-foreground',
    secondary: 'text-base font-medium text-foreground',
    tertiary: 'text-sm font-medium text-muted-foreground',
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
        whileTap={{ scale: 0.98 }}
      >
        <span className={levelStyles[level]}>{title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-muted-foreground"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
