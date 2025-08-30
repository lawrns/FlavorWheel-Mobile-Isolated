'use client'

import React from 'react'
import { Inter } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/navigation'
import { MobileNavigation } from '@/components/ui/mobile-navigation'
import { cn } from '@/lib/utils'
import { getActiveNavId, getNavigationItem } from '@/lib/navigation-config'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

interface BaseShellProps {
  children: React.ReactNode
  className?: string
}

interface AppShellProps extends BaseShellProps {
  header?: React.ReactNode
  footer?: React.ReactNode
  sidebar?: React.ReactNode
  showNavigation?: boolean
  showMobileNav?: boolean
  navigationVariant?: 'mobile' | 'desktop' | 'unified'
  currentSection?: string
  applyGradient?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: string
  activeNavItemOverride?: string
}

export function AppShell({
  children,
  header,
  footer,
  sidebar,
  showNavigation = true,
  showMobileNav = true,
  navigationVariant = 'unified',
  currentSection,
  className,
  applyGradient = true,
  maxWidth = 'sm',
  padding = 'px-6 pb-24',
  activeNavItemOverride,
}: AppShellProps) {
  // NOTE: SSR-stable wrapper prevents hydration mismatch when Navigation is dynamic
  const router = useRouter()
  const pathname = usePathname() || '/'

  const activeItemFromRoute = getActiveNavId(pathname)
  const activeItem = activeNavItemOverride || activeItemFromRoute

  const handleNavItemClick = (itemId: string) => {
    const navItem = getNavigationItem(itemId)
    if (navItem?.href) {
      const locale = pathname.split('/')[1] || 'en'
      router.push(`/${locale}${navItem.href}`)
    }
  }

  const getMaxWidthClass = () => {
    // Use mobile-optimized container for better mobile responsiveness
    return 'mobile-container'
  } // unified to avoid SSR/CSR drift

  return (
    <div
      className={cn(
        inter.className,
        applyGradient && 'elegant-gradient-bg',
        'min-h-screen overflow-hidden',
        className
      )}
    >
      {header ? (
        <header>{header}</header>
      ) : showNavigation ? (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur hidden md:block"><div role="navigation" aria-label="Primary" className="min-h-16 md:min-h-20"><Navigation activeItem={activeItem} onItemClick={handleNavItemClick} variant={navigationVariant} currentSection={currentSection}/></div></header>
      ) : null}

      <div className="flex">
        {sidebar && <aside className="hidden w-64 flex-shrink-0 lg:block">{sidebar}</aside>}

        <main
          className={cn('flex-1', getMaxWidthClass(), sidebar ? 'lg:ml-0' : '', padding)}
        >
          {children}
        </main>
      </div>

      {showMobileNav && (
        <MobileNavigation
          activeScreen={activeItem}
          onScreenChange={handleNavItemClick}
          className="md:hidden"
        />
      )}

      {footer && <footer className="mt-auto">{footer}</footer>}
    </div>
  )
}

export function MinimalAppShell({
  children,
  className,
  showBranding = true,
  centerContent = true,
}: {
  children: React.ReactNode
  className?: string
  showBranding?: boolean
  centerContent?: boolean
}) {
  return (
    <AppShell
      showNavigation={false}
      showMobileNav={false}
      applyGradient
      maxWidth="full"
      padding="p-0"
      className={className}
    >
      <div
        className={cn('min-h-screen', centerContent && 'flex items-center justify-center', 'p-4')}
      >
        {showBranding && (
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-white">FlavorWheel México</h1>
            <p className="text-white/80">Plataforma Profesional de Cata de Bebidas Mexicanas</p>
          </div>
        )}
        {children}
      </div>
    </AppShell>
  )
}

export function DashboardAppShell({
  children,
  activeNavItem,
  maxWidth = 'sm',
  className,
}: {
  children: React.ReactNode
  activeNavItem?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}) {
  return (
    <AppShell
      showNavigation
      showMobileNav
      navigationVariant="unified"
      applyGradient
      maxWidth={maxWidth}
      className={className}
      activeNavItemOverride={activeNavItem}
    >
      {children}
    </AppShell>
  )
}
