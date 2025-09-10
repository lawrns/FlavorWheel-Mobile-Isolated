'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { errorHandler } from '@/lib/error-handling'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showReportButton?: boolean
  maxRetries?: number
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries: number

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.maxRetries = props.maxRetries || 3
    this.state = {
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    errorHandler.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    this.setState({ errorInfo })
  }

  handleRetry = () => {
    const { retryCount } = this.state

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: retryCount + 1
      })
    }
  }

  handleReportError = () => {
    const { error } = this.state

    // Report error to monitoring service
    if (error) {
      errorHandler.logError(error, {
        userReported: true,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }

    // Show user feedback
    alert('Thank you for reporting this error. Our team has been notified.')
  }

  handleGoHome = () => {
    window.location.href = '/en/landing'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      // Default error UI
      return <ErrorFallback
        error={this.state.error}
        retryCount={this.state.retryCount}
        maxRetries={this.maxRetries}
        onRetry={this.handleRetry}
        onReport={this.handleReportError}
        onGoHome={this.handleGoHome}
        showReportButton={this.props.showReportButton}
      />
    }

    return this.props.children
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error?: Error
  retryCount: number
  maxRetries: number
  onRetry: () => void
  onReport: () => void
  onGoHome: () => void
  showReportButton?: boolean
}

function ErrorFallback({
  error,
  retryCount,
  maxRetries,
  onRetry,
  onReport,
  onGoHome,
  showReportButton = true
}: ErrorFallbackProps) {
  const canRetry = retryCount < maxRetries

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified.
          </p>

          {error && process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-100 p-3 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium text-gray-700">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-3">
            {canRetry && (
              <Button
                onClick={onRetry}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again ({retryCount}/{maxRetries})
              </Button>
            )}

            <Button
              onClick={onGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>

            {showReportButton && (
              <Button
                onClick={onReport}
                variant="ghost"
                className="w-full text-gray-600"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report This Error
              </Button>
            )}
          </div>

          <div className="text-center text-xs text-gray-500">
            Error ID: {Date.now().toString(36)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      showReportButton={true}
      maxRetries={2}
      onError={(error, errorInfo) => {
        console.error('Page Error:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      showReportButton={false}
      maxRetries={1}
      fallback={({ error, retry }) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">Component error occurred</span>
          </div>
          <Button
            onClick={retry}
            size="sm"
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook for handling async errors in components
export function useAsyncError() {
  const [, setError] = React.useState()

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

// Utility component for displaying error messages
interface ErrorMessageProps {
  error: any
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ error, onRetry, className = '' }: ErrorMessageProps) {
  const config = errorHandler.getUserFriendlyError(error)

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            {config.userMessage}
          </p>
          {config.actionMessage && onRetry && config.retryable && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="mt-2"
            >
              {config.actionMessage}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}