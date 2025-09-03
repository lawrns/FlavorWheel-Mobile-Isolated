import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import {
  getMexicanFlavorDictionary,
  searchFlavorTerms,
  getFlavorCategory,
  validateFlavorTerm,
  getSynonyms,
  getRelatedTerms,
  translateFlavorTerm,
  getFlavorIntensityScale,
  getCulturalContext
} from '@/services/flavor-dictionary-service'

// Mock any external dependencies if needed
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }))
  }
}))

describe('FlavorDictionaryService', () => {
  describe('getMexicanFlavorDictionary', () => {
    it('should return the complete Mexican flavor dictionary', () => {
      const dictionary = getMexicanFlavorDictionary()

      expect(dictionary).toBeDefined()
      expect(typeof dictionary).toBe('object')
      expect(dictionary).toHaveProperty('categories')
      expect(dictionary).toHaveProperty('terms')
      expect(dictionary).toHaveProperty('translations')
    })

    it('should contain all expected flavor categories', () => {
      const dictionary = getMexicanFlavorDictionary()

      const expectedCategories = [
        'Frutal', 'Floral', 'Herbal', 'Ahumado', 'Mineral',
        'Dulce', 'Especiado', 'Agave'
      ]

      expectedCategories.forEach(category => {
        expect(dictionary.categories).toHaveProperty(category)
      })
    })

    it('should include cultural context for categories', () => {
      const dictionary = getMexicanFlavorDictionary()

      Object.values(dictionary.categories).forEach((category: any) => {
        expect(category).toHaveProperty('culturalContext')
        expect(typeof category.culturalContext).toBe('string')
        expect(category.culturalContext.length).toBeGreaterThan(0)
      })
    })
  })

  describe('searchFlavorTerms', () => {
    it('should find exact flavor term matches', () => {
      const results = searchFlavorTerms('citrus')

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toHaveProperty('term')
      expect(results[0]).toHaveProperty('category')
    })

    it('should find partial flavor term matches', () => {
      const results = searchFlavorTerms('cit')

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(result => result.term.includes('citrus'))).toBe(true)
    })

    it('should return empty array for non-existent terms', () => {
      const results = searchFlavorTerms('nonexistentflavor123')

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should handle case-insensitive search', () => {
      const resultsLower = searchFlavorTerms('citrus')
      const resultsUpper = searchFlavorTerms('CITRUS')

      expect(resultsLower.length).toBe(resultsUpper.length)
    })
  })

  describe('getFlavorCategory', () => {
    it('should return correct category for known flavor', () => {
      const category = getFlavorCategory('citrus')

      expect(category).toBe('Frutal')
    })

    it('should return null for unknown flavor', () => {
      const category = getFlavorCategory('unknownflavor')

      expect(category).toBeNull()
    })

    it('should handle flavor synonyms', () => {
      const category1 = getFlavorCategory('lime')
      const category2 = getFlavorCategory('limón')

      expect(category1).toBe(category2)
      expect(category1).toBe('Frutal')
    })
  })

  describe('validateFlavorTerm', () => {
    it('should validate known flavor terms', () => {
      const result = validateFlavorTerm('citrus')

      expect(result).toHaveProperty('isValid', true)
      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('confidence')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should invalidate unknown flavor terms', () => {
      const result = validateFlavorTerm('unknownflavor')

      expect(result).toHaveProperty('isValid', false)
      expect(result).toHaveProperty('suggestions')
      expect(Array.isArray(result.suggestions)).toBe(true)
    })

    it('should provide suggestions for similar terms', () => {
      const result = validateFlavorTerm('citru') // Missing 's'

      expect(result.isValid).toBe(false)
      expect(result.suggestions).toContain('citrus')
    })

    it('should handle empty input', () => {
      const result = validateFlavorTerm('')

      expect(result.isValid).toBe(false)
      expect(result.suggestions).toEqual([])
    })
  })

  describe('getSynonyms', () => {
    it('should return synonyms for known flavor terms', () => {
      const synonyms = getSynonyms('citrus')

      expect(Array.isArray(synonyms)).toBe(true)
      expect(synonyms.length).toBeGreaterThan(0)
      expect(synonyms).toContain('cítrico')
    })

    it('should return empty array for terms without synonyms', () => {
      const synonyms = getSynonyms('unique-flavor-term')

      expect(Array.isArray(synonyms)).toBe(true)
      expect(synonyms.length).toBe(0)
    })

    it('should handle multilingual synonyms', () => {
      const synonyms = getSynonyms('sweet')

      expect(synonyms).toContain('dulce') // Spanish
      expect(synonyms).toContain('suave') // Alternative Spanish
    })
  })

  describe('getRelatedTerms', () => {
    it('should return related flavor terms', () => {
      const related = getRelatedTerms('citrus')

      expect(Array.isArray(related)).toBe(true)
      expect(related.length).toBeGreaterThan(0)
      expect(related).toContain('lemon')
      expect(related).toContain('lime')
      expect(related).toContain('orange')
    })

    it('should return terms from same category', () => {
      const related = getRelatedTerms('citrus')
      const citrusCategory = getFlavorCategory('citrus')

      related.forEach(term => {
        expect(getFlavorCategory(term)).toBe(citrusCategory)
      })
    })

    it('should return empty array for unknown terms', () => {
      const related = getRelatedTerms('unknown-term')

      expect(Array.isArray(related)).toBe(true)
      expect(related.length).toBe(0)
    })
  })

  describe('translateFlavorTerm', () => {
    it('should translate English terms to Spanish', () => {
      const translation = translateFlavorTerm('citrus', 'es')

      expect(translation).toBe('cítrico')
    })

    it('should translate Spanish terms to English', () => {
      const translation = translateFlavorTerm('cítrico', 'en')

      expect(translation).toBe('citrus')
    })

    it('should translate to Nahuatl when available', () => {
      const translation = translateFlavorTerm('agave', 'nah')

      expect(typeof translation).toBe('string')
      expect(translation.length).toBeGreaterThan(0)
    })

    it('should return original term when translation not available', () => {
      const translation = translateFlavorTerm('unknown-term', 'es')

      expect(translation).toBe('unknown-term')
    })

    it('should handle case-insensitive translation', () => {
      const translation1 = translateFlavorTerm('CITRUS', 'es')
      const translation2 = translateFlavorTerm('citrus', 'es')

      expect(translation1).toBe(translation2)
    })
  })

  describe('getFlavorIntensityScale', () => {
    it('should return intensity scale for flavor categories', () => {
      const scale = getFlavorIntensityScale('Frutal')

      expect(scale).toHaveProperty('min', 1)
      expect(scale).toHaveProperty('max', 10)
      expect(scale).toHaveProperty('labels')
      expect(Array.isArray(scale.labels)).toBe(true)
    })

    it('should return appropriate scale for different categories', () => {
      const sweetScale = getFlavorIntensityScale('Dulce')
      const spicyScale = getFlavorIntensityScale('Especiado')

      expect(sweetScale.max).toBe(10)
      expect(spicyScale.max).toBe(10)
      expect(sweetScale.labels).not.toEqual(spicyScale.labels)
    })

    it('should handle unknown categories', () => {
      const scale = getFlavorIntensityScale('Unknown')

      expect(scale.min).toBe(1)
      expect(scale.max).toBe(10)
      expect(scale.labels).toEqual(['Very Low', 'Low', 'Medium', 'High', 'Very High'])
    })
  })

  describe('getCulturalContext', () => {
    it('should return cultural context for Mexican beverages', () => {
      const context = getCulturalContext('tequila')

      expect(typeof context).toBe('string')
      expect(context.length).toBeGreaterThan(0)
      expect(context.toLowerCase()).toContain('mexico')
    })

    it('should return context for mezcal', () => {
      const context = getCulturalContext('mezcal')

      expect(typeof context).toBe('string')
      expect(context.toLowerCase()).toContain('oaxaca')
    })

    it('should return context for pulque', () => {
      const context = getCulturalContext('pulque')

      expect(typeof context).toBe('string')
      expect(context.toLowerCase()).toContain('traditional')
    })

    it('should handle unknown beverages', () => {
      const context = getCulturalContext('unknown-beverage')

      expect(typeof context).toBe('string')
      expect(context).toContain('traditional Mexican beverage')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large search queries efficiently', () => {
      const startTime = Date.now()

      // Perform multiple searches
      for (let i = 0; i < 100; i++) {
        searchFlavorTerms('citrus')
        getFlavorCategory('sweet')
        validateFlavorTerm('vanilla')
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle special characters in search terms', () => {
      const results = searchFlavorTerms('cítrico')

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle very long search terms', () => {
      const longTerm = 'a'.repeat(1000)
      const results = searchFlavorTerms(longTerm)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should handle null and undefined inputs', () => {
      expect(() => searchFlavorTerms(null as any)).not.toThrow()
      expect(() => searchFlavorTerms(undefined as any)).not.toThrow()
      expect(() => getFlavorCategory(null as any)).not.toThrow()
      expect(() => validateFlavorTerm(null as any)).not.toThrow()
    })
  })

  describe('Dictionary Integrity', () => {
    it('should have consistent category mappings', () => {
      const dictionary = getMexicanFlavorDictionary()

      // Check that all terms in categories actually exist
      Object.entries(dictionary.categories).forEach(([categoryName, category]: [string, any]) => {
        if (category.subcategories) {
          category.subcategories.forEach((subcategory: string) => {
            // Verify subcategory exists in terms
            const termsWithSubcategory = dictionary.terms.filter(
              (term: any) => term.subcategory === subcategory
            )
            expect(termsWithSubcategory.length).toBeGreaterThan(0)
          })
        }
      })
    })

    it('should have valid translations for all terms', () => {
      const dictionary = getMexicanFlavorDictionary()

      dictionary.terms.forEach((term: any) => {
        if (term.translations) {
          expect(typeof term.translations).toBe('object')

          // Check Spanish translation exists
          if (term.translations.es) {
            expect(typeof term.translations.es).toBe('string')
            expect(term.translations.es.length).toBeGreaterThan(0)
          }

          // Check English translation exists
          if (term.translations.en) {
            expect(typeof term.translations.en).toBe('string')
            expect(term.translations.en.length).toBeGreaterThan(0)
          }
        }
      })
    })

    it('should have valid intensity ranges', () => {
      const dictionary = getMexicanFlavorDictionary()

      dictionary.terms.forEach((term: any) => {
        if (term.intensity) {
          expect(typeof term.intensity.min).toBe('number')
          expect(typeof term.intensity.max).toBe('number')
          expect(term.intensity.min).toBeGreaterThan(0)
          expect(term.intensity.max).toBeLessThanOrEqual(10)
          expect(term.intensity.min).toBeLessThanOrEqual(term.intensity.max)
        }
      })
    })
  })
})
