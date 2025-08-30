'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging with mobile-specific context
    const errorContext = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      context: {
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        viewport: typeof window !== 'undefined' ? {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        } : null,
        isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
        networkStatus: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown'
      }
    }

    console.error('🚨 Enhanced ErrorBoundary caught an error:', errorContext)

    // Log to localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('flavorwheel-errors') || '[]')
      existingLogs.push(errorContext)
      // Keep only last 10 errors to prevent storage bloat
      if (existingLogs.length > 10) {
        existingLogs.shift()
      }
      localStorage.setItem('flavorwheel-errors', JSON.stringify(existingLogs))

      // Also log mobile-specific debugging info
      if (errorContext.context.isMobile) {
        console.warn('📱 MOBILE ERROR DETECTED:', {
          error: errorContext.error.message,
          viewport: errorContext.context.viewport,
          userAgent: errorContext.context.userAgent,
          url: errorContext.context.url,
          timestamp: errorContext.context.timestamp
        })
      }
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError)
    }

    // Send to remote logging service
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        fetch('/api/log-error', {
          method: 'POST',
          body: JSON.stringify(errorContext),
          headers: { 'Content-Type': 'application/json' }
        }).then(response => {
          if (!response.ok) {
            console.warn('Remote logging failed with status:', response.status)
          } else {
            console.log('🚀 ERROR LOG SENT TO REMOTE SERVICE')
          }
        }).catch(remoteError => {
          console.warn('Remote logging failed:', remoteError)
        })
      } catch (remoteError) {
        console.warn('Remote logging setup failed:', remoteError)
      }
    }

    // Detect mobile browsers
    const isMobile =
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Filter out fetch-related errors that are non-critical
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('fetch-server-response') ||
      error.message.includes('prefetch-cache-utils')
    ) {
      console.warn('Non-critical fetch error caught and handled:', error.message)
      // Don't show error UI for fetch errors, just log them
      this.setState({ hasError: false })
      return
    }

    // Filter out hydration mismatch errors (often noisy on mobile Safari)
    if (
      error.message.includes('Hydration failed') ||
      error.message.includes('hydration mismatch') ||
      error.message.includes('server rendered text') ||
      error.message.toLowerCase().includes('hydration')
    ) {
      console.warn('Non-critical hydration error handled:', error.message)
      // Do not render the global error UI for hydration warnings
      this.setState({ hasError: false })
      return
    }

    // Handle localStorage/hydration errors on mobile
    if (
      isMobile &&
      (error.message.includes('localStorage') ||
        error.message.includes('sessionStorage') ||
        error.message.includes('Hydration') ||
        error.message.includes('hydration'))
    ) {
      console.warn('Mobile hydration/storage error caught:', error.message)
      // Try to recover by clearing localStorage and reloading
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear()
        }
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (e) {
        console.error('Failed to clear storage:', e)
      }
      return
    }

    this.setState({ errorInfo })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  // Static method to retrieve error logs for debugging
  static getErrorLogs() {
    try {
      return JSON.parse(localStorage.getItem('flavorwheel-errors') || '[]')
    } catch {
      return []
    }
  }

  // Static method to clear error logs
  static clearErrorLogs() {
    try {
      localStorage.removeItem('flavorwheel-errors')
      return true
    } catch {
      return false
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} retry={this.retry} />
      }

      // Default error UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto max-w-md p-6 text-center">
            <div className="mb-4 text-6xl">🌵</div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">¡Oops! Algo salió mal</h2>
            <p className="mb-6 text-muted-foreground">
              Ocurrió un error inesperado. Por favor, intenta de nuevo.
            </p>
            <div className="space-y-4">
              <Button onClick={this.retry} className="w-full">
                Intentar de nuevo
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Recargar página
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="mt-2 overflow-auto rounded border bg-card p-4 text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)

    // Filter out non-critical fetch errors
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('fetch-server-response') ||
      error.message.includes('prefetch-cache-utils')
    ) {
      console.warn('Non-critical fetch error handled:', error.message)
      return // Don't throw for fetch errors
    }

    // For other errors, you might want to report them or show a toast
    throw error
  }
}
