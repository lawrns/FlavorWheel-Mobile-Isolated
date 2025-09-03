'use client'

import { useState, useEffect } from 'react'
import { statisticsService, AppStatistics } from '@/services/statistics-service'

interface UseStatisticsOptions {
  refreshInterval?: number // in milliseconds
  enableRealtime?: boolean
}

export function useStatistics(options: UseStatisticsOptions = {}) {
  const { refreshInterval = 300000, enableRealtime = false } = options // 5 minutes default

  const [statistics, setStatistics] = useState<AppStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStatistics = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const data = await statisticsService.getAppStatistics(forceRefresh)
      setStatistics(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
      console.error('Statistics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    fetchStatistics(true)
  }

  const clearCache = () => {
    statisticsService.clearCache()
    fetchStatistics(true)
  }

  useEffect(() => {
    // Initial fetch
    fetchStatistics()

    // Set up periodic refresh
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchStatistics()
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  useEffect(() => {
    // Set up real-time updates if enabled
    if (enableRealtime) {
      const updateInterval = setInterval(async () => {
        try {
          const realtimeStats = await statisticsService.getRealtimeStats()
          if (realtimeStats && statistics) {
            setStatistics(prev => prev ? { ...prev, ...realtimeStats } : null)
            setLastUpdated(new Date())
          }
        } catch (err) {
          console.error('Realtime stats error:', err)
        }
      }, 60000) // Update every minute

      return () => clearInterval(updateInterval)
    }
  }, [enableRealtime, statistics])

  return {
    statistics,
    loading,
    error,
    lastUpdated,
    refresh,
    clearCache
  }
}

// Specialized hooks for specific statistics
export function useUserStats() {
  const { statistics, ...rest } = useStatistics()

  return {
    totalUsers: statistics?.totalUsers || 0,
    activeUsers: statistics?.activeUsers || 0,
    ...rest
  }
}

export function useEngagementStats() {
  const { statistics, ...rest } = useStatistics()

  return {
    totalTastings: statistics?.totalTastings || 0,
    totalReviews: statistics?.totalReviews || 0,
    totalPhotos: statistics?.totalPhotos || 0,
    communityEngagement: statistics?.communityEngagement || 0,
    ...rest
  }
}

export function useTrendingStats() {
  const { statistics, ...rest } = useStatistics()

  return {
    trendingSpirits: statistics?.trendingSpirits || [],
    recentActivity: statistics?.recentActivity || [],
    topContributors: statistics?.topContributors || [],
    ...rest
  }
}
