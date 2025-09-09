/**
 * Competition Preloading Service
 *
 * Handles preloading of competition data and item attributes for improved performance
 * Supports batch loading, caching, and intelligent prefetching based on user behavior
 */

import { supabase } from '@/lib/supabase'
import { cacheManager } from '@/lib/cache-manager'

export interface PreloadedCompetitionData {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  participants: PreloadedParticipant[]
  items: PreloadedItem[]
  settings: CompetitionSettings
  lastUpdated: Date
  preloadTimestamp: Date
}

export interface PreloadedParticipant {
  id: string
  user_id: string
  status: 'invited' | 'joined' | 'completed' | 'dropped_out'
  profile: {
    name: string
    avatar_url?: string
    gender?: string
    age?: number
    location?: string
  }
  scores?: {
    total: number
    average: number
    consistency: number
    item_scores: Record<string, number>
  }
}

export interface PreloadedItem {
  id: string
  name: string
  type: string
  description?: string
  image_url?: string
  attributes: ItemAttributes
  average_scores?: {
    salt_level?: number
    umami_level?: number
    spiciness_level?: number
    acidity_level?: number
    sweetness_level?: number
    texture_rating?: string
    typicity_score?: number
    complexity_score?: number
  }
}

export interface ItemAttributes {
  category: string
  subcategory?: string
  origin?: string
  price_range?: string
  alcohol_content?: number
  caffeine_content?: number
  sugar_content?: number
  nutritional_info?: Record<string, any>
}

export interface CompetitionSettings {
  max_participants: number
  scoring_method: 'individual' | 'composite'
  allow_late_joining: boolean
  require_photos: boolean
  review_fields: string[]
  time_limit?: number
}

class CompetitionPreloadingService {
  private preloadCache = new Map<string, PreloadedCompetitionData>()
  private itemCache = new Map<string, PreloadedItem>()
  private participantCache = new Map<string, PreloadedParticipant>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CONCURRENT_PRELOADS = 3
  private activePreloads = new Set<string>()

  /**
   * Preload competition data for improved performance
   */
  async preloadCompetition(competitionId: string): Promise<PreloadedCompetitionData | null> {
    // Check if already preloading
    if (this.activePreloads.has(competitionId)) {
      console.log(`Competition ${competitionId} is already being preloaded`)
      return this.preloadCache.get(competitionId) || null
    }

    // Check cache first
    const cached = this.preloadCache.get(competitionId)
    if (cached && this.isCacheValid(cached)) {
      return cached
    }

    try {
      this.activePreloads.add(competitionId)

      // Preload competition basic info
      const { data: competition, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single()

      if (compError || !competition) {
        console.error('Failed to load competition:', compError)
        return null
      }

      // Preload participants in parallel
      const participantsPromise = this.preloadParticipants(competitionId)

      // Preload items in parallel
      const itemsPromise = this.preloadItems(competitionId)

      // Preload settings
      const settingsPromise = this.preloadCompetitionSettings(competitionId)

      const [participants, items, settings] = await Promise.all([
        participantsPromise,
        itemsPromise,
        settingsPromise
      ])

      const preloadedData: PreloadedCompetitionData = {
        id: competition.id,
        name: competition.name,
        status: competition.status,
        participants: participants || [],
        items: items || [],
        settings: settings || this.getDefaultSettings(),
        lastUpdated: new Date(competition.updated_at),
        preloadTimestamp: new Date()
      }

      // Cache the preloaded data
      this.preloadCache.set(competitionId, preloadedData)

      // Cache individual items for future reuse
      items?.forEach(item => {
        this.itemCache.set(item.id, item)
      })

      // Cache participants
      participants?.forEach(participant => {
        this.participantCache.set(participant.id, participant)
      })

      console.log(`Successfully preloaded competition ${competitionId}`)
      return preloadedData

    } catch (error) {
      console.error('Error preloading competition:', error)
      return null
    } finally {
      this.activePreloads.delete(competitionId)
    }
  }

  /**
   * Preload participants for a competition
   */
  private async preloadParticipants(competitionId: string): Promise<PreloadedParticipant[] | null> {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select(`
          id,
          user_id,
          status,
          profiles:user_id (
            name,
            avatar_url,
            gender,
            age,
            location
          ),
          competition_participant_scores (
            total_score,
            average_score,
            consistency_score,
            item_scores
          )
        `)
        .eq('competition_id', competitionId)

      if (error) {
        console.error('Error preloading participants:', error)
        return null
      }

      return data?.map((participant: any) => ({
        id: participant.id,
        user_id: participant.user_id,
        status: participant.status,
        profile: {
          name: participant.profiles?.name || 'Anonymous',
          avatar_url: participant.profiles?.avatar_url,
          gender: participant.profiles?.gender,
          age: participant.profiles?.age,
          location: participant.profiles?.location
        },
        scores: participant.competition_participant_scores?.[0] ? {
          total: participant.competition_participant_scores[0].total_score,
          average: participant.competition_participant_scores[0].average_score,
          consistency: participant.competition_participant_scores[0].consistency_score,
          item_scores: participant.competition_participant_scores[0].item_scores || {}
        } : undefined
      })) || []

    } catch (error) {
      console.error('Error in preloadParticipants:', error)
      return null
    }
  }

