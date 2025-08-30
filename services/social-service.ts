/**
 * Social Service for FlavorWheel México
 * Handles user reviews, nearby events, friends' tastings, and social interactions
 */

import { supabase } from '@/lib/supabase'

export interface UserReview {
  id: string
  tasting_id: string
  item_id: string
  notes: string
  overall_rating: number
  submitted_at: string
  tasting?: {
    name: string
    tasting_type: string
  }
  item?: {
    name: string
  }
}

export interface NearbyEvent {
  id: string
  name: string
  description: string
  tasting_type: string
  scheduled_for: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  max_participants: number
  current_participants: number
  created_by: string
  distance?: number
}

export interface FriendTasting {
  id: string
  name: string
  description: string
  tasting_type: string
  created_at: string
  created_by: string
  user_profile?: {
    name: string
    avatar_url?: string
  }
  preview_image?: string
  item_count: number
}

/**
 * Get user reviews with pagination
 */
export async function getUserReviews(userId: string, limit = 10, offset = 0): Promise<UserReview[]> {
  try {
    const { data, error } = await supabase
      .from('user_reviews')
      .select(`
        id,
        tasting_id,
        item_id,
        notes,
        overall_rating,
        submitted_at,
        tasting:tastings(name, tasting_type),
        item:tasting_items(name)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }
}

/**
 * Get count of user reviews
 */
export async function getUserReviewsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error fetching user reviews count:', error)
    return 0
  }
}

/**
 * Get nearby public tastings based on user location
 */
export async function getNearbyEvents(
  latitude: number,
  longitude: number,
  radiusKm = 50,
  limit = 10
): Promise<NearbyEvent[]> {
  try {
    // For now, get all public tastings and filter client-side
    // In production, you'd use PostGIS for proper geospatial queries
    const { data, error } = await supabase
      .from('tastings')
      .select(`
        id,
        name,
        description,
        tasting_type,
        scheduled_for,
        max_participants,
        created_by,
        characteristics
      `)
      .eq('is_public', true)
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(limit * 3) // Get more to filter by distance

    if (error) throw error

    // Filter by distance (simplified calculation)
    const eventsWithDistance = (data || [])
      .map((event: any) => {
        const eventLat = event.characteristics?.location?.latitude
        const eventLng = event.characteristics?.location?.longitude
        
        if (!eventLat || !eventLng) return null

        const distance = calculateDistance(latitude, longitude, eventLat, eventLng)
        
        if (distance > radiusKm) return null

        return {
          ...event,
          location: {
            latitude: eventLat,
            longitude: eventLng,
            address: event.characteristics?.location?.address
          },
          current_participants: event.characteristics?.current_participants || 0,
          distance
        }
      })
      .filter(Boolean)
      .slice(0, limit)

    return eventsWithDistance as NearbyEvent[]
  } catch (error) {
    console.error('Error fetching nearby events:', error)
    return []
  }
}

/**
 * Get count of nearby events
 */
export async function getNearbyEventsCount(latitude: number, longitude: number, radiusKm = 50): Promise<number> {
  const events = await getNearbyEvents(latitude, longitude, radiusKm, 100)
  return events.length
}

/**
 * Get friends' tastings feed
 */
export async function getFriendsTastings(userId: string, limit = 10, offset = 0): Promise<FriendTasting[]> {
  try {
    // First get user's followed friends (this would need a follows table)
    // For now, get recent public tastings from other users
    const { data, error } = await supabase
      .from('tastings')
      .select(`
        id,
        name,
        description,
        tasting_type,
        created_at,
        created_by,
        characteristics,
        profiles:created_by(name, avatar_url),
        tasting_items(count)
      `)
      .neq('created_by', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((tasting: any) => ({
      id: tasting.id,
      name: tasting.name,
      description: tasting.description,
      tasting_type: tasting.tasting_type,
      created_at: tasting.created_at,
      created_by: tasting.created_by,
      user_profile: tasting.profiles,
      preview_image: tasting.characteristics?.preview_image,
      item_count: tasting.tasting_items?.[0]?.count || 0
    }))
  } catch (error) {
    console.error('Error fetching friends tastings:', error)
    return []
  }
}

/**
 * Get count of friends' tastings
 */
export async function getFriendsTastingsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tastings')
      .select('*', { count: 'exact', head: true })
      .neq('created_by', userId)
      .eq('is_public', true)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error fetching friends tastings count:', error)
    return 0
  }
}

/**
 * Join a public tasting event
 */
export async function joinEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasting_participants')
      .insert({
        tasting_id: eventId,
        user_id: userId,
        status: 'joined'
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error joining event:', error)
    return false
  }
}

/**
 * Share a user review (generate shareable link)
 */
export async function shareReview(reviewId: string): Promise<string> {
  // Generate a shareable link for the review
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  return `${baseUrl}/shared/review/${reviewId}`
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
