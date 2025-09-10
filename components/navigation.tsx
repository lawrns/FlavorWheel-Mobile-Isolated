'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { NAVIGATION_ITEMS, getNavigationItem } from '@/lib/navigation-config'
import { useAuth } from '@/components/auth-provider'
import { LogoOnly, BrandTitle } from '@/components/brand'

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
        className={cn(
          'fixed bottom-0 left-0 right-0 z-sticky border-t-2',
          'border-border bg-background/95 shadow-lg backdrop-blur-md',
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
                    'relative flex min-h-[48px] min-w-[48px] flex-1 flex-col items-center justify-center rounded-lg px-3 py-3 transition-all duration-normal ease-standard focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    isActive && 'bg-primary text-primary-foreground',
                    !isActive && 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    )
  }

  // Desktop Navigation (Top Bar) - Use unified variant for consistency
  if (variant === 'desktop') {
    variant = 'unified'
  }

  // Unified Navigation (Desktop Only)
  return (
    <>
      {/* Desktop Navigation */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 hidden md:block">
        <motion.nav
          id="navigation"
          data-testid="desktop-navigation-root"
          className={cn('pointer-events-auto mx-auto w-full max-w-[1100px] px-4', className)}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto rounded-full border border-border bg-background/90 px-4 py-2 shadow-md backdrop-blur-md">
            {/* Brand Logo */}
            <div className="flex items-center pr-4 mr-4 border-r border-border">
              <LogoOnly size="md" className="h-20 w-20 md:h-14 md:w-14 lg:h-16 lg:w-16" />
            </div>

            {getVisibleItems().map((item, index) => {
              const Icon = item.icon
              const isActive = currentSection === item.id

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => handleNavigation(item.id)}
                    disabled={item.disabled}
                    aria-label={`Navegar a ${item.label}${item.disabled ? ' (no disponible)' : ''}${item.premium ? ' (premium)' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    data-testid={`nav-${item.id}-link`}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-full px-4 leading-none transition-all duration-normal ease-standard',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted hover:text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-50',
                      item.premium && 'bg-gradient-to-r from-accent to-accent/80 text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="relative top-[1px] ml-1 h-5 px-2 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.nav>
      </div>
    </>
  )
}
