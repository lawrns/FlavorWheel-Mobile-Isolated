/**
 * Unit tests for Quick Tasting Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { createQuickTasting, getUserQuickTastings, getQuickTastingById } from '@/services/quick-tasting-service'
import { supabase } from '@/lib/supabase'

// Mock Supabase
import { vi } from 'vitest'
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    }))
  }
}))

describe('Quick Tasting Service', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  const mockTastingData = {
    productType: 'wine',
    productName: 'Test Wine',
    selectedFlavors: ['Berry', 'Oak'],
    overallRating: 8,
    notes: 'Great wine with good balance'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createQuickTasting', () => {
    it('should create a quick tasting successfully', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful database operations
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'tasting-123' },
            error: null
          })
        }))
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      const result = await createQuickTasting(mockTastingData)

      expect(result.success).toBe(true)
      expect(result.tastingId).toBe('tasting-123')
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle authentication errors', async () => {
      // Mock authentication error
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const result = await createQuickTasting(mockTastingData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('sign in')
    })

    it('should handle validation errors', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Test with invalid data (no flavors)
      const invalidData = {
        ...mockTastingData,
        selectedFlavors: []
      }

      const result = await createQuickTasting(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('flavor')
    })

    it('should handle database errors', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock database error
      const mockInsert = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Database error')
          })
        }))
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert
      })

      const result = await createQuickTasting(mockTastingData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('try again')
    })
  })

  describe('getUserQuickTastings', () => {
    it('should retrieve user quick tastings successfully', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful query
      const mockTastings = [
        {
          id: 'tasting-123',
          name: 'Test Wine Quick Tasting',
          type: 'quick',
          created_at: '2024-01-01T00:00:00Z',
          tasting_data: mockTastingData
        }
      ]

      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockTastings,
              error: null
            })
          }))
        }))
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      })

      const result = await getUserQuickTastings()

      expect(result).toEqual(mockTastings)
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should handle authentication errors', async () => {
      // Mock authentication error
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      await expect(getUserQuickTastings()).rejects.toThrow('Authentication required')
    })

    it('should handle database errors', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock database error
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          }))
        }))
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      })

      await expect(getUserQuickTastings()).rejects.toThrow()
    })
  })

  describe('getQuickTastingById', () => {
    it('should retrieve a specific quick tasting successfully', async () => {
      const tastingId = 'tasting-123'

      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock successful query
      const mockTasting = {
        id: tastingId,
        name: 'Test Wine Quick Tasting',
        type: 'quick',
        created_at: '2024-01-01T00:00:00Z',
        tasting_data: mockTastingData
      }

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockTasting,
        error: null
      })

      const mockOrder = jest.fn(() => ({
        single: mockSingle
      }))

      const mockEq = jest.fn(() => ({
        order: mockOrder
      }))

      const mockSelect = jest.fn(() => ({
        eq: mockEq
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect
      })

      const result = await getQuickTastingById(tastingId)

      expect(result).toEqual(mockTasting)
      expect(mockEq).toHaveBeenCalledWith('id', tastingId)
      expect(mockEq).toHaveBeenCalledWith('created_by', mockUser.id)
      expect(mockEq).toHaveBeenCalledWith('type', 'quick')
    })

    it('should handle authentication errors', async () => {
      // Mock authentication error
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      await expect(getQuickTastingById('tasting-123')).rejects.toThrow('Authentication required')
    })

    it('should handle not found errors', async () => {
      // Mock successful user authentication
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock not found error
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Not found')
      })

      const mockOrder = jest.fn(() => ({
        single: mockSingle
      }))

      const mockEq = jest.fn(() => ({
        order: mockOrder
      }))

      const mockSelect = jest.fn(() => ({
        select: mockSelect
      }))

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              single: mockSingle
            }))
          }))
        }))
      })

      await expect(getQuickTastingById('tasting-123')).rejects.toThrow()
    })
  })
})