  /**
   * Preload items for a competition
   */
  private async preloadItems(competitionId: string): Promise<PreloadedItem[] | null> {
    try {
      const { data, error } = await supabase
        .from('competition_items')
        .select(`
          id,
          name,
          type,
          description,
          image_url,
          attributes,
          user_reviews (
            salt_level,
            umami_level,
            spiciness_level,
            acidity_level,
            sweetness_level,
            texture_rating,
            typicity_score,
            complexity_score
          )
        `)
        .eq('competition_id', competitionId)

      if (error) {
        console.error('Error preloading items:', error)
        return null
      }

      return data?.map((item: any) => {
        // Calculate average scores from reviews
        const reviews = item.user_reviews || []
        const average_scores = this.calculateAverageScores(reviews)

        return {
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description,
          image_url: item.image_url,
          attributes: item.attributes || {},
          average_scores
        }
      }) || []

    } catch (error) {
      console.error('Error in preloadItems:', error)
      return null
    }
  }

  /**
   * Calculate average scores from review data
   */
  private calculateAverageScores(reviews: any[]): PreloadedItem['average_scores'] {
    if (!reviews || reviews.length === 0) return {}

    const sums = {
      salt_level: 0,
      umami_level: 0,
      spiciness_level: 0,
      acidity_level: 0,
      sweetness_level: 0,
      typicity_score: 0,
      complexity_score: 0
    }

    const counts = {
      salt_level: 0,
      umami_level: 0,
      spiciness_level: 0,
      acidity_level: 0,
      sweetness_level: 0,
      typicity_score: 0,
      complexity_score: 0
    }

    const texture_ratings: string[] = []

    reviews.forEach(review => {
      // Sum up numeric scores
      ;['salt_level', 'umami_level', 'spiciness_level', 'acidity_level', 'sweetness_level', 'typicicty_score', 'complexity_score'].forEach(field => {
        if (review[field] !== null && review[field] !== undefined) {
          sums[field as keyof typeof sums] += Number(review[field])
          counts[field as keyof typeof counts]++
        }
      })

      // Collect texture ratings
      if (review.texture_rating) {
        texture_ratings.push(review.texture_rating)
      }
    })

    const averages: any = {}

    // Calculate averages for numeric fields
    Object.keys(sums).forEach(key => {
      if (counts[key as keyof typeof counts] > 0) {
        averages[key] = Math.round((sums[key as keyof typeof sums] / counts[key as keyof typeof counts]) * 100) / 100
      }
    })

    // Find most common texture rating
    if (texture_ratings.length > 0) {
      const textureCount: Record<string, number> = {}
      texture_ratings.forEach(rating => {
        textureCount[rating] = (textureCount[rating] || 0) + 1
      })

      const mostCommonTexture = Object.entries(textureCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0]

      if (mostCommonTexture) {
        averages.texture_rating = mostCommonTexture
      }
    }

    return averages
  }

