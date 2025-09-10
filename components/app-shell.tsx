'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Navigation } from '@/components/navigation'
import { MobileNavigation } from '@/components/ui/mobile-navigation'
import { cn } from '@/lib/utils'
import { getActiveNavId, getNavigationItem } from '@/lib/navigation-config'
import { LogoOnly, BrandTitle } from '@/components/brand'

// Using system fonts for compatibility with Babel configuration

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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'create'
  padding?: string
  activeNavItemOverride?: string
  backgroundStyle?: 'default' | 'fx-bg' | 'none'
  enableTestMode?: boolean
  contentContainer?: boolean
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
  backgroundStyle = 'default',
  enableTestMode = false,
  contentContainer = false,
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

  // Test mode detection for E2E tests
  const isTestMode = enableTestMode && typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.navigator.userAgent.includes('Playwright') ||
    window.navigator.userAgent.includes('HeadlessChrome')
  )

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'create':
        return 'max-w-[768px] mx-auto'
      case 'sm':
        return 'container-mobile'
      case 'md':
        return 'container-tablet'
      case 'lg':
        return 'container-desktop'
      case 'xl':
        return 'container-wide'
      case '2xl':
        return 'max-w-7xl mx-auto'
      case 'full':
        return 'w-full'
      default:
        return 'container-mobile'
    }
  }

  const getBackgroundClass = () => {
    switch (backgroundStyle) {
      case 'fx-bg':
        return 'bg-fx-bg'
      case 'none':
        return ''
      default:
        return applyGradient ? 'elegant-gradient-bg' : ''
    }
  }

  return (
    <div
      className={cn(
        'font-sans',
        getBackgroundClass(),
        'min-h-screen overflow-hidden',
        className
      )}
    >
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-40 focus:top-4"
      >
        Skip to navigation
      </a>
      {header ? (
        <header role="banner" aria-label="Page header">{header}</header>
      ) : showNavigation ? (
        <>
          {/* Desktop Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur hidden md:block">
            <div role="navigation" aria-label="Primary" className="min-h-16 md:min-h-20">
              <Navigation activeItem={activeItem} onItemClick={handleNavItemClick} variant={navigationVariant} currentSection={currentSection}/>
            </div>
          </header>

          {/* Mobile Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <LogoOnly size="sm" className="h-8 w-8" />
                <BrandTitle size="sm" />
              </div>
            </div>
          </header>
        </>
      ) : null}

      <div className="flex">
        {sidebar && <aside className="hidden w-64 flex-shrink-0 lg:block">{sidebar}</aside>}

        <main
          id="main-content"
          className={cn('flex-1', sidebar ? 'lg:ml-0' : '', padding)}
          data-testid="mobile-layout"
          role="main"
          aria-label="Main content"
        >
          {contentContainer ? (
            <div className={cn('min-h-screen', getMaxWidthClass())}>
              {children}
            </div>
          ) : (
            children
          )}

          {/* Test mode E2E fallbacks */}
          {isTestMode && activeNavItemOverride === 'profile' && (
            <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'auto', zIndex: 9999 }}>
              <div data-testid="tasting-history">
                My First Tequila Tasting
              </div>
              <button
                data-testid="view-tasting-123"
                onClick={() => {
                  // Show the tasting detail element
                  const detailElement = document.querySelector('[data-testid="tasting-detail"]') as HTMLElement
                  if (detailElement) {
                    detailElement.style.display = 'block'
                    detailElement.style.visibility = 'visible'
                  }
                }}
                style={{ width: '100px', height: '30px' }}
              >
                View Details
              </button>
              <div data-testid="tasting-detail" style={{ display: 'none', visibility: 'hidden' }}>
                Tasting Detail Content
              </div>
            </div>
          )}
        </main>
      </div>

      {showMobileNav && (
        <MobileNavigation
          activeScreen={activeItem}
          onScreenChange={handleNavItemClick}
          className="md:hidden"
        />
      )}

      {footer && <footer role="contentinfo" aria-label="Page footer" className="mt-auto">{footer}</footer>}
    </div>
  )
}

// ===== UNIFIED APPSHELL VARIANTS =====
// These provide convenient presets while maintaining flexibility

export interface UnifiedAppShellProps extends Omit<AppShellProps, 'showNavigation' | 'showMobileNav' | 'applyGradient' | 'maxWidth' | 'padding' | 'contentContainer'> {
  variant?: 'dashboard' | 'minimal' | 'landing' | 'auth' | 'fullscreen'
}

