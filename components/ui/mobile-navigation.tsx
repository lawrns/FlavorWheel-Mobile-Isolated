'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy load motion components for better performance
const MotionButton = motion.button
const MotionDiv = motion.div
import { Home, Plus, User, Settings, Sparkles, QrCode, Menu, X, Star, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MOBILE_NAV_ITEMS } from '@/lib/navigation-config'
import { LogoOnly, BrandTitle } from '@/components/brand'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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

  // Handle keyboard navigation for expanded menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isExpanded) return

      if (event.key === 'Escape') {
        setIsExpanded(false)
        event.preventDefault()
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown)
      // Focus management for accessibility
      const menuElement = document.querySelector('[data-testid="mobile-menu"]') as HTMLElement
      if (menuElement) {
        const firstFocusableElement = menuElement.querySelector('button') as HTMLElement
        if (firstFocusableElement) {
          firstFocusableElement.focus()
        }
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isExpanded])

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
          'fixed bottom-0 left-0 right-0 z-[50] h-nav-height',
          'pb-nav-safe-area border-t border-nav-border',
          'bg-nav-bg/98 backdrop-blur-xl shadow-card will-change-transform',
          'supports-[backdrop-filter]:backdrop-blur-xl',
          'md:hidden',
          className
        )}
        {...navProps('Bottom Navigation')}
        suppressHydrationWarning
        style={{
          backgroundColor: 'var(--fw-color-nav-bg, rgba(255, 255, 255, 0.95))',
          borderColor: 'var(--fw-color-nav-border, #e5e7eb)',
          borderTop: '1px solid var(--fw-color-nav-border, #e5e7eb)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        }}
      >
        <div className="flex items-center justify-around px-4 py-3">
          {mainNavItems.map(item => (
            <MotionButton
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
              {...navButtonProps(activeScreen === item.id, `Navigate to ${item.label}${activeScreen === item.id ? ' (current page)' : ''}`)}
              data-nav-item={item.id}
              className={cn(
                'group relative flex min-w-[64px] min-h-[48px] flex-col items-center justify-center rounded-xl p-nav-padding',
                'transition-all duration-fast ease-standard haptic-light touch-manipulation',
                'focus-visible:ring-2 focus-visible:ring-offset-2',
                activeScreen === item.id
                  ? 'bg-nav-icon-active/20 text-nav-icon-active shadow-card scale-105'
                  : 'text-nav-text-inactive hover:bg-nav-bg/60 hover:text-nav-text-active hover:scale-105 active:bg-nav-icon-active/10',
                'focus-visible:border-input-focus-border focus-visible:ring-input-focus-border'
              )}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.08 }}
              style={{
                minHeight: '48px',
                minWidth: '64px'
              }}
            >
              <item.icon className="mb-1 h-6 w-6" />
              <span className={cn(
                'max-w-[60px] truncate text-center',
                'font-[var(--fw-typography-nav-label-family)] font-[var(--fw-typography-nav-label-weight)] text-[var(--fw-typography-nav-label-size)] leading-[var(--fw-typography-nav-label-line-height)]',
                activeScreen === item.id ? 'text-nav-text-active' : 'text-nav-text-inactive'
              )}>
                {item.label}
              </span>

              {/* Active indicator */}
              {activeScreen === item.id && (
                <MotionDiv
                  className="absolute -top-1 left-1/2 h-1 w-1 rounded-full bg-nav-icon-active"
                  layoutId="activeIndicator"
                  style={{ x: '-50%' }}
                />
              )}
            </MotionButton>
          ))}

          {/* More button with enhanced accessibility */}
          <MotionButton
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsExpanded(!isExpanded)
              }
            }}
            aria-label={`${isExpanded ? 'Close' : 'Open'} navigation menu`}
            aria-expanded={isExpanded}
            aria-haspopup="true"
            aria-controls="mobile-menu"
            tabIndex={0}
            data-testid="mobile-menu-button"
            className={cn(
              'group flex min-w-[64px] min-h-[48px] flex-col items-center justify-center rounded-xl p-3',
              'transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-fx-focus-ring focus-visible:ring-offset-2',
              'haptic-medium touch-manipulation',
              isExpanded
                ? 'bg-fx-accent/20 text-fx-accent shadow-fx-md scale-105'
                : 'text-fx-text-secondary hover:bg-fx-bg-subtle/60 hover:text-fx-text-primary hover:scale-105 active:bg-fx-accent/10'
            )}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
          >
            <MotionDiv animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </MotionDiv>
            <span className="mt-1 text-fx-text-secondary text-xs font-medium">Menu</span>
          </MotionButton>
        </div>
      </nav>

      {/* Expanded Menu Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[45] bg-black/30 supports-[backdrop-filter]:backdrop-blur-sm will-change-transform md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Enhanced Expanded Menu */}
            <motion.div
              id="mobile-menu"
              role="menu"
              aria-label="Mobile navigation menu"
              className="fixed bottom-20 left-4 right-4 z-[50] rounded-2xl border border-fx-border-default bg-fx-card/98 shadow-fx-xl backdrop-blur-xl md:hidden"
              data-testid="mobile-menu"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className="p-6 space-y-6">
                {/* Header with Logo and Brand */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LogoOnly size="md" className="h-12 w-12" />
                    <div>
                      <h3 className="text-lg font-bold text-fx-text-primary">FlavorWheel México</h3>
                      <p className="text-xs text-fx-text-secondary">Authentic Mexican Tasting</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-lg hover:bg-fx-bg-subtle transition-colors duration-200"
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-fx-text-secondary" />
                  </motion.button>
                </div>

                {/* Primary Action Button */}
                <motion.button
                  data-testid="mobile-create-tasting"
                  onClick={() => {
                    router.push('/en/create')
                    setIsExpanded(false)
                  }}
                  className={cn(
                    'w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200',
                    'bg-gradient-to-r from-fx-primary to-fx-accent text-fx-text-inverse',
                    'shadow-fx-md hover:shadow-fx-lg hover:scale-[1.02] active:scale-[0.98]'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  Create New Tasting
                </motion.button>

                {/* Navigation Items Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[...mainNavItems, ...secondaryNavItems].map((item, index) => (
                    <motion.button
                      key={item.id}
                      role="menuitem"
                      onClick={() => {
                        if (item.path) {
                          router.push(item.path)
                        } else if (onScreenChange) {
                          onScreenChange(item.id)
                        }
                        setIsExpanded(false)
                      }}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl border p-4 text-left',
                        'transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-fx-focus-ring focus-visible:ring-offset-2',
                        'haptic-light touch-manipulation min-h-[56px]',
                        activeScreen === item.id
                          ? 'border-fx-primary bg-fx-primary/10 text-fx-primary shadow-fx-sm'
                          : 'border-fx-border-default bg-fx-bg-subtle/30 text-fx-text-secondary hover:border-fx-accent hover:bg-fx-bg-subtle hover:text-fx-text-primary'
                      )}
                      aria-label={`Navigate to ${item.label}${activeScreen === item.id ? ' (current page)' : ''}`}
                      aria-current={activeScreen === item.id ? 'page' : undefined}
                      data-nav-item={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={cn(
                        'flex-shrink-0 p-2 rounded-lg transition-colors duration-200',
                        activeScreen === item.id
                          ? 'bg-fx-primary/20'
                          : 'bg-fx-bg-subtle group-hover:bg-fx-accent/10'
                      )}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium leading-tight">{item.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Footer with Theme Toggle */}
                <div className="pt-4 border-t border-fx-border-default">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-fx-text-secondary">Theme</span>
                    <ThemeToggle variant="switch" />
                  </div>
                </div>
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
          <label className="text-sm font-medium text-fx-text-primary">{label}</label>
          <span className="text-sm text-fx-text-secondary">{value}</span>
        </div>
      )}

      <div className="relative">
        {/* Track */}
        <div className="relative h-3 overflow-hidden rounded-full bg-fx-bg-muted">
          {/* Progress */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fx-primary to-fx-accent"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-1/2 h-6 w-6 cursor-pointer rounded-full border-2 border-fx-primary bg-fx-card shadow-fx-lg',
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
    primary: 'text-lg font-semibold text-fx-text-primary',
    secondary: 'text-base font-medium text-fx-text-primary',
    tertiary: 'text-sm font-medium text-fx-text-secondary',
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-fx-border-default', className)}>
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
