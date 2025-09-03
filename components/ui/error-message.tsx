'use client'

import React from 'react'
import { AlertTriangle, Wifi, WifiOff, RefreshCw, Info, CheckCircle, XCircle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Alert, AlertDescription } from './alert'
import { errorHandler } from '@/lib/error-handling'

interface ErrorMessageProps {
  error: any
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'banner' | 'toast' | 'card'
  className?: string
}

export function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  variant = 'inline',
  className = ''
}: ErrorMessageProps) {
  const config = errorHandler.getUserFriendlyError(error)

  const getIcon = () => {
    switch (config.type) {
      case 'NETWORK':
        return <WifiOff className="w-4 h-4" />
      case 'AUTHENTICATION':
        return <XCircle className="w-4 h-4" />
      case 'VALIDATION':
        return <Info className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getColorScheme = () => {
    switch (config.severity) {
      case 'CRITICAL':
        return 'destructive'
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'default'
      case 'LOW':
      default:
        return 'default'
    }
  }

  if (variant === 'banner') {
    return (
      <Alert className={`border-l-4 ${className}`}>
        {getIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span>{config.userMessage}</span>
          <div className="flex items-center space-x-2 ml-4">
            {config.retryable && onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-1" />
                {config.actionMessage || 'Retry'}
              </Button>
            )}
            {onDismiss && (
              <Button onClick={onDismiss} size="sm" variant="ghost">
                ×
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'toast') {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="text-red-600">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {config.userMessage}
            </p>
            {config.actionMessage && onRetry && config.retryable && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
              >
                {config.actionMessage}
              </Button>
            )}
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-600 mt-0.5">
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-2">
                {config.userMessage}
              </p>
              {config.retryable && onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {config.actionMessage || 'Retry'}
                </Button>
              )}
            </div>
            {onDismiss && (
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-600"
              >
                ×
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default inline variant
  return (
    <div className={`flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md ${className}`}>
      <div className="text-red-600 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm text-red-800">
          {config.userMessage}
        </p>
        {config.retryable && onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
          >
            {config.actionMessage || 'Retry'}
          </Button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

// Network status component
interface NetworkStatusProps {
  className?: string
}

export function NetworkStatus({ className = '' }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = React.useState(errorHandler.isOnline())

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

  if (isOnline) return null

  return (
    <div className={`flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md ${className}`}>
      <WifiOff className="w-4 h-4 text-yellow-600" />
      <span className="text-sm text-yellow-800">
        You're offline. Some features may not be available.
      </span>
    </div>
  )
}

// Loading states with error handling
interface AsyncContentProps {
  loading: boolean
  error: any
  onRetry?: () => void
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AsyncContent({
  loading,
  error,
  onRetry,
  loadingComponent,
  errorComponent,
  children,
  className = ''
}: AsyncContentProps) {
  if (loading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return errorComponent || (
      <ErrorMessage
        error={error}
        onRetry={onRetry}
        variant="card"
        className={className}
      />
    )
  }

  return <>{children}</>
}

// Success message component
interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
  className?: string
}

export function SuccessMessage({ message, onDismiss, className = '' }: SuccessMessageProps) {
  return (
    <div className={`flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md ${className}`}>
      <CheckCircle className="w-4 h-4 text-green-600" />
      <span className="text-sm text-green-800 flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

// Form error display
interface FormErrorProps {
  errors: Record<string, string[]>
  className?: string
}

export function FormError({ errors, className = '' }: FormErrorProps) {
  const errorMessages = Object.values(errors).flat()

  if (errorMessages.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {errorMessages.map((error, index) => (
        <ErrorMessage
          key={index}
          error={{ message: error }}
          variant="inline"
        />
      ))}
    </div>
  )
}
