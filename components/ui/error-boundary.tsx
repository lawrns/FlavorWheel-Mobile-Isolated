'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retryCount: number
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
  showDetails?: boolean
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  retry: () => void
  retryCount: number
  maxRetries: number
  goHome: () => void
  reportError: () => void
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = []

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(clearTimeout)
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries ?? 3

    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))

      // Clear any existing timeouts
      this.retryTimeouts.forEach(clearTimeout)
      this.retryTimeouts = []
    }
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    // In a real app, this would send to error reporting service
    console.log('Error report:', errorDetails)

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please send this to support.')
      })
      .catch(() => {
        alert('Error details logged to console. Please check developer tools.')
      })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback
      const maxRetries = this.props.maxRetries ?? 3

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retry={this.handleRetry}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
          goHome={this.handleGoHome}
          reportError={this.handleReportError}
        />
      )
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  errorInfo,
  retry,
  retryCount,
  maxRetries,
  goHome,
  reportError
}: ErrorFallbackProps) {
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network')
  const canRetry = retryCount < maxRetries

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <Card variant="elevated" className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isNetworkError ? (
                <WifiOff className="w-8 h-8 text-red-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-xl text-gray-900">
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {isNetworkError
                  ? "We couldn't connect to our servers. Please check your internet connection and try again."
                  : "We encountered an unexpected error. Don't worry, your data is safe."
                }
              </p>

              {retryCount > 0 && (
                <p className="text-sm text-gray-500">
                  Retry attempt: {retryCount} of {maxRetries}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {canRetry && (
                <Button
                  onClick={retry}
                  className="w-full bg-fx-accent hover:bg-fx-accent-hover"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              <Button
                onClick={goHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>

              <Button
                onClick={reportError}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                size="sm"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 p-4 bg-gray-50 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="text-xs text-gray-600 space-y-2">
                  <div><strong>Error:</strong> {error.message}</div>
                  {error.stack && (
                    <div><strong>Stack:</strong> <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre></div>
                  )}
                  {errorInfo?.componentStack && (
                    <div><strong>Component Stack:</strong> <pre className="whitespace-pre-wrap mt-1">{errorInfo.componentStack}</pre></div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Specialized error boundaries for different contexts

// Network error boundary
export function NetworkErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={NetworkErrorFallback}
      maxRetries={5}
      onError={(error) => {
        // Could implement retry logic with exponential backoff here
        console.log('Network error:', error.message)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function NetworkErrorFallback(props: ErrorFallbackProps) {
  return (
    <DefaultErrorFallback
      {...props}
      error={new Error('Network connection failed')}
    />
  )
}

// Form error boundary
export function FormErrorBoundary({
  children,
  onRetry
}: {
  children: React.ReactNode
  onRetry?: () => void
}) {
  return (
    <ErrorBoundary
      fallback={(props) => (
        <FormErrorFallback {...props} onCustomRetry={onRetry} />
      )}
      maxRetries={2}
    >
      {children}
    </ErrorBoundary>
  )
}

function FormErrorFallback({
  retry,
  retryCount,
  maxRetries,
  onCustomRetry
}: ErrorFallbackProps & { onCustomRetry?: () => void }) {
  const handleRetry = () => {
    if (onCustomRetry) {
      onCustomRetry()
    } else {
      retry()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-red-800">Form Error</h4>
          <p className="text-sm text-red-700">Something went wrong while processing your data.</p>
        </div>
      </div>

      {retryCount < maxRetries && (
        <Button
          onClick={handleRetry}
          size="sm"
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again ({retryCount + 1}/{maxRetries})
        </Button>
      )}
    </motion.div>
  )
}

// Data loading error boundary
export function DataErrorBoundary({
  children,
  dataType = 'data'
}: {
  children: React.ReactNode
  dataType?: string
}) {
  return (
    <ErrorBoundary
      fallback={(props) => <DataErrorFallback {...props} dataType={dataType} />}
      maxRetries={3}
    >
      {children}
    </ErrorBoundary>
  )
}

function DataErrorFallback({
  retry,
  retryCount,
  maxRetries,
  dataType
}: ErrorFallbackProps & { dataType: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load {dataType}
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm">
        We couldn&apos;t load the {dataType} you requested. This might be a temporary issue.
      </p>

      {retryCount < maxRetries && (
        <Button onClick={retry} className="bg-fx-accent hover:bg-fx-accent-hover">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry ({retryCount + 1}/{maxRetries})
        </Button>
      )}
    </motion.div>
  )
}

// Toast notification for errors
export function ErrorToast({
  error,
  onRetry,
  onDismiss
}: {
  error: Error
  onRetry?: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="max-w-sm w-full bg-red-600 text-white p-4 rounded-lg shadow-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">Error</h4>
          <p className="text-sm text-red-100">{error.message}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="border-red-400 text-red-100 hover:bg-red-500"
          >
            Retry
          </Button>
        )}
        <Button
          onClick={onDismiss}
          size="sm"
          variant="ghost"
          className="text-red-100 hover:bg-red-500"
        >
          Dismiss
        </Button>
      </div>
    </motion.div>
  )
}

export default ErrorBoundary