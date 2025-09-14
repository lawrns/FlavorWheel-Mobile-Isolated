'use client'

import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'

// Lazy load motion components for better performance
const MotionDiv = motion.div
const MotionButton = motion.button
const MotionNav = motion.nav
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { NAVIGATION_ITEMS, getNavigationItem } from '@/lib/navigation-config'
import { useAuth } from '@/components/auth-provider'
import { LogoOnly, BrandTitle } from '@/components/brand'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Navigation types
export interface NavigationProps {
  activeItem?: string
  onItemClick?: (itemId: string) => void
  variant?: 'unified' | 'mobile' | 'desktop'
  currentSection?: string
  className?: string
}

// Full navigation component with mobile drawer and desktop bar
export function Navigation({
  activeItem,
  onItemClick,
  variant = 'unified',
  currentSection,
  className,
}: NavigationProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (itemId: string) => {
    const navItem = getNavigationItem(itemId)
    if (navItem?.href) {
      // Extract locale from current pathname
      const locale = pathname.split('/')[1] || 'en'
      // Navigate with locale prefix
      router.push(`/${locale}${navItem.href}`)
    }
    onItemClick?.(itemId)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  // Get visible navigation items (only working pages)
  const getVisibleItems = () => {
    return NAVIGATION_ITEMS // All items are now working pages
  }

  // Mobile Navigation (Bottom Tab Bar)
  if (variant === 'mobile') {
    const mobileItems = getVisibleItems() // Show all 4 core items

    return (
      <nav
        data-testid="mobile-navigation"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-sticky border-t-2',
          'border-nav-border bg-nav-bg/95 shadow-card backdrop-blur-md',
          'h-nav-height pb-nav-safe-area',
          className
        )}
      >
        <div className="flex items-center justify-around px-nav-padding py-1">
          {mobileItems.map(item => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <button
                key={item.id}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center rounded-lg px-nav-padding py-nav-padding transition-colors duration-fast ease-standard focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]',
                  isActive && 'bg-nav-icon-active text-nav-text-active',
                  !isActive && 'text-nav-text-inactive hover:bg-nav-bg hover:text-nav-text-active',
                  item.disabled && 'cursor-not-allowed opacity-50',
                  'focus-visible:border-input-focus-border focus-visible:ring-input-focus-border'
                )}
                onClick={() => handleNavigation(item.id)}
                disabled={item.disabled}
              >
                <div className="relative">
                  <Icon className="h-nav-icon-size w-nav-icon-size" />
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-nav-text-active text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  'font-[var(--fw-typography-nav-label-family)] font-[var(--fw-typography-nav-label-weight)] text-[var(--fw-typography-nav-label-size)] leading-[var(--fw-typography-nav-label-line-height)]',
                  isActive ? 'text-nav-text-active' : 'text-nav-text-inactive'
                )}>
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* Theme Toggle for Mobile */}
          <div className="relative flex flex-col items-center justify-center rounded-lg px-nav-padding py-nav-padding min-h-[44px] min-w-[44px]">
            <ThemeToggle variant="minimal" className="p-0" />
            <span className="font-[var(--fw-typography-nav-label-family)] font-[var(--fw-typography-nav-label-weight)] text-[var(--fw-typography-nav-label-size)] leading-[var(--fw-typography-nav-label-line-height)] text-nav-text-inactive">
              Theme
            </span>
          </div>
        </div>
      </nav>
    )
  }

  // Desktop Navigation (Top Bar) - Use unified variant for consistency
  if (variant === 'desktop') {
    variant = 'unified';
  }

  // Unified Navigation (Desktop Only)
  return (
    <>
      {/* Desktop Navigation */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 hidden md:block">
        <MotionNav
          id="navigation"
          data-testid="desktop-navigation"
          className={cn(
            'pointer-events-auto mx-auto w-full max-w-[1100px] px-4',
            'animate-in slide-in-from-top-4 fade-in duration-700 ease-out',
            className
          )}
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="flex items-center justify-between gap-6 overflow-x-auto rounded-full border border-fx-border-default bg-fx-card/95 px-6 py-3 shadow-fx-lg backdrop-blur-md">
            {/* Brand Logo Section - Enhanced for Mexican Culture */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <LogoOnly size="lg" className="h-14 w-14" animated />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold text-fx-text-primary font-heading">FlavorWheel México</span>
                <span className="text-xs text-fx-text-secondary">Authentic Mexican Tasting</span>
              </div>
              <div className="h-8 w-px bg-fx-border-default" />
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1">

              {getVisibleItems().map((item, index) => {
                const Icon = item.icon
                const isActive = currentSection === item.id

                return (
                  <MotionButton
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    disabled={item.disabled}
                    aria-label={`Navigate to ${item.label}${item.disabled ? ' (currently unavailable)' : ''}${item.premium ? ' (premium feature)' : ''}${isActive ? ' (current page)' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`nav-${item.id}-link`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                    className={cn(
                      'group relative inline-flex h-11 items-center gap-3 rounded-full px-5 leading-none transition-all duration-200 ease-out',
                      'focus-visible:ring-2 focus-visible:ring-fx-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fx-bg',
                      'animate-in fade-in slide-in-from-top-2 duration-300',
                      isActive
                        ? 'bg-fx-primary text-fx-text-inverse shadow-fx-md transform scale-[1.02]'
                        : 'text-fx-text-primary hover:bg-fx-bg-subtle/80 hover:text-fx-text-primary hover:shadow-fx-sm hover:scale-[1.02]',
                      item.disabled && 'cursor-not-allowed opacity-50',
                      item.premium && 'bg-gradient-to-r from-fx-accent to-fx-accent/80 text-fx-text-inverse shadow-fx-md'
                    )}
                  >
                    {/* Active indicator dot */}
                    {isActive && (
                      <MotionDiv
                        className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-fx-text-inverse"
                        layoutId="activeIndicator"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <Icon className={cn(
                      'h-5 w-5 transition-transform duration-200',
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    )} />
                    <span className="font-medium text-sm tracking-wide">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          'relative ml-1 h-5 px-2 text-xs font-medium',
                          isActive ? 'bg-fx-text-inverse/20 text-fx-text-inverse' : 'bg-fx-bg-subtle text-fx-text-primary'
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </MotionButton>
                )
              })}
            </div>

            {/* Theme Toggle Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-8 w-px bg-fx-border-default" />
              <ThemeToggle variant="minimal" />
            </div>
          </div>
        </MotionNav>
      </div>
    </>
  )
}