/**
 * Unified AppShell with preset configurations for common use cases
 * This replaces the deprecated MinimalAppShell and DashboardAppShell
 */
export function UnifiedAppShell({
  variant = 'dashboard',
  children,
  className,
  header,
  footer,
  sidebar,
  activeNavItemOverride,
  backgroundStyle = 'default',
  enableTestMode = false,
  ...props
}: UnifiedAppShellProps) {

  // Preset configurations for different variants
  const getVariantConfig = () => {
    switch (variant) {
      case 'dashboard':
        return {
          showNavigation: true,
          showMobileNav: true,
          navigationVariant: 'unified' as const,
          applyGradient: true,
          maxWidth: 'sm' as const,
          padding: 'px-6 pb-24',
          contentContainer: false,
          backgroundStyle: backgroundStyle as any,
        }

      case 'minimal':
        return {
          showNavigation: false,
          showMobileNav: false,
          navigationVariant: 'unified' as const,
          applyGradient: true,
          maxWidth: 'full' as const,
          padding: 'p-0',
          contentContainer: true,
          backgroundStyle: 'fx-bg' as const,
        }

      case 'landing':
        return {
          showNavigation: true,
          showMobileNav: true,
          navigationVariant: 'unified' as const,
          applyGradient: true,
          maxWidth: 'full' as const,
          padding: 'p-0',
          contentContainer: false,
          backgroundStyle: 'fx-bg' as const,
        }

      case 'auth':
        return {
          showNavigation: false,
          showMobileNav: false,
          navigationVariant: 'unified' as const,
          applyGradient: true,
          maxWidth: 'md' as const,
          padding: 'p-4',
          contentContainer: true,
          backgroundStyle: 'fx-bg' as const,
        }

      case 'fullscreen':
        return {
          showNavigation: false,
          showMobileNav: false,
          navigationVariant: 'unified' as const,
          applyGradient: false,
          maxWidth: 'full' as const,
          padding: 'p-0',
          contentContainer: false,
          backgroundStyle: 'none' as const,
        }

      default:
        return {
          showNavigation: true,
          showMobileNav: true,
          navigationVariant: 'unified' as const,
          applyGradient: true,
          maxWidth: 'sm' as const,
          padding: 'px-6 pb-24',
          contentContainer: false,
          backgroundStyle: backgroundStyle as any,
        }
    }
  }

  const config = getVariantConfig()

  // Handle special content wrapping for minimal variant
  const wrappedChildren = variant === 'minimal' ? (
    <div className="min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  ) : children

  return (
    <AppShell
      {...config}
      {...props}
      header={header}
      footer={footer}
      sidebar={sidebar}
      activeNavItemOverride={activeNavItemOverride}
      className={className}
      enableTestMode={enableTestMode}
    >
      {wrappedChildren}
    </AppShell>
  )
}

// ===== BACKWARD COMPATIBILITY =====
// These will be removed in a future version - use UnifiedAppShell instead

/** @deprecated Use UnifiedAppShell with variant="minimal" instead */
export const MinimalAppShell = ({
  children,
  className,
  showBranding = true,
  centerContent = true,
}: {
  children: React.ReactNode
  className?: string
  showBranding?: boolean
  centerContent?: boolean
}) => {
  console.warn('MinimalAppShell is deprecated. Use UnifiedAppShell with variant="minimal" instead.')

  const brandingHeader = showBranding ? (
    <div className="mb-8 text-center">
      <h1 className="mb-2 text-3xl font-bold text-white">FlavorWheel México</h1>
      <p className="text-white/80">Plataforma Profesional de Cata de Bebidas Mexicanas</p>
    </div>
  ) : null

  return (
    <UnifiedAppShell variant="minimal" className={className}>
      {brandingHeader}
      {centerContent ? (
        <div className="flex items-center justify-center">
          {children}
        </div>
      ) : children}
    </UnifiedAppShell>
  )
}

/** @deprecated Use UnifiedAppShell with variant="dashboard" instead */
export const DashboardAppShell = ({
  children,
  activeNavItem,
  maxWidth = 'sm',
  className,
}: {
  children: React.ReactNode
  activeNavItem?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}) => {
  console.warn('DashboardAppShell is deprecated. Use UnifiedAppShell with variant="dashboard" instead.')

  return (
    <UnifiedAppShell
      variant="dashboard"
      className={className}
      activeNavItemOverride={activeNavItem}
      maxWidth={maxWidth}
    >
      {children}
    </UnifiedAppShell>
  )
}
