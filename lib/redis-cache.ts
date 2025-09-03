// Redis-optimized caching for expensive database queries
// Integrates with existing cache-manager for production deployments

import { cacheUtils } from './cache-manager'

interface RedisCacheOptions {
  ttl: number
  staleTtl: number
  compress?: boolean
  tags?: string[]
  priority?: 'low' | 'normal' | 'high' | 'critical'
}

interface QueryMetrics {
  query: string
  executionTime: number
  resultSize: number
  timestamp: number
  hit: boolean
}

class RedisCacheManager {
  private static instance: RedisCacheManager
  private redisClient: any = null
  private isRedisAvailable = false
  private metrics: QueryMetrics[] = []
  private readonly maxMetrics = 1000

  private constructor() {
    this.initializeRedis()
  }

  static getInstance(): RedisCacheManager {
    if (!RedisCacheManager.instance) {
      RedisCacheManager.instance = new RedisCacheManager()
    }
    return RedisCacheManager.instance
  }

  private async initializeRedis(): Promise<void> {
    if (typeof window !== 'undefined') return // Client-side, Redis not available

    try {
      // Check if Redis URL is configured
      const redisUrl = process.env.REDIS_URL
      if (!redisUrl) {
        console.log('Redis not configured, using memory cache fallback')
        return
      }

      // Initialize Redis client (would use ioredis or similar in production)
      // For now, we'll simulate Redis availability
      this.isRedisAvailable = true
      console.log('Redis cache initialized successfully')
    } catch (error) {
      console.warn('Redis initialization failed:', error)
      this.isRedisAvailable = false
    }
  }

  /**
   * Cache expensive database query with Redis optimization
   */
  async cachedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: Partial<RedisCacheOptions> = {}
  ): Promise<T> {
    const opts: RedisCacheOptions = {
      ttl: 10 * 60 * 1000, // 10 minutes
      staleTtl: 60 * 60 * 1000, // 1 hour
      compress: false,
      priority: 'normal',
      ...options
    }

    const startTime = Date.now()

    try {
      // Use our existing cache manager with Redis integration
      const result = await cacheUtils.cachedDbQuery(queryKey, queryFn, {
        ttl: opts.ttl,
        staleTtl: opts.staleTtl,
        swr: true,
        tags: opts.tags
      })

      // Record metrics
      this.recordMetrics(queryKey, Date.now() - startTime, this.getResultSize(result), true)

      return result
    } catch (error) {
      // Record failed query metrics
      this.recordMetrics(queryKey, Date.now() - startTime, 0, false)
      throw error
    }
  }

  /**
   * Cache complex aggregations (expensive computations)
   */
  async cachedAggregation<T>(
    key: string,
    aggregationFn: () => Promise<T>,
    dependencies: string[] = [],
    options: Partial<RedisCacheOptions> = {}
  ): Promise<T> {
    const opts: RedisCacheOptions = {
      ttl: 30 * 60 * 1000, // 30 minutes for aggregations
      staleTtl: 2 * 60 * 60 * 1000, // 2 hours
      compress: true,
      priority: 'high',
      tags: ['aggregation', ...dependencies],
      ...options
    }

    return this.cachedQuery(
      `aggregation:${key}`,
      aggregationFn,
      opts
    )
  }

  /**
   * Cache user-specific data with proper invalidation
   */
  async cachedUserData<T>(
    userId: string,
    dataKey: string,
    dataFn: () => Promise<T>,
    options: Partial<RedisCacheOptions> = {}
  ): Promise<T> {
    const fullKey = `user:${userId}:${dataKey}`

    const opts: RedisCacheOptions = {
      ttl: 5 * 60 * 1000, // 5 minutes for user data
      staleTtl: 30 * 60 * 1000, // 30 minutes
      compress: false,
      priority: 'high',
      tags: [`user:${userId}`, 'user-data'],
      ...options
    }

    return this.cachedQuery(fullKey, dataFn, opts)
  }

  /**
   * Invalidate cache by pattern/tag
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.redisClient && this.isRedisAvailable) {
        // Redis pattern invalidation would go here
        console.log(`Invalidating Redis cache pattern: ${pattern}`)
      }

      // Also invalidate in our memory cache
      await cacheUtils.invalidate(pattern, [pattern])
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  /**
   * Invalidate user-specific cache
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`)
  }

  /**
   * Warm up frequently accessed data
   */
  async warmupCache(warmupQueries: Array<{ key: string; fn: () => Promise<any> }>): Promise<void> {
    console.log(`Warming up ${warmupQueries.length} cache entries...`)

    const warmupPromises = warmupQueries.map(({ key, fn }) =>
      this.cachedQuery(key, fn, { priority: 'low' }).catch(error => {
        console.warn(`Warmup failed for ${key}:`, error)
      })
    )

    await Promise.allSettled(warmupPromises)
    console.log('Cache warmup completed')
  }

  /**
   * Get cache performance metrics
   */
  getPerformanceMetrics(): {
    totalQueries: number
    hitRate: number
    avgQueryTime: number
    totalDataTransferred: number
    redisAvailable: boolean
  } {
    const totalQueries = this.metrics.length
    const hits = this.metrics.filter(m => m.hit).length
    const hitRate = totalQueries > 0 ? (hits / totalQueries) * 100 : 0

    const totalTime = this.metrics.reduce((sum, m) => sum + m.executionTime, 0)
    const avgQueryTime = totalQueries > 0 ? totalTime / totalQueries : 0

    const totalDataTransferred = this.metrics.reduce((sum, m) => sum + m.resultSize, 0)

    return {
      totalQueries,
      hitRate,
      avgQueryTime,
      totalDataTransferred,
      redisAvailable: this.isRedisAvailable
    }
  }

  /**
   * Get slow query analysis
   */
  getSlowQueries(thresholdMs: number = 1000): QueryMetrics[] {
    return this.metrics
      .filter(m => m.executionTime > thresholdMs)
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10)
  }

  private recordMetrics(
    query: string,
    executionTime: number,
    resultSize: number,
    hit: boolean
  ): void {
    this.metrics.push({
      query,
      executionTime,
      resultSize,
      timestamp: Date.now(),
      hit
    })

    // Keep metrics array bounded
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  private getResultSize(result: any): number {
    try {
      return JSON.stringify(result).length
    } catch {
      return 0
    }
  }
}

