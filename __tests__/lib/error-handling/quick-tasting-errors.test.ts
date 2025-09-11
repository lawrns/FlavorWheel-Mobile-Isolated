/**
 * Unit tests for Quick Tasting Error Handling
 */

import { describe, it, expect } from '@jest/globals'
import {
  mapErrorToQuickTastingError,
  createErrorResponse,
  validateQuickTastingData,
  QUICK_TASTING_ERRORS
} from '../../../lib/error-handling/quick-tasting-errors'
import type { QuickTastingData } from '../../../types/quick-tasting'

describe('Quick Tasting Error Handling', () => {
  describe('mapErrorToQuickTastingError', () => {
    it('should map authentication errors', () => {
      const authError = { code: 'PGRST301', message: 'Authentication required' }
      const result = mapErrorToQuickTastingError(authError)

      expect(result).toEqual(QUICK_TASTING_ERRORS.AUTH_REQUIRED)
    })

    it('should map database constraint errors', () => {
      const uniqueError = { code: '23505', message: 'Unique constraint violation' }
      const result = mapErrorToQuickTastingError(uniqueError)

      expect(result.code).toBe('DATABASE_ERROR')
      expect(result.userMessage).toContain('already exists')
    })

    it('should map network errors', () => {
      const networkError = { name: 'NetworkError', message: 'Failed to fetch' }
      const result = mapErrorToQuickTastingError(networkError)

      expect(result).toEqual(QUICK_TASTING_ERRORS.NETWORK_ERROR)
    })

    it('should map validation message errors', () => {
      const validationError = { message: 'Invalid product type provided' }
      const result = mapErrorToQuickTastingError(validationError)

      expect(result).toEqual(QUICK_TASTING_ERRORS.INVALID_PRODUCT_TYPE)
    })

    it('should return unknown error for unmapped errors', () => {
      const unknownError = { message: 'Some random error' }
      const result = mapErrorToQuickTastingError(unknownError)

      expect(result).toEqual(QUICK_TASTING_ERRORS.UNKNOWN_ERROR)
    })

    it('should handle null/undefined errors', () => {
      const result = mapErrorToQuickTastingError(null)
      expect(result).toEqual(QUICK_TASTING_ERRORS.UNKNOWN_ERROR)

      const undefinedResult = mapErrorToQuickTastingError(undefined)
      expect(undefinedResult).toEqual(QUICK_TASTING_ERRORS.UNKNOWN_ERROR)
    })
  })

  describe('createErrorResponse', () => {
    it('should create a proper error response', () => {
      const error = new Error('Test error')
      const operation = 'testOperation'

      const result = createErrorResponse(error, operation)

      expect(result.success).toBe(false)
      expect(result.error).toBe('UNKNOWN_ERROR')
      expect(result.operation).toBe(operation)
      expect(result.timestamp).toBeDefined()
      expect(typeof result.timestamp).toBe('string')
    })

    it('should include user message from mapped error', () => {
      const authError = { code: 'PGRST301' }
      const result = createErrorResponse(authError, 'test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('AUTH_REQUIRED')
      expect(result.userMessage).toBe(QUICK_TASTING_ERRORS.AUTH_REQUIRED.userMessage)
    })
  })

  describe('validateQuickTastingData', () => {
    it('should validate complete valid data', () => {
      const validData: QuickTastingData = {
        productType: 'wine',
        productName: 'Test Wine',
        selectedFlavors: ['Berry', 'Oak'],
        overallRating: 8,
        notes: 'Great wine'
      }

      const result = validateQuickTastingData(validData)
      expect(result).toBeNull()
    })

    it('should detect missing product type', () => {
      const invalidData = {
        productName: 'Test Wine',
        selectedFlavors: ['Berry'],
        overallRating: 8
      }

      const result = validateQuickTastingData(invalidData as QuickTastingData)
      expect(result).toEqual(QUICK_TASTING_ERRORS.INVALID_PRODUCT_TYPE)
    })

    it('should detect invalid product name', () => {
      const invalidData = {
        productType: 'wine',
        productName: '',
        selectedFlavors: ['Berry'],
        overallRating: 8
      }

      const result = validateQuickTastingData(invalidData as QuickTastingData)
      expect(result).toEqual(QUICK_TASTING_ERRORS.INVALID_PRODUCT_NAME)
    })

    it('should detect missing flavors', () => {
      const invalidData = {
        productType: 'wine',
        productName: 'Test Wine',
        selectedFlavors: [],
        overallRating: 8
      }

      const result = validateQuickTastingData(invalidData as QuickTastingData)
      expect(result).toEqual(QUICK_TASTING_ERRORS.NO_FLAVORS_SELECTED)
    })

    it('should detect invalid rating', () => {
      const invalidData = {
        productType: 'wine',
        productName: 'Test Wine',
        selectedFlavors: ['Berry'],
        overallRating: 0
      }

      const result = validateQuickTastingData(invalidData as QuickTastingData)
      expect(result).toEqual(QUICK_TASTING_ERRORS.INVALID_RATING)
    })

    it('should detect rating too high', () => {
      const invalidData = {
        productType: 'wine',
        productName: 'Test Wine',
        selectedFlavors: ['Berry'],
        overallRating: 15
      }

      const result = validateQuickTastingData(invalidData as QuickTastingData)
      expect(result).toEqual(QUICK_TASTING_ERRORS.INVALID_RATING)
    })
  })

  describe('QUICK_TASTING_ERRORS constants', () => {
    it('should have all required error properties', () => {
      Object.values(QUICK_TASTING_ERRORS).forEach((error) => {
        expect(error).toHaveProperty('code')
        expect(error).toHaveProperty('message')
        expect(error).toHaveProperty('userMessage')
        expect(error).toHaveProperty('statusCode')
        expect(error).toHaveProperty('retryable')
        expect(typeof error.retryable).toBe('boolean')
        expect(typeof error.statusCode).toBe('number')
      })
    })

    it('should have unique error codes', () => {
      const codes = Object.values(QUICK_TASTING_ERRORS).map(e => e.code)
      const uniqueCodes = new Set(codes)
      expect(uniqueCodes.size).toBe(codes.length)
    })

    it('should have appropriate HTTP status codes', () => {
      Object.values(QUICK_TASTING_ERRORS).forEach((error) => {
        expect(error.statusCode).toBeGreaterThanOrEqual(200)
        expect(error.statusCode).toBeLessThan(600)
      })
    })
  })
})
