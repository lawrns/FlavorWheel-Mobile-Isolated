import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStatistics, useUserStats, useEngagementStats, useTrendingStats } from '@/hooks/use-statistics'
import { statisticsService } from '@/services/statistics-service'

// Mock the statistics service
jest.mock('@/services/statistics-service', () => ({
  statisticsService: {
    getAppStatistics: jest.fn(),
    getRealtimeStats: jest.fn(),
    clearCache: jest.fn()
  }
}))

describe('useStatistics Hook', () => {
  const mockStatisticsData = {
    totalUsers: 1250,
    activeUsers: 890,
    totalTastings: 3456,
    totalReviews: 2341,
    totalPhotos: 1876,
    communityEngagement: 78.5,
    trendingSpirits: [
      { name: 'Tequila', count: 450 },
      { name: 'Mezcal', count: 380 },
      { name: 'Pulque', count: 120 }
    ],
    recentActivity: [
      { type: 'tasting_completed', user: 'John Doe', timestamp: '2024-01-01T10:00:00Z' },
      { type: 'review_added', user: 'Jane Smith', timestamp: '2024-01-01T09:30:00Z' }
    ],
    topContributors: [
      { user: 'Maria Garcia', tastings: 45 },
      { user: 'Carlos Rodriguez', tastings: 38 },
      { user: 'Ana Lopez', tastings: 32 }
    ]
  }

  const mockRealtimeStats = {
    activeUsers: 920,
    recentActivity: [
      { type: 'user_joined', user: 'New User', timestamp: '2024-01-01T11:00:00Z' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    jest.mocked(statisticsService.getAppStatistics).mockResolvedValue(mockStatisticsData)
    jest.mocked(statisticsService.getRealtimeStats).mockResolvedValue(mockRealtimeStats)
    jest.mocked(statisticsService.clearCache).mockImplementation(() => {})
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('useStatistics', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useStatistics())

      expect(result.current.loading).toBe(true)
      expect(result.current.statistics).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeNull()
    })

    it('should load statistics on mount', async () => {
      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.statistics).toEqual(mockStatisticsData)
      expect(result.current.error).toBeNull()
      expect(result.current.lastUpdated).toBeInstanceOf(Date)
      expect(statisticsService.getAppStatistics).toHaveBeenCalledWith(false)
    })

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to fetch statistics'
      jest.mocked(statisticsService.getAppStatistics).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
      expect(result.current.statistics).toBeNull()
    })

    it('should refresh statistics when refresh is called', async () => {
      const { result } = renderHook(() => useStatistics())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Call refresh
      act(() => {
        result.current.refresh()
      })

      expect(statisticsService.getAppStatistics).toHaveBeenCalledWith(true)
    })

    it('should clear cache and refresh when clearCache is called', async () => {
      const { result } = renderHook(() => useStatistics())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Call clearCache
      act(() => {
        result.current.clearCache()
      })

      expect(statisticsService.clearCache).toHaveBeenCalled()
      expect(statisticsService.getAppStatistics).toHaveBeenCalledWith(true)
    })

    it('should set up periodic refresh with custom interval', async () => {
      vi.useFakeTimers()

      const refreshInterval = 10000 // 10 seconds
      const { result } = renderHook(() => useStatistics({ refreshInterval }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(refreshInterval)
      })

      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(2)
    })

    it('should disable periodic refresh when interval is 0', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useStatistics({ refreshInterval: 0 }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(60000) // 1 minute
      })

      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(1)
    })

    it('should enable real-time updates when enabled', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useStatistics({ enableRealtime: true }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fast-forward time for real-time update (1 minute)
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      expect(statisticsService.getRealtimeStats).toHaveBeenCalled()
    })

    it('should update statistics with real-time data', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() => useStatistics({ enableRealtime: true }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialStats = result.current.statistics

      // Fast-forward time for real-time update
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      await waitFor(() => {
        expect(result.current.statistics?.activeUsers).toBe(920)
      })

      expect(result.current.lastUpdated).toBeInstanceOf(Date)
    })

    it('should handle real-time update errors gracefully', async () => {
      vi.useFakeTimers()

      jest.mocked(statisticsService.getRealtimeStats).mockRejectedValue(new Error('Realtime error'))

      const { result } = renderHook(() => useStatistics({ enableRealtime: true }))

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fast-forward time for real-time update
      act(() => {
        vi.advanceTimersByTime(60000)
      })

      // Should not throw error, should continue with existing data
      expect(result.current.statistics).toEqual(mockStatisticsData)
      expect(result.current.error).toBeNull()
    })

    it('should clean up intervals on unmount', () => {
      vi.useFakeTimers()

      const { unmount } = renderHook(() => useStatistics({ refreshInterval: 1000 }))

      // Wait for initial load
      waitFor(() => {
        expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(1)
      })

      unmount()

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      // Should not call getAppStatistics again after unmount
      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(1)
    })
  })

  describe('useUserStats', () => {
    it('should return user-specific statistics', async () => {
      const { result } = renderHook(() => useUserStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalUsers).toBe(1250)
      expect(result.current.activeUsers).toBe(890)
      expect(result.current.statistics).toEqual(mockStatisticsData)
    })

    it('should return zero values when no statistics available', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockResolvedValue(null as any)

      const { result } = renderHook(() => useUserStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalUsers).toBe(0)
      expect(result.current.activeUsers).toBe(0)
    })
  })

  describe('useEngagementStats', () => {
    it('should return engagement-specific statistics', async () => {
      const { result } = renderHook(() => useEngagementStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalTastings).toBe(3456)
      expect(result.current.totalReviews).toBe(2341)
      expect(result.current.totalPhotos).toBe(1876)
      expect(result.current.communityEngagement).toBe(78.5)
    })

    it('should return zero values when no statistics available', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockResolvedValue(null as any)

      const { result } = renderHook(() => useEngagementStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.totalTastings).toBe(0)
      expect(result.current.totalReviews).toBe(0)
      expect(result.current.totalPhotos).toBe(0)
      expect(result.current.communityEngagement).toBe(0)
    })
  })

  describe('useTrendingStats', () => {
    it('should return trending-specific statistics', async () => {
      const { result } = renderHook(() => useTrendingStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.trendingSpirits).toEqual(mockStatisticsData.trendingSpirits)
      expect(result.current.recentActivity).toEqual(mockStatisticsData.recentActivity)
      expect(result.current.topContributors).toEqual(mockStatisticsData.topContributors)
    })

    it('should return empty arrays when no statistics available', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockResolvedValue(null as any)

      const { result } = renderHook(() => useTrendingStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.trendingSpirits).toEqual([])
      expect(result.current.recentActivity).toEqual([])
      expect(result.current.topContributors).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors during initial load', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockRejectedValue(
        new Error('Network connection failed')
      )

      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network connection failed')
      expect(result.current.statistics).toBeNull()
    })

    it('should handle malformed response data', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockResolvedValue({
        invalidField: 'invalid'
      } as any)

      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.statistics).toEqual({ invalidField: 'invalid' })
      expect(result.current.error).toBeNull()
    })

    it('should handle non-Error objects thrown', async () => {
      jest.mocked(statisticsService.getAppStatistics).mockRejectedValue('String error')

      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load statistics')
    })
  })

  describe('Performance and Memory Management', () => {
    it('should not cause unnecessary re-renders', async () => {
      let renderCount = 0

      const TestComponent = () => {
        const { statistics } = useStatistics()
        renderCount++
        return <div>{statistics ? 'loaded' : 'loading'}</div>
      }

      const { rerender } = renderHook(() => <TestComponent />)

      // Initial render
      expect(renderCount).toBe(1)

      // Wait for data load
      await waitFor(() => {
        expect(renderCount).toBeGreaterThan(1)
      })

      const initialRenderCount = renderCount

      // Re-render should not cause additional renders beyond the data load
      rerender()
      expect(renderCount).toBe(initialRenderCount)
    })

    it('should clean up all timers on unmount', () => {
      vi.useFakeTimers()

      const { unmount } = renderHook(() =>
        useStatistics({ refreshInterval: 1000, enableRealtime: true })
      )

      unmount()

      // Fast-forward time significantly
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Should not have called services after unmount
      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(1)
      expect(statisticsService.getRealtimeStats).toHaveBeenCalledTimes(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle extremely long refresh intervals', async () => {
      vi.useFakeTimers()

      const { result } = renderHook(() =>
        useStatistics({ refreshInterval: 24 * 60 * 60 * 1000 }) // 24 hours
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Fast-forward 1 hour
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000)
      })

      // Should not have refreshed yet
      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid refresh calls', async () => {
      const { result } = renderHook(() => useStatistics())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Call refresh multiple times rapidly
      act(() => {
        result.current.refresh()
        result.current.refresh()
        result.current.refresh()
      })

      // Should have been called initial + 3 refresh calls
      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(4)
    })

    it('should handle clearCache calls during loading', async () => {
      // Delay the service response
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      jest.mocked(statisticsService.getAppStatistics).mockReturnValue(delayedPromise as any)

      const { result } = renderHook(() => useStatistics())

      // Call clearCache while still loading
      act(() => {
        result.current.clearCache()
      })

      // Resolve the initial promise
      act(() => {
        resolvePromise!(mockStatisticsData)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have called getAppStatistics twice (initial + clearCache)
      expect(statisticsService.getAppStatistics).toHaveBeenCalledTimes(2)
    })
  })
})
