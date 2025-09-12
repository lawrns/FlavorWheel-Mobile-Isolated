'use client'

import React from 'react'
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { LoadingOverlay } from './loading-overlay'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-fx-accent`} />
      {text && <p className="text-sm text-fx-text-secondary">{text}</p>}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  subtitle?: string
  className?: string
}

export function LoadingCard({ title = 'Loading...', subtitle, className = '' }: LoadingCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-fx-text-primary">{title}</h3>
            {subtitle && <p className="text-sm text-fx-text-secondary mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

// Alias for backwards compatibility
export const SkeletonLoader = LoadingSkeleton

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`h-4 bg-fx-bg-subtle rounded ${
            i === lines - 1 ? 'w-3/4' : i === 0 ? 'w-full' : 'w-5/6'
          }`} />
        </div>
      ))}
    </div>
  )
}

interface RetryButtonProps {
  onRetry: () => void
  loading?: boolean
  text?: string
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RetryButton({
  onRetry,
  loading = false,
  text = 'Try Again',
  variant = 'primary',
  size = 'md',
  className = ''
}: RetryButtonProps) {
  return (
    <Button
      onClick={onRetry}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Retrying...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          {text}
        </>
      )}
    </Button>
  )
}

interface LoadingStateProps {
  loading: boolean
  error: any
  onRetry?: () => void
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function LoadingState({
  loading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  children,
  className = ''
}: LoadingStateProps) {
  if (loading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingCard />
      </div>
    )
  }

  if (error) {
    return errorComponent || (
        <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-fx-ai-confidence-low mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-fx-text-primary mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-fx-text-secondary mb-4">
              We encountered an error while loading this content.
            </p>
          {onRetry && (
            <RetryButton onRetry={onRetry} />
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Skeleton components for different content types
export function ProfileSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-fx-bg-subtle rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-fx-bg-subtle rounded w-3/4"></div>
            <div className="h-3 bg-fx-bg-subtle rounded w-1/2"></div>
          </div>
        </div>
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-fx-bg-subtle rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-fx-bg-subtle rounded w-3/4"></div>
            <div className="h-3 bg-fx-bg-subtle rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-fx-bg-subtle rounded"></div>
          <div className="h-4 bg-fx-bg-subtle rounded w-5/6"></div>
        </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ListSkeleton({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Progressive loading component
interface ProgressiveLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
}

export function ProgressiveLoader({
  isLoading,
  children,
  skeleton,
  className = ''
}: ProgressiveLoaderProps) {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10">
          {skeleton}
        </div>
      )}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </div>
  )
}

// Network-aware loading component
interface NetworkAwareLoaderProps {
  children: React.ReactNode
  offlineComponent?: React.ReactNode
  className?: string
}

export function NetworkAwareLoader({
  children,
  offlineComponent,
  className = ''
}: NetworkAwareLoaderProps) {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return offlineComponent || (
      <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
        <div className="text-center">
        <div className="w-16 h-16 bg-fx-ai-confidence-med/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-fx-ai-confidence-med" />
        </div>
        <h3 className="text-lg font-semibold text-fx-text-primary mb-2">
          You&apos;re offline
        </h3>
        <p className="text-sm text-fx-text-secondary">
          Some features may not be available. Please check your connection.
        </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Enhanced loading state manager for consistent UX
export class LoadingStateManager {
  private loadingStates = new Map<string, boolean>()

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading)
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) ?? false
  }

  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(loading => loading)
  }

  getLoadingKeys(): string[] {
    return Array.from(this.loadingStates.entries())
      .filter(([, loading]) => loading)
      .map(([key]) => key)
  }

  clearAll() {
    this.loadingStates.clear()
  }
}

// Global loading state manager instance
export const loadingStateManager = new LoadingStateManager()

// Hook for managing loading states
export function useLoadingState(key?: string) {
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (key) {
      setIsLoading(loadingStateManager.isLoading(key))
    }
  }, [key])

  const setLoading = React.useCallback((loading: boolean, loadingKey?: string) => {
    const targetKey = loadingKey || key
    if (targetKey) {
      loadingStateManager.setLoading(targetKey, loading)
      setIsLoading(loading)
    }
  }, [key])

  return { isLoading, setLoading }
}

// Example usage patterns for consistent loading states
export function LoadingStateExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-fx-text-primary">Loading State Examples</h2>

      {/* 1. Inline Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Inline Loading</h3>
        <div className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <span className="text-fx-text-secondary">Loading...</span>
        </div>
      </div>

      {/* 2. Card Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Card Loading</h3>
        <LoadingCard title="Loading your data..." />
      </div>

      {/* 3. Skeleton Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Skeleton Loading</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      {/* 4. Progress Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Progress Loading</h3>
        <div className="p-4 bg-fx-bg-primary border border-fx-border-subtle rounded-lg">
          <div className="w-full bg-fx-bg-subtle rounded-full h-2 mb-4">
            <div className="bg-fx-accent h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-fx-text-secondary">Processing your request... 75%</p>
        </div>
      </div>

      {/* 5. Status Indicators */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Status Indicators</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-fx-text-secondary">Loading</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-fx-flavor-vegetal"></div>
            <span className="text-sm text-fx-text-secondary">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-fx-ai-confidence-low"></div>
            <span className="text-sm text-fx-text-secondary">Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-fx-ai-confidence-med"></div>
            <span className="text-sm text-fx-text-secondary">Warning</span>
          </div>
        </div>
      </div>

      {/* 6. Network-Aware Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Network-Aware Loading</h3>
        <NetworkAwareLoader>
          <div className="p-4 bg-fx-bg-primary border border-fx-border-subtle rounded-lg">
            <p className="text-fx-text-primary">Content loaded successfully!</p>
          </div>
        </NetworkAwareLoader>
      </div>

      {/* 7. Progressive Loading */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-fx-text-primary">Progressive Loading</h3>
        <ProgressiveLoader
          isLoading={false}
          skeleton={<CardSkeleton />}
        >
          <div className="p-4 bg-fx-bg-primary border border-fx-border-subtle rounded-lg">
            <p className="text-fx-text-primary">Progressive content loaded!</p>
          </div>
        </ProgressiveLoader>
      </div>
    </div>
  )
}

// ===== COLOR SYSTEM AUDIT UTILITIES =====

// Color system audit tool to identify hardcoded colors
export function auditHardcodedColors() {
  const hardcodedPatterns = [
    // Tailwind color classes
    /(bg|text|border)-[a-z]+-[0-9]+/g,
    // Hex colors
    /#[0-9a-fA-F]{3,6}/g,
    // RGB/RGBA values
    /rgb[a]?\([^)]+\)/g,
    // HSL values
    /hsl[a]?\([^)]+\)/g,
  ]

  const semanticTokens = [
    'fx-primary', 'fx-secondary', 'fx-accent',
    'fx-bg', 'fx-text-primary', 'fx-text-secondary', 'fx-text-muted',
    'fx-border-subtle', 'fx-border-default',
    'fx-flavor-fruity', 'fx-flavor-vegetal', 'fx-flavor-sweet',
    'fx-ai-confidence-low', 'fx-ai-confidence-med', 'fx-ai-confidence-high'
  ]

  return {
    patterns: hardcodedPatterns,
    semanticTokens,
    recommendations: {
      'bg-gray-100': 'bg-fx-bg-subtle',
      'bg-gray-50': 'bg-fx-bg-muted',
      'text-gray-600': 'text-fx-text-secondary',
      'text-gray-500': 'text-fx-text-muted',
      'border-gray-200': 'border-fx-border-subtle',
      'text-red-500': 'text-fx-ai-confidence-low',
      'bg-yellow-50': 'bg-fx-ai-confidence-med/10',
      'text-yellow-600': 'text-fx-ai-confidence-med',
      'text-green-600': 'text-fx-flavor-vegetal',
      'text-blue-600': 'text-fx-accent',
    }
  }
}

// ===== THEME TOGGLE COMPONENT =====

import { useTheme } from '@/components/providers/theme-provider'

interface ThemeToggleProps {
  className?: string
  variant?: 'button' | 'switch' | 'minimal'
}

// Re-export LoadingOverlay for backwards compatibility
export { LoadingOverlay }

export function ThemeToggle({ className = '', variant = 'button' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('high-contrast')
    else setTheme('light')
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )
      case 'high-contrast':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark': return 'Dark mode'
      case 'high-contrast': return 'High contrast'
      default: return 'Light mode'
    }
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors duration-fast ease-standard hover:bg-fx-bg-subtle ${className}`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'high contrast' : 'light'} mode`}
      >
        {getThemeIcon()}
      </button>
    )
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-sm text-fx-text-secondary">Theme</span>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 bg-fx-bg-subtle rounded-lg hover:bg-fx-bg-muted transition-colors duration-fast ease-standard"
        >
          {getThemeIcon()}
          <span className="text-sm text-fx-text-primary">{getThemeLabel()}</span>
        </button>
      </div>
    )
  }

  // Default button variant
  return (
    <button
      data-testid="theme-toggle"
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-4 py-2 bg-fx-accent text-fx-text-inverse rounded-lg hover:bg-fx-accent-hover transition-colors duration-fast ease-standard ${className}`}
    >
      {getThemeIcon()}
      <span className="text-sm font-medium">{getThemeLabel()}</span>
    </button>
  )
}
