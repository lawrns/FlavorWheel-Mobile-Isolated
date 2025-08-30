'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, User, Settings, Sparkles, QrCode, Menu, X, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  // Integrated Quick Actions into main navigation - Updated per client feedback
  const mainNavItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/en/landing' },
    { id: 'create', icon: Plus, label: 'Create', path: '/en/create' },
    { id: 'review', icon: Star, label: 'Review', path: '/en/quick-tasting' },
    { id: 'flavor-wheels', icon: Sparkles, label: 'Wheels', path: '/en/flavor-wheels' },
  ]

  const secondaryNavItems = [
    { id: 'analytics', icon: Settings, label: 'Analytics', path: '/en/analytics' },
    { id: 'profile', icon: User, label: 'Profile', path: '/en/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/en/settings' },
  ]

  // Close expanded menu when screen changes
  useEffect(() => {
    setIsExpanded(false)
  }, [activeScreen])

  return (
    <>
      {/* Mobile Bottom Navigation - Always Visible */}
      <nav
        data-testid="mobile-navigation-root"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 h-16',
          'pb-safe border-t border-gray-200 bg-white/95 backdrop-blur-md shadow-lg will-change-transform',
          className
        )}
        aria-label="Mobile Navigation"
        role="navigation"
        suppressHydrationWarning
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
              aria-label={`Navigate to ${item.label}`}
              aria-current={activeScreen === item.id ? 'page' : undefined}
              role="tab"
              tabIndex={0}
              className={cn(
                'flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
                activeScreen === item.id
                  ? 'bg-green-100 text-green-600'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-gray-900'
              )}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
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
            className={cn(
              'flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
              isExpanded
                ? 'bg-amber-50 text-gray-900'
                : 'text-gray-600 hover:bg-amber-50 hover:text-gray-900'
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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm will-change-transform md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
            />

            {/* Expanded Menu */}
            <motion.div
              className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-gray-200 bg-white shadow-lg md:hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-4">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">Full Navigation</h3>

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
                        'flex items-center space-x-2 rounded-lg border p-4 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
                        activeScreen === item.id
                          ? 'border-green-600 bg-green-100 text-green-600'
                          : 'border-gray-200 text-gray-600 hover:border-green-600 hover:bg-amber-50 hover:text-gray-900'
                      )}
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