  /**
   * Preload competition settings
   */
  private async preloadCompetitionSettings(competitionId: string): Promise<CompetitionSettings | null> {
    try {
      const { data, error } = await supabase
        .from('competition_settings')
        .select('*')
        .eq('competition_id', competitionId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error preloading competition settings:', error)
        return null
      }

      if (!data) {
        return this.getDefaultSettings()
      }

      return {
        max_participants: data.max_participants || 10,
        scoring_method: data.scoring_method || 'individual',
        allow_late_joining: data.allow_late_joining || false,
        require_photos: data.require_photos || false,
        review_fields: data.review_fields || [
          'salt_level', 'umami_level', 'spiciness_level',
          'acidity_level', 'sweetness_level', 'texture_rating',
          'typicicty_score', 'complexity_score'
        ],
        time_limit: data.time_limit
      }

    } catch (error) {
      console.error('Error in preloadCompetitionSettings:', error)
      return null
    }
  }

  /**
   * Get default competition settings
   */
  private getDefaultSettings(): CompetitionSettings {
    return {
      max_participants: 10,
      scoring_method: 'individual',
      allow_late_joining: false,
      require_photos: false,
      review_fields: [
        'salt_level', 'umami_level', 'spiciness_level',
        'acidity_level', 'sweetness_level', 'texture_rating',
        'typicicty_score', 'complexity_score'
      ]
    }
  }

  /**
   * Get preloaded competition data from cache
   */
  getPreloadedCompetition(competitionId: string): PreloadedCompetitionData | null {
    const cached = this.preloadCache.get(competitionId)
    return cached && this.isCacheValid(cached) ? cached : null
  }

  /**
   * Get preloaded item data from cache
   */
  getPreloadedItem(itemId: string): PreloadedItem | null {
    return this.itemCache.get(itemId) || null
  }

  /**
   * Get preloaded participant data from cache
   */
  getPreloadedParticipant(participantId: string): PreloadedParticipant | null {
    return this.participantCache.get(participantId) || null
  }

  /**
   * Preload multiple competitions in batch
   */
  async preloadCompetitionsBatch(competitionIds: string[]): Promise<Map<string, PreloadedCompetitionData>> {
    const results = new Map<string, PreloadedCompetitionData>()

    // Process in batches to avoid overwhelming the database
    const batches = this.chunkArray(competitionIds, this.MAX_CONCURRENT_PRELOADS)

    for (const batch of batches) {
      const promises = batch.map(id => this.preloadCompetition(id))
      const batchResults = await Promise.all(promises)

      batch.forEach((id, index) => {
        const result = batchResults[index]
        if (result) {
          results.set(id, result)
        }
      })
    }

    return results
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(data: PreloadedCompetitionData): boolean {
    const now = new Date()
    const timeDiff = now.getTime() - data.preloadTimestamp.getTime()
    return timeDiff < this.CACHE_TTL
  }

  /**
   * Clear cache for a specific competition
   */
  clearCompetitionCache(competitionId: string): void {
    this.preloadCache.delete(competitionId)
    console.log(`Cleared cache for competition ${competitionId}`)
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.preloadCache.clear()
    this.itemCache.clear()
    this.participantCache.clear()
    console.log('Cleared all preloading caches')
  }

  /**
   * Utility function to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    competitions: number
    items: number
    participants: number
    activePreloads: number
  } {
    return {
      competitions: this.preloadCache.size,
      items: this.itemCache.size,
      participants: this.participantCache.size,
      activePreloads: this.activePreloads.size
    }
  }
}

// Export singleton instance
export const competitionPreloadingService = new CompetitionPreloadingService()

// Export types for external use
export type { CompetitionPreloadingService }
