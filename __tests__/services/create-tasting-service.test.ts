import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { jest } from '@jest/globals'
import { vi } from 'vitest'
import {
  getProductTypes,
  getTemplates,
  getTemplateById,
  createTasting,
  updateTasting,
  deleteTasting,
  addTastingItem,
  updateTastingItem,
  removeTastingItem,
  addTastingCategory,
  updateTastingCategory,
  removeTastingCategory,
  getTastingById,
  validateTastingData,
  duplicateTasting
} from '@/services/create-tasting-service'
import { createUser, createBeverage } from '@/test-utils/factories'
// import { mockSupabaseResponse } from '@/test-utils/test-utils'

// Local helper to mock Supabase responses
const mockSupabaseResponse = (data: any, error?: any) => ({ data, error })


// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    }))
  }
}))

describe('CreateTastingService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getProductTypes', () => {
    it('should retrieve all product types', async () => {
      const mockProductTypes = [
        {
          id: 'tequila',
          name: 'tequila',
          display_name: 'Tequila',
          description: 'Premium Mexican spirit',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'mezcal',
          name: 'mezcal',
          display_name: 'Mezcal',
          description: 'Traditional Mexican spirit',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockSupabaseResponse(mockProductTypes))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getProductTypes()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('display_name')
      expect(result[0].display_name).toBe('Tequila')
    })

    it('should handle empty product types', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockSupabaseResponse([]))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getProductTypes()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should handle database errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: 'Database error' }))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      await expect(getProductTypes()).rejects.toThrow()
    })
  })

  describe('getTemplates', () => {
    it('should retrieve templates with filters', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Premium Tequila Tasting',
          description: 'Professional tequila evaluation',
          difficulty_level: 'professional',
          duration: 90,
          is_public: true,
          is_featured: true,
          usage_count: 150,
          average_rating: 4.8,
          rating_count: 45,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTemplates))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getTemplates({
        difficulty: 'professional',
        isPublic: true,
        limit: 10
      })

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0].difficulty_level).toBe('professional')
      expect(mockQuery.eq).toHaveBeenCalledWith('difficulty_level', 'professional')
      expect(mockQuery.eq).toHaveBeenCalledWith('is_public', true)
    })

    it('should retrieve featured templates', async () => {
      const mockTemplates = [
        {
          id: 'featured-1',
          name: 'Featured Template',
          is_featured: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTemplates))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getTemplates({ featured: true })

      expect(result.length).toBe(1)
      expect(result[0].is_featured).toBe(true)
    })
  })

  describe('getTemplateById', () => {
    it('should retrieve template by ID with categories', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Premium Template',
        template_categories: [
          {
            id: 'cat-1',
            name: 'Aroma',
            parameter_type: 'subjective_input',
            sort_order: 1
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTemplate))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getTemplateById('template-1')

      expect(result).toHaveProperty('id', 'template-1')
      expect(result).toHaveProperty('template_categories')
      expect(Array.isArray(result.template_categories)).toBe(true)
    })

    it('should return null for non-existent template', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(null))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getTemplateById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('createTasting', () => {
    it('should create a new tasting with items and categories', async () => {
      const tastingData = {
        name: 'New Tasting Session',
        description: 'A comprehensive tasting',
        mode: 'study' as const,
        productTypeId: 'tequila',
        templateId: 'template-1',
        categories: [
          {
            name: 'Aroma',
            parameterType: 'subjective_input' as const,
            sortOrder: 1
          }
        ],
        items: [
          {
            name: 'Premium Tequila',
            image: null
          }
        ]
      }

      const mockCreatedTasting = {
        id: 'tasting-123',
        ...tastingData,
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await createTasting(tastingData, 'user-123')

      expect(result).toHaveProperty('id', 'tasting-123')
      expect(result.name).toBe('New Tasting Session')
      expect(mockQuery.insert).toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const invalidData = {
        name: '',
        description: 'Test',
        mode: 'study' as const
      }

      await expect(createTasting(invalidData as any, 'user-123')).rejects.toThrow()
    })

    it('should handle template-based creation', async () => {
      const tastingData = {
        name: 'Template-based Tasting',
        mode: 'study' as const,
        templateId: 'template-123'
      }

      const mockTemplate = {
        id: 'template-123',
        name: 'Premium Template',
        template_categories: [
          { name: 'Aroma', parameter_type: 'subjective_input', sort_order: 1 }
        ]
      }

      const mockCreatedTasting = {
        id: 'tasting-456',
        ...tastingData,
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockTemplateQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTemplate))
      }

      const mockTastingQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from)
        .mockReturnValueOnce(mockTemplateQuery as any)
        .mockReturnValueOnce(mockTastingQuery as any)

      const result = await createTasting(tastingData, 'user-123')

      expect(result).toHaveProperty('id', 'tasting-456')
    })
  })

  describe('updateTasting', () => {
    it('should update tasting details', async () => {
      const updateData = {
        name: 'Updated Tasting Name',
        description: 'Updated description'
      }

      const mockUpdatedTasting = {
        id: 'tasting-123',
        name: 'Updated Tasting Name',
        description: 'Updated description',
        updated_at: '2024-01-02T00:00:00Z'
      }

      const mockQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockUpdatedTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await updateTasting('tasting-123', updateData)

      expect(result.name).toBe('Updated Tasting Name')
      expect(result.description).toBe('Updated description')
      expect(mockQuery.update).toHaveBeenCalledWith(updateData)
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'tasting-123')
    })
  })

  describe('deleteTasting', () => {
    it('should delete tasting and related data', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      await expect(deleteTasting('tasting-123')).resolves.toBeUndefined()

      expect(mockQuery.delete).toHaveBeenCalled()
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'tasting-123')
    })
  })

  describe('Tasting Items Management', () => {
    describe('addTastingItem', () => {
      it('should add item to tasting', async () => {
        const itemData = {
          name: 'New Tequila',
          image: null
        }

        const mockCreatedItem = {
          id: 'item-123',
          tasting_id: 'tasting-456',
          name: 'New Tequila',
          sort_order: 1,
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedItem))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await addTastingItem('tasting-456', itemData)

        expect(result).toHaveProperty('id', 'item-123')
        expect(result.name).toBe('New Tequila')
        expect(mockQuery.insert).toHaveBeenCalled()
      })
    })

    describe('updateTastingItem', () => {
      it('should update tasting item', async () => {
        const updateData = {
          name: 'Updated Item Name'
        }

        const mockUpdatedItem = {
          id: 'item-123',
          name: 'Updated Item Name',
          updated_at: '2024-01-02T00:00:00Z'
        }

        const mockQuery = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockUpdatedItem))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await updateTastingItem('item-123', updateData)

        expect(result.name).toBe('Updated Item Name')
      })
    })

    describe('removeTastingItem', () => {
      it('should remove tasting item', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        await expect(removeTastingItem('item-123')).resolves.toBeUndefined()
      })
    })
  })

  describe('Tasting Categories Management', () => {
    describe('addTastingCategory', () => {
      it('should add category to tasting', async () => {
        const categoryData = {
          name: 'New Category',
          parameterType: 'subjective_input' as const,
          sortOrder: 1
        }

        const mockCreatedCategory = {
          id: 'category-123',
          tasting_id: 'tasting-456',
          name: 'New Category',
          parameter_type: 'subjective_input',
          sort_order: 1,
          created_at: '2024-01-01T00:00:00Z'
        }

        const mockQuery = {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockCreatedCategory))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await addTastingCategory('tasting-456', categoryData)

        expect(result).toHaveProperty('id', 'category-123')
        expect(result.name).toBe('New Category')
      })
    })

    describe('updateTastingCategory', () => {
      it('should update tasting category', async () => {
        const updateData = {
          name: 'Updated Category Name'
        }

        const mockUpdatedCategory = {
          id: 'category-123',
          name: 'Updated Category Name',
          updated_at: '2024-01-02T00:00:00Z'
        }

        const mockQuery = {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockUpdatedCategory))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        const result = await updateTastingCategory('category-123', updateData)

        expect(result.name).toBe('Updated Category Name')
      })
    })

    describe('removeTastingCategory', () => {
      it('should remove tasting category', async () => {
        const mockQuery = {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue(mockSupabaseResponse({}))
        }

        const mockSupabase = await import('@/lib/supabase')
        jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

        await expect(removeTastingCategory('category-123')).resolves.toBeUndefined()
      })
    })
  })

  describe('getTastingById', () => {
    it('should retrieve complete tasting with items and categories', async () => {
      const mockTasting = {
        id: 'tasting-123',
        name: 'Complete Tasting',
        description: 'Full tasting data',
        tasting_items: [
          {
            id: 'item-1',
            name: 'Tequila 1',
            sort_order: 1
          }
        ],
        tasting_categories: [
          {
            id: 'cat-1',
            name: 'Aroma',
            parameter_type: 'subjective_input',
            sort_order: 1
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      }

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const result = await getTastingById('tasting-123')

      expect(result).toHaveProperty('id', 'tasting-123')
      expect(result).toHaveProperty('tasting_items')
      expect(result).toHaveProperty('tasting_categories')
      expect(Array.isArray(result.tasting_items)).toBe(true)
      expect(Array.isArray(result.tasting_categories)).toBe(true)
    })
  })

  describe('validateTastingData', () => {
    it('should validate complete tasting data', () => {
      const validData = {
        name: 'Valid Tasting',
        description: 'Valid description',
        mode: 'study' as const,
        categories: [
          {
            name: 'Aroma',
            parameterType: 'subjective_input' as const
          }
        ],
        items: [
          {
            name: 'Valid Item'
          }
        ]
      }

      const result = validateTastingData(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject invalid tasting data', () => {
      const invalidData = {
        name: '',
        description: '',
        mode: 'invalid' as any,
        categories: [],
        items: []
      }

      const result = validateTastingData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate category requirements', () => {
      const dataWithoutCategories = {
        name: 'Tasting without categories',
        mode: 'study' as const,
        categories: [],
        items: [{ name: 'Item' }]
      }

      const result = validateTastingData(dataWithoutCategories)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one category is required')
    })

    it('should validate item requirements', () => {
      const dataWithoutItems = {
        name: 'Tasting without items',
        mode: 'study' as const,
        categories: [{ name: 'Category', parameterType: 'subjective_input' as const }],
        items: []
      }

      const result = validateTastingData(dataWithoutItems)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least one item is required')
    })
  })

  describe('duplicateTasting', () => {
    it('should duplicate tasting with new name', async () => {
      const mockOriginalTasting = {
        id: 'original-123',
        name: 'Original Tasting',
        description: 'Original description',
        mode: 'study',
        tasting_items: [
          { id: 'item-1', name: 'Item 1', sort_order: 1 }
        ],
        tasting_categories: [
          { id: 'cat-1', name: 'Category 1', parameter_type: 'subjective_input', sort_order: 1 }
        ]
      }

      const mockDuplicatedTasting = {
        id: 'duplicate-456',
        name: 'Original Tasting (Copy)',
        description: 'Original description',
        created_at: '2024-01-02T00:00:00Z'
      }

      const mockGetQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockOriginalTasting))
      }

      const mockCreateQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockDuplicatedTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from)
        .mockReturnValueOnce(mockGetQuery as any)
        .mockReturnValueOnce(mockCreateQuery as any)

      const result = await duplicateTasting('original-123', 'user-456')

      expect(result).toHaveProperty('id', 'duplicate-456')
      expect(result.name).toBe('Original Tasting (Copy)')
    })

    it('should handle custom duplicate name', async () => {
      const mockOriginalTasting = {
        id: 'original-123',
        name: 'Original Tasting',
        description: 'Original description',
        mode: 'study'
      }

      const mockDuplicatedTasting = {
        id: 'duplicate-789',
        name: 'My Custom Duplicate',
        created_at: '2024-01-02T00:00:00Z'
      }

      const mockGetQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(mockSupabaseResponse(mockOriginalTasting))
      }

      const mockCreateQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(mockDuplicatedTasting))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from)
        .mockReturnValueOnce(mockGetQuery as any)
        .mockReturnValueOnce(mockCreateQuery as any)

      const result = await duplicateTasting('original-123', 'user-456', 'My Custom Duplicate')

      expect(result.name).toBe('My Custom Duplicate')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle concurrent operations', async () => {
      const operations = [
        createTasting({
          name: 'Concurrent Tasting 1',
          mode: 'study' as const,
          categories: [{ name: 'Aroma', parameterType: 'subjective_input' as const }],
          items: [{ name: 'Item 1' }]
        }, 'user-123'),
        createTasting({
          name: 'Concurrent Tasting 2',
          mode: 'study' as const,
          categories: [{ name: 'Flavor', parameterType: 'subjective_input' as const }],
          items: [{ name: 'Item 2' }]
        }, 'user-123')
      ]

      const mockCreatedTastings = [
        { id: 'tasting-1', name: 'Concurrent Tasting 1' },
        { id: 'tasting-2', name: 'Concurrent Tasting 2' }
      ]

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce(mockSupabaseResponse(mockCreatedTastings[0]))
          .mockResolvedValueOnce(mockSupabaseResponse(mockCreatedTastings[1]))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const results = await Promise.all(operations)

      expect(results).toHaveLength(2)
      expect(results[0]).toHaveProperty('id', 'tasting-1')
      expect(results[1]).toHaveProperty('id', 'tasting-2')
    })

    it('should handle database transaction failures', async () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockSupabaseResponse(null, { message: 'Transaction failed' }))
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      const tastingData = {
        name: 'Failed Tasting',
        mode: 'study' as const,
        categories: [{ name: 'Aroma', parameterType: 'subjective_input' as const }],
        items: [{ name: 'Item' }]
      }

      await expect(createTasting(tastingData, 'user-123')).rejects.toThrow()
    })

    it('should handle network timeouts gracefully', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockImplementation(() => {
          throw new Error('Network timeout')
        })
      }

      const mockSupabase = await import('@/lib/supabase')
      jest.mocked(mockSupabase.supabase.from).mockReturnValue(mockQuery as any)

      await expect(getProductTypes()).rejects.toThrow('Network timeout')
    })
  })
})
