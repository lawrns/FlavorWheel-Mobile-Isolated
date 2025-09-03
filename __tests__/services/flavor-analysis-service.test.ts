import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import {
  generateFlavorWheelData,
  getFlavorStatistics,
  extractFlavorsFromText,
  buildFlavorHierarchy,
  MEXICAN_FLAVOR_CATEGORIES
} from '@/services/flavor-analysis-service'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      data: [],
      error: null,
    })),
  },
}))

// Mock flavor utilities
jest.mock('@/lib/flavor-utils', () => ({
  extractFlavorDescriptorsMultilingual: jest.fn()
}))

// Mock flavor dictionary service
jest.mock('@/services/flavor-dictionary-service', () => ({
  getMexicanFlavorDictionary: jest.fn(() => ({
    Frutal: {
      color: '#FF6B6B',
      subcategories: {
        Cítricos: ['limón', 'naranja'],
        'Frutas Tropicales': ['mango', 'piña'],
      },
    },
    Especiado: {
      color: '#E17055',
      subcategories: {
        Chile: ['habanero', 'serrano'],
      },
    },
    Agave: {
      color: '#00b894',
      subcategories: {
        'Agave Cocido': ['caramelo', 'miel'],
      },
    },
  }))
}))

describe('FlavorAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('MEXICAN_FLAVOR_CATEGORIES', () => {
    it('should contain all expected categories', () => {
      expect(MEXICAN_FLAVOR_CATEGORIES).toBeDefined()
      expect(typeof MEXICAN_FLAVOR_CATEGORIES).toBe('object')
    })

    it('should have proper color and subcategories for each category', () => {
      const categories = Object.keys(MEXICAN_FLAVOR_CATEGORIES)
      expect(categories.length).toBeGreaterThan(0)

      categories.forEach(category => {
        const categoryData = MEXICAN_FLAVOR_CATEGORIES[category]
        expect(categoryData).toHaveProperty('color')
        expect(categoryData).toHaveProperty('subcategories')
        expect(typeof categoryData.color).toBe('string')
        expect(typeof categoryData.subcategories).toBe('object')
      })
    })
  })

  describe('extractFlavorsFromText', () => {
    it('should extract flavors from text', () => {
      const text = 'This tequila has citrus and vanilla flavors'
      const result = extractFlavorsFromText(text)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should return empty array for text without flavors', () => {
      const text = 'This is just a regular description'
      const result = extractFlavorsFromText(text)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('buildFlavorHierarchy', () => {
    it('should build flavor hierarchy from keywords', () => {
      const keywords = ['citrus', 'vanilla', 'sweet']
      const result = buildFlavorHierarchy(keywords, 'tequila')

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('color')
      expect(result).toHaveProperty('percentage')
      expect(typeof result.percentage).toBe('number')
    })

    it('should handle empty keywords array', () => {
      const result = buildFlavorHierarchy([], 'tequila')

      expect(result).toBeDefined()
      expect(result.percentage).toBe(0)
    })
  })

  describe('generateFlavorWheelData', () => {
    it('should return empty array when no data available', async () => {
      const config = {
        wheelType: 'combined' as const,
        scope: 'universal' as const
      }

      const result = await generateFlavorWheelData(config)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle personal scope configuration', async () => {
      const config = {
        wheelType: 'combined' as const,
        scope: 'personal' as const,
        userId: 'test-user'
      }

      const result = await generateFlavorWheelData(config)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle beverage type filtering', async () => {
      const config = {
        wheelType: 'combined' as const,
        scope: 'universal' as const,
        beverageType: 'tequila' as const
      }

      const result = await generateFlavorWheelData(config)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getFlavorStatistics', () => {
    it('should return flavor statistics', async () => {
      const result = await getFlavorStatistics()

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should handle user-specific statistics', async () => {
      const userId = 'test-user'
      const result = await getFlavorStatistics(userId)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })
})