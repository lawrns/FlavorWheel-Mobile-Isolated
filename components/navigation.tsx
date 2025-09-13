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
import { ThemeToggle } from '@/components/ui/loading-states'

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
          'border-fx-border-default bg-fx-card/95 shadow-fx-lg backdrop-blur-md',
          className
        )}
      >
        <div className="pb-safe">
          <div className="flex items-center justify-around px-2 py-1">
            {mobileItems.map(item => {
              const Icon = item.icon
              const isActive = activeItem === item.id

              return (
                <button
                  key={item.id}
                  className={cn(
                    'relative flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center rounded-lg px-3 py-3 transition-colors duration-normal ease-standard focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    isActive && 'bg-fx-primary text-fx-text-inverse',
                    !isActive && 'text-fx-text-secondary hover:bg-fx-bg-subtle hover:text-fx-text-primary',
                    item.disabled && 'cursor-not-allowed opacity-50'
                  )}
                  onClick={() => handleNavigation(item.id)}
                  disabled={item.disabled}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-fx-text-inverse text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-fx-text-primary text-xs font-medium">{item.label}</span>
                </button>
              )
            })}

            {/* Theme Toggle for Mobile */}
            <div className="relative flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-lg px-3 py-3">
              <ThemeToggle variant="minimal" className="p-0" />
              <span className="text-fx-text-secondary text-xs font-medium">Theme</span>
            </div>
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
            {/* Brand Logo Section */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <LogoOnly size="md" className="h-12 w-12" />
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
