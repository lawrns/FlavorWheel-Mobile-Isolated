/**
 * Error handling utilities for Quick Tasting operations
 */

export interface QuickTastingError {
  code: string
  message: string
  userMessage: string
  statusCode: number
  retryable: boolean
}

// Error codes and their handling
export const QUICK_TASTING_ERRORS = {
  // Authentication errors
  AUTH_REQUIRED: {
    code: 'AUTH_REQUIRED',
    message: 'Authentication is required',
    userMessage: 'Please sign in to save your tasting.',
    statusCode: 401,
    retryable: false
  },

  // Validation errors
  INVALID_PRODUCT_TYPE: {
    code: 'INVALID_PRODUCT_TYPE',
    message: 'Invalid product type provided',
    userMessage: 'Please select a valid product type.',
    statusCode: 400,
    retryable: false
  },

  INVALID_PRODUCT_NAME: {
    code: 'INVALID_PRODUCT_NAME',
    message: 'Product name is required and must be valid',
    userMessage: 'Please provide a valid product name.',
    statusCode: 400,
    retryable: false
  },

  NO_FLAVORS_SELECTED: {
    code: 'NO_FLAVORS_SELECTED',
    message: 'At least one flavor must be selected',
    userMessage: 'Please select at least one flavor you detected.',
    statusCode: 400,
    retryable: false
  },

  INVALID_RATING: {
    code: 'INVALID_RATING',
    message: 'Rating must be between 1 and 10 or score between 0 and 100',
    userMessage: 'Please provide a valid rating (1–10) or score (0–100).',
    statusCode: 400,
    retryable: false
  },

  // Database errors
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
    userMessage: 'Unable to save your tasting. Please try again.',
    statusCode: 500,
    retryable: true
  },

  TASTING_CREATION_FAILED: {
    code: 'TASTING_CREATION_FAILED',
    message: 'Failed to create tasting record',
    userMessage: 'Unable to save your tasting. Please try again.',
    statusCode: 500,
    retryable: true
  },

  ITEM_CREATION_FAILED: {
    code: 'ITEM_CREATION_FAILED',
    message: 'Failed to create tasting item',
    userMessage: 'Your tasting was saved, but some details may be missing.',
    statusCode: 500,
    retryable: true
  },

  FLAVOR_WHEEL_CREATION_FAILED: {
    code: 'FLAVOR_WHEEL_CREATION_FAILED',
    message: 'Failed to create flavor wheel',
    userMessage: 'Your tasting was saved, but flavor analysis may be incomplete.',
    statusCode: 500,
    retryable: true
  },

  // Network errors
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network request failed',
    userMessage: 'Connection failed. Please check your internet and try again.',
    statusCode: 0,
    retryable: true
  },

  // Generic errors
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    userMessage: 'Something went wrong. Please try again.',
    statusCode: 500,
    retryable: true
  }
} as const

/**
 * Maps various error types to QuickTastingError
 */
export function mapErrorToQuickTastingError(error: any): QuickTastingError {
  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST301': // Authentication required
        return QUICK_TASTING_ERRORS.AUTH_REQUIRED
      case '23505': // Unique constraint violation
        return {
          ...QUICK_TASTING_ERRORS.DATABASE_ERROR,
          userMessage: 'This tasting already exists.'
        }
      case '23503': // Foreign key constraint violation
        return {
          ...QUICK_TASTING_ERRORS.DATABASE_ERROR,
          userMessage: 'Invalid data reference. Please try again.'
        }
      default:
        return QUICK_TASTING_ERRORS.DATABASE_ERROR
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return QUICK_TASTING_ERRORS.NETWORK_ERROR
  }

  // Handle validation errors
  if (error?.message) {
    if (error.message.includes('authentication') || error.message.includes('auth')) {
      return QUICK_TASTING_ERRORS.AUTH_REQUIRED
    }
    if (error.message.includes('product type')) {
      return QUICK_TASTING_ERRORS.INVALID_PRODUCT_TYPE
    }
    if (error.message.includes('product name')) {
      return QUICK_TASTING_ERRORS.INVALID_PRODUCT_NAME
    }
    if (error.message.includes('flavor')) {
      return QUICK_TASTING_ERRORS.NO_FLAVORS_SELECTED
    }
    if (error.message.includes('rating')) {
      return QUICK_TASTING_ERRORS.INVALID_RATING
    }
  }

  // Default to unknown error
  return QUICK_TASTING_ERRORS.UNKNOWN_ERROR
}

/**
 * Creates a user-friendly error response
 */
export function createErrorResponse(error: any, operation: string) {
  const quickTastingError = mapErrorToQuickTastingError(error)

  return {
    success: false,
    error: quickTastingError.code,
    message: quickTastingError.message,
    userMessage: quickTastingError.userMessage,
    statusCode: quickTastingError.statusCode,
    retryable: quickTastingError.retryable,
    operation,
    timestamp: new Date().toISOString()
  }
}

/**
 * Validates Quick Tasting data
 */
export function validateQuickTastingData(data: {
  productType?: string
  productName?: string
  selectedFlavors?: string[]
  overallRating?: number
  overallScore?: number
  aroma?: string
  flavor?: string
}): QuickTastingError | null {
  if (!data.productType || data.productType.trim() === '') {
    return QUICK_TASTING_ERRORS.INVALID_PRODUCT_TYPE
  }

  if (!data.productName || data.productName.trim().length < 2) {
    return QUICK_TASTING_ERRORS.INVALID_PRODUCT_NAME
  }

  const hasSelectedFlavors = Array.isArray(data.selectedFlavors) && data.selectedFlavors.length > 0
  const hasNoteBased = Boolean(data.aroma?.trim?.() || data.flavor?.trim?.())
  if (!hasSelectedFlavors && !hasNoteBased) {
    return QUICK_TASTING_ERRORS.NO_FLAVORS_SELECTED
  }

  if (typeof data.overallScore === 'number') {
    if (data.overallScore < 0 || data.overallScore > 100) {
      return QUICK_TASTING_ERRORS.INVALID_RATING
    }
  } else {
    if (!data.overallRating || data.overallRating < 1 || data.overallRating > 10) {
      return QUICK_TASTING_ERRORS.INVALID_RATING
    }
  }

  return null
}

/**
 * Logs errors for debugging and monitoring
 */
type QuickTastingErrorResponse = ReturnType<typeof createErrorResponse>

export function logQuickTastingError(
  error: QuickTastingError | QuickTastingErrorResponse,
  context: any
) {
  const code = (error as any).code ?? (error as any).error
  const message = (error as any).message
  const userMessage = (error as any).userMessage

  const logData = {
    error: code,
    message,
    userMessage,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  }

  // In production, this would be sent to a logging service
  console.error('Quick Tasting Error:', logData)

  // Here you could send to services like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(error, { extra: logData })
}
