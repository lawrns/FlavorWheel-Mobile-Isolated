import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import {
  extractKeywords,
  processTastingForFlavorWheel,
  extractKeywordsAdvanced,
  extractKeywordsBatch,
  validateExtractionQuality
} from '@/services/keyword-extraction-service'

// Mock external dependencies
jest.mock('@/services/flavor-dictionary-service', () => ({
  getMexicanFlavorDictionary: jest.fn(() => ({
    terms: [
      { term: 'citrus', category: 'Frutal' },
      { term: 'sweet', category: 'Dulce' },
    ]
  }))
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      data: [],
      error: null,
    })),
  },
}))

describe('KeywordExtractionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('extractKeywords', () => {
    it('should extract keywords from tasting input', async () => {
      const input = {
        notes: 'citrus vanilla smoke sweet',
        productType: 'tequila'
      }

      const result = await extractKeywords(input)

      expect(result).toHaveProperty('keywords')
      expect(Array.isArray(result.keywords)).toBe(true)
      expect(result.keywords.length).toBeGreaterThan(0)
      expect(result).toHaveProperty('confidence')
      expect(typeof result.confidence).toBe('number')
    })

    it('should handle empty input', async () => {
      const input = { notes: '', productType: 'tequila' }

      const result = await extractKeywords(input)

      expect(result).toHaveProperty('keywords')
      expect(Array.isArray(result.keywords)).toBe(true)
    })

    it('should include processing time', async () => {
      const input = { notes: 'citrus vanilla', productType: 'tequila' }

      const result = await extractKeywords(input)

      expect(result).toHaveProperty('processingTimeMs')
      expect(typeof result.processingTimeMs).toBe('number')
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('processTastingForFlavorWheel', () => {
    it('should process tasting data for flavor wheel', async () => {
      const tastingData = {
        id: '1',
        notes: 'citrus vanilla smoke',
        productType: 'tequila'
      }

      const result = await processTastingForFlavorWheel(tastingData)

      expect(result).toHaveProperty('flavorWheelViews')
      expect(Array.isArray(result.flavorWheelViews)).toBe(true)
    })

    it('should handle empty tasting data', async () => {
      const tastingData = { id: '1', notes: '', productType: 'tequila' }

      const result = await processTastingForFlavorWheel(tastingData)

      expect(result).toHaveProperty('flavorWheelViews')
      expect(Array.isArray(result.flavorWheelViews)).toBe(true)
    })
  })

  describe('extractKeywordsAdvanced', () => {
    it('should extract keywords with advanced options', async () => {
      const input = {
        notes: 'citrus vanilla smoke sweet herbal',
        productType: 'tequila',
        language: 'en' as const
      }

      const result = await extractKeywordsAdvanced(input)

      expect(result).toHaveProperty('keywords')
      expect(Array.isArray(result.keywords)).toBe(true)
      expect(result).toHaveProperty('sunburstData')
    })

    it('should handle different languages', async () => {
      const input = {
        notes: 'cítricos vainilla humo dulce',
        productType: 'tequila',
        language: 'es' as const
      }

      const result = await extractKeywordsAdvanced(input)

      expect(result).toHaveProperty('language', 'es')
      expect(Array.isArray(result.keywords)).toBe(true)
    })
  })

  describe('extractKeywordsBatch', () => {
    it('should process multiple tasting inputs', async () => {
      const inputs = [
        { notes: 'citrus vanilla', productType: 'tequila' },
        { notes: 'smoke herbs', productType: 'mezcal' }
      ]

      const results = await extractKeywordsBatch(inputs)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(2)
      results.forEach(result => {
        expect(result).toHaveProperty('keywords')
        expect(Array.isArray(result.keywords)).toBe(true)
      })
    })

    it('should handle empty batch', async () => {
      const results = await extractKeywordsBatch([])

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })
  })

  describe('validateExtractionQuality', () => {
    it('should validate extraction quality', () => {
      const keywords = ['citrus', 'vanilla', 'smoke']
      const result = validateExtractionQuality(keywords)

      expect(result).toHaveProperty('quality')
      expect(result).toHaveProperty('issues')
      expect(typeof result.quality).toBe('number')
      expect(Array.isArray(result.issues)).toBe(true)
    })

    it('should detect high quality extractions', () => {
      const keywords = ['citrus', 'vanilla', 'smoke', 'sweet', 'herbal']
      const result = validateExtractionQuality(keywords)

      expect(result.quality).toBeGreaterThan(0.5)
    })

    it('should handle empty keywords', () => {
      const result = validateExtractionQuality([])

      expect(result.quality).toBe(0)
      expect(Array.isArray(result.issues)).toBe(true)
    })
  })
})