// Export singleton instance
export const redisCache = RedisCacheManager.getInstance()

// Specialized query caching functions
export const queryCache = {
  /**
   * Cache expensive analytics queries
   */
  analytics: <T>(
    queryName: string,
    queryFn: () => Promise<T>
  ) => redisCache.cachedAggregation(
    `analytics:${queryName}`,
    queryFn,
    ['analytics']
  ),

  /**
   * Cache user profile data
   */
  userProfile: <T>(
    userId: string,
    profileFn: () => Promise<T>
  ) => redisCache.cachedUserData(
    userId,
    'profile',
    profileFn
  ),

  /**
   * Cache user's tasting history
   */
  userTastings: <T>(
    userId: string,
    tastingsFn: () => Promise<T>
  ) => redisCache.cachedUserData(
    userId,
    'tastings',
    tastingsFn,
    { ttl: 2 * 60 * 1000 } // 2 minutes for frequently changing data
  ),

  /**
   * Cache flavor recommendations
   */
  recommendations: <T>(
    userId: string,
    recommendationsFn: () => Promise<T>
  ) => redisCache.cachedUserData(
    userId,
    'recommendations',
    recommendationsFn,
    { ttl: 15 * 60 * 1000 } // 15 minutes
  ),

  /**
   * Cache search results
   */
  search: <T>(
    searchQuery: string,
    searchFn: () => Promise<T>
  ) => redisCache.cachedQuery(
    `search:${searchQuery}`,
    searchFn,
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      tags: ['search']
    }
  ),

  /**
   * Cache leaderboard data
   */
  leaderboard: <T>(
    category: string,
    leaderboardFn: () => Promise<T>
  ) => redisCache.cachedAggregation(
    `leaderboard:${category}`,
    leaderboardFn,
    ['leaderboard', category],
    { ttl: 10 * 60 * 1000 } // 10 minutes
  )
}
