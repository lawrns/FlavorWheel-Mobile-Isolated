// Error handling utilities for FlavorWheel

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  context?: Record<string, any>
  userId?: string
  userAgent?: string
  url?: string
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  STORAGE = 'STORAGE',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorConfig {
  type: ErrorType
  severity: ErrorSeverity
  retryable: boolean
  userMessage: string
  actionMessage?: string
  action?: () => void
}

class ErrorHandler {
  private errorLog: AppError[] = []
  private readonly MAX_LOG_SIZE = 100

  // Error mapping for common error types
  private readonly ERROR_MAP: Record<string, ErrorConfig> = {
    // Network errors
    'NETWORK_ERROR': {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: 'Connection problem. Please check your internet and try again.',
      actionMessage: 'Retry'
    },
    'TIMEOUT': {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: 'Request timed out. Please try again.',
      actionMessage: 'Retry'
    },

    // Authentication errors
    'INVALID_CREDENTIALS': {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: 'Invalid email or password. Please check your credentials.',
      actionMessage: 'Try again'
    },
    'SESSION_EXPIRED': {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: 'Your session has expired. Please sign in again.',
      actionMessage: 'Sign in'
    },

    // Authorization errors
    'INSUFFICIENT_PERMISSIONS': {
      type: ErrorType.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: 'You don\'t have permission to perform this action.',
      actionMessage: 'Contact support'
    },

    // Validation errors
    'VALIDATION_ERROR': {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: 'Please check your input and try again.',
      actionMessage: 'Review input'
    },
    'REQUIRED_FIELD': {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: 'This field is required.',
      actionMessage: 'Fill field'
    },

    // Database errors
    'DATABASE_ERROR': {
      type: ErrorType.DATABASE,
      severity: ErrorSeverity.HIGH,
      retryable: true,
      userMessage: 'Database error occurred. Please try again.',
      actionMessage: 'Retry'
    },
    'RECORD_NOT_FOUND': {
      type: ErrorType.DATABASE,
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: 'The requested item could not be found.',
      actionMessage: 'Go back'
    },

    // Storage errors
    'UPLOAD_FAILED': {
      type: ErrorType.STORAGE,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: 'File upload failed. Please try again.',
      actionMessage: 'Retry upload'
    },
    'FILE_TOO_LARGE': {
      type: ErrorType.STORAGE,
      severity: ErrorSeverity.LOW,
      retryable: false,
      userMessage: 'File is too large. Please choose a smaller file.',
      actionMessage: 'Choose different file'
    },

    // Rate limiting
    'RATE_LIMIT_EXCEEDED': {
      type: ErrorType.RATE_LIMIT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      actionMessage: 'Try again later'
    }
  }

  /**
   * Parse and categorize an error
   */
  parseError(error: any, context?: Record<string, any>): ErrorConfig {
    // Handle Supabase errors
    if (error?.code) {
      switch (error.code) {
        case 'PGRST116':
          return this.ERROR_MAP.RECORD_NOT_FOUND
        case '23505':
          return {
            type: ErrorType.DATABASE,
            severity: ErrorSeverity.LOW,
            retryable: false,
            userMessage: 'This item already exists.',
            actionMessage: 'Use different name'
          }
        case '42501':
          return this.ERROR_MAP.INSUFFICIENT_PERMISSIONS
      }
    }

    // Handle network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return this.ERROR_MAP.NETWORK_ERROR
    }

    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.code === 'TIMEOUT') {
      return this.ERROR_MAP.TIMEOUT
    }

    // Handle authentication errors
    if (error?.message?.includes('Invalid login credentials')) {
      return this.ERROR_MAP.INVALID_CREDENTIALS
    }

    if (error?.message?.includes('JWT expired')) {
      return this.ERROR_MAP.SESSION_EXPIRED
    }

    // Handle file upload errors
    if (error?.message?.includes('upload') || error?.message?.includes('storage')) {
      return this.ERROR_MAP.UPLOAD_FAILED
    }

    // Handle validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('required')) {
      return this.ERROR_MAP.VALIDATION_ERROR
    }

    // Default to unknown error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: 'Something went wrong. Please try again.',
      actionMessage: 'Retry'
    }
  }

  /**
   * Log an error for debugging and monitoring
   */
  logError(error: any, context?: Record<string, any>, severity: ErrorSeverity = ErrorSeverity.MEDIUM): void {
    const appError: AppError = {
      code: error?.code || 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown error occurred',
      details: error,
      timestamp: new Date(),
      context,
      userId: this.getCurrentUserId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add to error log
    this.errorLog.push(appError)

    // Keep log size manageable
    if (this.errorLog.length > this.MAX_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-this.MAX_LOG_SIZE)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('FlavorWheel Error:', appError)
    }

    // Send to error reporting service in production
    if (process.env.NODE_ENV === 'production' && severity !== ErrorSeverity.LOW) {
      this.reportError(appError)
    }
  }

  /**
   * Get user-friendly error message and actions
   */
  getUserFriendlyError(error: any): ErrorConfig {
    const config = this.parseError(error)
    return config
  }

  /**
   * Handle errors with user feedback
   */
  async handleError(error: any, context?: Record<string, any>): Promise<ErrorConfig> {
    const config = this.parseError(error, context)
    this.logError(error, context, config.severity)

    return config
  }

  /**
   * Retry a failed operation
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        const config = this.parseError(error)
        if (!config.retryable || attempt === maxRetries) {
          throw error
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
      }
    }

    throw lastError
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  /**
   * Get current user ID (if available)
   */
  private getCurrentUserId(): string | undefined {
    // This would be implemented to get the current user ID from auth context
    return undefined
  }

  /**
   * Report error to external service
   */
  private reportError(error: AppError): void {
    // Implement error reporting to services like Sentry, LogRocket, etc.
    // For now, just log to console
    console.error('Reporting error to monitoring service:', error)
  }

  /**
   * Get error log for debugging
   */
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    this.errorLog.forEach(error => {
      const type = error.code
      stats[type] = (stats[type] || 0) + 1
    })

    return stats
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Utility functions for common error scenarios
export const handleApiError = (error: any, context?: Record<string, any>) =>
  errorHandler.handleError(error, { ...context, source: 'api' })

export const handleAuthError = (error: any, context?: Record<string, any>) =>
  errorHandler.handleError(error, { ...context, source: 'auth' })

export const handleUploadError = (error: any, context?: Record<string, any>) =>
  errorHandler.handleError(error, { ...context, source: 'upload' })

export const handleNetworkError = (error: any, context?: Record<string, any>) =>
  errorHandler.handleError(error, { ...context, source: 'network' })

// Hook for using error handling in components
export function useErrorHandler() {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    getUserFriendlyError: errorHandler.getUserFriendlyError.bind(errorHandler),
    retryOperation: errorHandler.retryOperation.bind(errorHandler),
    isOnline: errorHandler.isOnline.bind(errorHandler),
    logError: errorHandler.logError.bind(errorHandler)
  }
}
