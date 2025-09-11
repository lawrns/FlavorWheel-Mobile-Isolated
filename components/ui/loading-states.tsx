'use client'

import React from 'react'
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'

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
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
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
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
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

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className={`h-4 bg-gray-200 rounded ${
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
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
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
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
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
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            You&apos;re offline
          </h3>
          <p className="text-sm text-muted-foreground">
            Some features may not be available. Please check your connection.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
