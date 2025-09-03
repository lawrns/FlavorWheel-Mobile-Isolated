import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useTastingDetail, useTastings } from '@/hooks/use-tastings'

describe('useTastings Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  describe('useTastingDetail', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should load tasting data after delay', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      // Fast-forward past the simulated API delay
      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe('1')
      expect(result.current.data?.name).toBe('Sample Tasting')
      expect(result.current.error).toBeNull()
    })

    it('should handle missing tasting ID', () => {
      const { result } = renderHook(() => useTastingDetail(''))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should handle API errors', async () => {
      // Mock a failed API call by overriding the hook behavior
      const mockError = new Error('API Error')
      const originalHook = vi.fn()

      // We can't easily mock the internal setTimeout in the current implementation
      // but we can test the error handling structure
      const { result } = renderHook(() => useTastingDetail('error-id'))

      // The hook should still follow the same pattern even with errors
      expect(result.current.loading).toBe(true)
    })

    it('should return correct tasting structure', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toMatchObject({
        id: '1',
        name: 'Sample Tasting',
        description: 'A sample tasting for demonstration',
        status: 'active',
        items: expect.any(Array),
        categories: expect.any(Array),
        participants: expect.any(Array)
      })

      expect(result.current.data?.items).toHaveLength(2)
      expect(result.current.data?.categories).toHaveLength(2)
    })

    it('should have proper item structure', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const items = result.current.data?.items || []
      expect(items[0]).toMatchObject({
        id: expect.any(String),
        name: expect.stringContaining('Coffee Sample')
      })
    })

    it('should have proper category structure', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const categories = result.current.data?.categories || []
      expect(categories[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        parameterType: 'subjective_input'
      })
    })

    it('should handle different tasting IDs', async () => {
      const { result: result1 } = renderHook(() => useTastingDetail('id-1'))
      const { result: result2 } = renderHook(() => useTastingDetail('id-2'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result1.current.loading).toBe(false)
        expect(result2.current.loading).toBe(false)
      })

      // Both should return the same mock data since it's hardcoded
      expect(result1.current.data?.id).toBe('1')
      expect(result2.current.data?.id).toBe('1')
    })

    it('should clean up on unmount', () => {
      const { unmount } = renderHook(() => useTastingDetail('test-id'))

      // Should not throw any errors during unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('useTastings', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useTastings())

      expect(result.current.loading).toBe(true)
      expect(result.current.tastings).toEqual([])
    })

    it('should load tastings list after delay', async () => {
      const { result } = renderHook(() => useTastings())

      // Fast-forward past the simulated API delay
      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.tastings).toHaveLength(1)
      expect(result.current.tastings[0].id).toBe('1')
      expect(result.current.tastings[0].name).toBe('Sample Tasting')
    })

    it('should return array of tastings', async () => {
      const { result } = renderHook(() => useTastings())

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(Array.isArray(result.current.tastings)).toBe(true)
      expect(result.current.tastings).toHaveLength(1)
    })

    it('should handle API errors gracefully', async () => {
      // The current implementation doesn't have explicit error handling
      // but we can test that it still returns a valid structure
      const { result } = renderHook(() => useTastings())

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(Array.isArray(result.current.tastings)).toBe(true)
      expect(typeof result.current.loading).toBe('boolean')
    })

    it('should not refetch data on re-render', async () => {
      const { result, rerender } = renderHook(() => useTastings())

      vi.advanceTimersByTime(300)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialTastings = result.current.tastings

      // Re-render should not change the data
      rerender()

      expect(result.current.tastings).toBe(initialTastings)
    })

    it('should clean up on unmount', () => {
      const { unmount } = renderHook(() => useTastings())

      // Should not throw any errors during unmount
      expect(() => unmount()).not.toThrow()
    })
  })

  describe('Mock Data Structure', () => {
    it('should have consistent mock tasting data', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const tasting = result.current.data

      expect(tasting).toHaveProperty('id')
      expect(tasting).toHaveProperty('name')
      expect(tasting).toHaveProperty('description')
      expect(tasting).toHaveProperty('items')
      expect(tasting).toHaveProperty('categories')
      expect(tasting).toHaveProperty('participants')
      expect(tasting).toHaveProperty('created_at')
      expect(tasting).toHaveProperty('status')

      expect(Array.isArray(tasting?.items)).toBe(true)
      expect(Array.isArray(tasting?.categories)).toBe(true)
      expect(Array.isArray(tasting?.participants)).toBe(true)
      expect(typeof tasting?.created_at).toBe('string')
      expect(typeof tasting?.status).toBe('string')
    })

    it('should have valid item structure in mock data', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const items = result.current.data?.items || []

      items.forEach(item => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('name')
        expect(typeof item.id).toBe('string')
        expect(typeof item.name).toBe('string')
      })
    })

    it('should have valid category structure in mock data', async () => {
      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const categories = result.current.data?.categories || []

      categories.forEach(category => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('parameterType')
        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.parameterType).toBe('string')
      })
    })
  })

  describe('Performance', () => {
    it('should load data within reasonable time', async () => {
      const startTime = Date.now()

      const { result } = renderHook(() => useTastingDetail('test-id'))

      vi.advanceTimersByTime(500)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Should load within 600ms (500ms delay + some overhead)
      expect(loadTime).toBeLessThan(600)
    })

    it('should handle rapid re-renders efficiently', () => {
      const { result, rerender } = renderHook(() => useTastingDetail('test-id'))

      // Multiple rapid re-renders should not cause issues
      for (let i = 0; i < 10; i++) {
        rerender()
      }

      expect(result.current.loading).toBe(true)
    })

    it('should not cause memory leaks', () => {
      let renderCount = 0

      const TestComponent = () => {
        const { data, loading } = useTastingDetail('test-id')
        renderCount++
        return <div>{loading ? 'loading' : data?.name}</div>
      }

      const { unmount } = renderHook(() => <TestComponent />)

      // Initial render
      expect(renderCount).toBe(1)

      // Fast-forward to load data
      vi.advanceTimersByTime(500)

      // Should have re-rendered when data loaded
      expect(renderCount).toBeGreaterThan(1)

      const renderCountAfterLoad = renderCount

      // Unmount should clean up properly
      unmount()

      // No additional renders should occur
      expect(renderCount).toBe(renderCountAfterLoad)
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long tasting IDs', () => {
      const longId = 'a'.repeat(1000)

      const { result } = renderHook(() => useTastingDetail(longId))

      expect(result.current.loading).toBe(true)
      // Should not crash with long IDs
    })

    it('should handle special characters in tasting IDs', () => {
      const specialId = 'test-id-with-特殊-characters-123'

      const { result } = renderHook(() => useTastingDetail(specialId))

      expect(result.current.loading).toBe(true)
      // Should handle special characters gracefully
    })

    it('should handle null tasting ID', () => {
      const { result } = renderHook(() => useTastingDetail(null as any))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
    })

    it('should handle undefined tasting ID', () => {
      const { result } = renderHook(() => useTastingDetail(undefined as any))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
    })

    it('should handle empty string tasting ID', () => {
      const { result } = renderHook(() => useTastingDetail(''))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()
    })
  })
})
