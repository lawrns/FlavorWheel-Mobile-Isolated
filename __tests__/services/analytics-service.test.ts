import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import {
  generateFlavorWheel,
  storeTastingResults,
  getTastingResults
} from '@/services/analytics-service'
import { createUser, createTasting, createReview } from '@/test-utils/factories'

// Mock utility function
const mockSupabaseResponse = (data: any, error?: any) => ({
  data,
  error
})

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: [],
      error: null
    }))
  }
}))

jest.mock('@/lib/flavor-utils', () => ({
  extractFlavorDescriptorsMultilingual: jest.fn(() => ['citrus', 'vanilla'])
}))

jest.mock('@/services/flavor-dictionary-service', () => ({
  getMexicanFlavorDictionary: jest.fn(() => ({
    categories: {
      Frutal: { descriptors: ['citrus', 'orange'] },
      Dulce: { descriptors: ['vanilla', 'sweet'] }
    }
  }))
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}))

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('generateFlavorWheel', () => {
    it('should generate flavor wheel for personal scope', async () => {
      const config = {
        wheelType: 'flavor' as const,
        scope: 'personal' as const,
        userId: 'user-123',
        useMultilingualExtraction: true
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse([
          { id: '1', notes: 'citrus vanilla smoke', created_at: new Date() }
        ])),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }

      // Mock the supabase query
      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await generateFlavorWheel(config)

      expect(result).toBeDefined()
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('statistics')
    })

    it('should generate flavor wheel for universal scope', async () => {
      const config = {
        wheelType: 'flavor' as const,
        scope: 'universal' as const,
        useMultilingualExtraction: true
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSupabaseResponse([
          { id: '1', notes: 'citrus vanilla smoke', created_at: new Date() }
        ]))
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await generateFlavorWheel(config)

      expect(result).toBeDefined()
      expect(result.data).toHaveProperty('name')
    })

    it('should handle empty reviews gracefully', async () => {
      const config = {
        wheelType: 'flavor' as const,
        scope: 'personal' as const,
        userId: 'user-123'
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await generateFlavorWheel(config)

      expect(result).toBeDefined()
      expect(result.statistics.totalTastings).toBe(0)
    })

    it('should handle database errors', async () => {
      const config = {
        wheelType: 'flavor' as const,
        scope: 'personal' as const,
        userId: 'user-123'
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: 'Database error' })),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(generateFlavorWheel(config)).rejects.toThrow()
    })

    it('should support multilingual extraction', async () => {
      const config = {
        wheelType: 'flavor' as const,
        scope: 'personal' as const,
        userId: 'user-123',
        useMultilingualExtraction: true
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse([
          { id: '1', notes: 'citrus cítricos vanilla vainilla', created_at: new Date() }
        ])),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await generateFlavorWheel(config)

      expect(result).toBeDefined()
      expect(result.data).toBeDefined()
    })
  })

  describe('storeTastingResults', () => {
    it('should store tasting results successfully', async () => {
      const tastingResults = {
        tastingId: 'tasting-123',
        userId: 'user-456',
        results: [
          { categoryId: 'cat-1', value: 8, notes: 'Very citrusy' },
          { categoryId: 'cat-2', value: 6, notes: 'Sweet vanilla' }
        ]
      }

      const mockQuery = {
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse({ id: 'result-123' })),
        upsert: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const result = await storeTastingResults(tastingResults)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle database errors during storage', async () => {
      const tastingResults = {
        tastingId: 'tasting-123',
        userId: 'user-456',
        results: []
      }

      const mockQuery = {
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: 'Insert failed' })),
        upsert: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      await expect(storeTastingResults(tastingResults)).rejects.toThrow()
    })
  })

  describe('getTastingResults', () => {
    it('should retrieve user tasting results', async () => {
      const userId = 'user-123'

      const mockResults = [
        {
          id: 'result-1',
          tasting_id: 'tasting-1',
          results: [
            { categoryId: 'cat-1', value: 8 },
            { categoryId: 'cat-2', value: 6 }
          ],
          created_at: new Date().toISOString()
        }
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockResults)),
        order: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const results = await getTastingResults(userId)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
      expect(results[0]).toHaveProperty('id')
      expect(results[0]).toHaveProperty('results')
    })

    it('should handle missing user data', async () => {
      const userId = 'non-existent-user'

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
        order: jest.fn().mockReturnThis()
      }

      const mockSupabase = await import('@/lib/supabase')
      ;(mockSupabase.supabase.from as jest.Mock).mockReturnValue(mockQuery)

      const results = await getTastingResults(userId)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })
  })
})