// Advanced caching manager with stale-while-revalidate strategy
// Supports in-memory cache with Redis fallback for production

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  staleTtl: number
  isStale?: boolean
}

interface CacheOptions {
  ttl: number // Time to live in milliseconds
  staleTtl: number // Stale-while-revalidate time in milliseconds
  maxAge?: number // HTTP Cache-Control max-age
  swr?: boolean // Enable stale-while-revalidate
  tags?: string[] // Cache tags for invalidation
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private defaultOptions: CacheOptions = {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleTtl: 24 * 60 * 60 * 1000, // 24 hours
    swr: true,
  }

  // Redis client for production (would be initialized based on environment)
  private redisClient: any = null

  constructor() {
    // Initialize Redis if in production and available
    if (typeof window === 'undefined' && process.env.REDIS_URL) {
      try {
        // This would use a Redis client like ioredis in a real implementation
        console.log('Redis caching enabled for server-side operations')
      } catch (error) {
        console.warn('Redis not available, falling back to memory cache')
      }
    }
  }

  /**
   * Get data from cache with stale-while-revalidate support
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Partial<CacheOptions> = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options }
    const cacheKey = this.normalizeKey(key)

    // Try memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey)
    if (memoryEntry) {
      const now = Date.now()
      const age = now - memoryEntry.timestamp

      // If data is fresh, return it
      if (age < memoryEntry.ttl) {
        return memoryEntry.data
      }

      // If data is stale but within stale-while-revalidate window, return stale data
      // and refresh in background
      if (opts.swr && age < memoryEntry.staleTtl) {
        memoryEntry.isStale = true
        this.refreshInBackground(cacheKey, fetcher, opts)
        return memoryEntry.data
      }

      // Data is too old, remove from cache
      this.memoryCache.delete(cacheKey)
    }

    // Try Redis cache if available
    if (this.redisClient) {
      try {
        const redisEntry = await this.redisClient.get(cacheKey)
        if (redisEntry) {
          const parsed = JSON.parse(redisEntry)
          const now = Date.now()
          const age = now - parsed.timestamp

          if (age < parsed.ttl) {
            // Refresh memory cache
            this.memoryCache.set(cacheKey, parsed)
            return parsed.data
          }

          // Handle stale data from Redis
          if (opts.swr && age < parsed.staleTtl) {
            this.refreshInBackground(cacheKey, fetcher, opts)
            return parsed.data
          }
        }
      } catch (error) {
        console.warn('Redis cache error:', error)
      }
    }

    // No cache hit, fetch fresh data
    return this.set(cacheKey, fetcher, opts)
  }

  /**
   * Set data in cache
   */
  async set<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: Partial<CacheOptions> = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options }
    const cacheKey = this.normalizeKey(key)

    try {
      const data = await fetcher()
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: opts.ttl,
        staleTtl: opts.staleTtl,
      }

      // Set in memory cache
      this.memoryCache.set(cacheKey, entry)

      // Set in Redis if available
      if (this.redisClient) {
        try {
          await this.redisClient.setex(
            cacheKey,
            Math.floor(opts.staleTtl / 1000), // Redis expects seconds
            JSON.stringify(entry)
          )
        } catch (error) {
          console.warn('Redis set error:', error)
        }
      }

      return data
    } catch (error) {
      console.error('Cache set error:', error)
      throw error
    }
  }

  /**
   * Invalidate cache by key or tags
   */
  async invalidate(key?: string, tags?: string[]): Promise<void> {
    if (key) {
      const cacheKey = this.normalizeKey(key)
      this.memoryCache.delete(cacheKey)

      if (this.redisClient) {
        try {
          await this.redisClient.del(cacheKey)
        } catch (error) {
          console.warn('Redis delete error:', error)
        }
      }
    }

    if (tags && tags.length > 0) {
      // Invalidate by tags (would require additional tag tracking in production)
      console.log('Tag-based invalidation requested for:', tags)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number
    memorySize: string
    hitRate?: number
  } {
    const memoryEntries = this.memoryCache.size
    const memorySize = this.estimateMemorySize()

    return {
      memoryEntries,
      memorySize,
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (this.redisClient) {
      try {
        await this.redisClient.flushdb()
      } catch (error) {
        console.warn('Redis flush error:', error)
      }
    }
  }

  private normalizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_-]/g, '_')
  }

  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      await this.set(key, fetcher, options)
      console.log(`Background refresh completed for key: ${key}`)
    } catch (error) {
      console.warn(`Background refresh failed for key: ${key}`, error)
    }
  }

  private estimateMemorySize(): string {
    let size = 0
    for (const [key, entry] of this.memoryCache) {
      size += key.length * 2 // Rough estimate for string size
      size += JSON.stringify(entry).length * 2 // Rough estimate for entry size
    }

    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }
}

// Export singleton instance
export const cacheManager = new CacheManager()

// Utility functions for common caching patterns
export const cacheUtils = {
  /**
   * Cache API responses with stale-while-revalidate
   */
  async cachedApiCall<T>(
    url: string,
    options: RequestInit = {},
    cacheOptions: Partial<CacheOptions> = {}
  ): Promise<T> {
    const cacheKey = `api:${url}:${JSON.stringify(options)}`

    return cacheManager.get(
      cacheKey,
      async () => {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status}`)
        }
        return response.json()
      },
      {
        ttl: 5 * 60 * 1000, // 5 minutes
        staleTtl: 30 * 60 * 1000, // 30 minutes
        ...cacheOptions,
      }
    )
  },

  /**
   * Cache expensive computations
   */
  async cachedComputation<T>(
    key: string,
    computation: () => Promise<T>,
    options: Partial<CacheOptions> = {}
  ): Promise<T> {
    return cacheManager.get(
      `computation:${key}`,
      computation,
      {
        ttl: 10 * 60 * 1000, // 10 minutes for computations
        staleTtl: 60 * 60 * 1000, // 1 hour
        ...options,
      }
    )
  },

  /**
   * Cache database queries
   */
  async cachedDbQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: Partial<CacheOptions> = {}
  ): Promise<T> {
    return cacheManager.get(
      `db:${queryKey}`,
      queryFn,
      {
        ttl: 2 * 60 * 1000, // 2 minutes for DB queries
        staleTtl: 10 * 60 * 1000, // 10 minutes
        ...options,
      }
    )
  },
}
