// Supabase Edge Function: Process Tasting Data
// This function processes completed tastings and generates analytics

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TastingProcessRequest {
  tasting_id: string
  user_id: string
  tasting_data: any
  generate_insights?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { tasting_id, user_id, tasting_data, generate_insights = true }: TastingProcessRequest = await req.json()

    if (!tasting_id || !user_id || !tasting_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process tasting completion
    const results = await processTastingCompletion(tasting_id, user_id, tasting_data, supabaseClient)

    // Generate insights if requested
    let insights = null
    if (generate_insights) {
      insights = await generateTastingInsights(user_id, tasting_data, supabaseClient)
    }

    // Update user statistics
    await updateUserStatistics(user_id, tasting_data, supabaseClient)

    // Check for achievements
    await checkAchievements(user_id, tasting_data, supabaseClient)

    // Create activity feed entry
    await createActivityEntry(user_id, tasting_id, tasting_data, supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        results,
        insights,
        message: 'Tasting processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing tasting data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processTastingCompletion(tastingId: string, userId: string, tastingData: any, supabaseClient: any) {
  // Update tasting status
  const { error: updateError } = await supabaseClient
    .from('tastings')
    .update({
      status: 'completed',
      tasting_data: tastingData,
      updated_at: new Date().toISOString()
    })
    .eq('id', tastingId)

  if (updateError) {
    throw new Error(`Failed to update tasting: ${updateError.message}`)
  }

  // Process individual item reviews
  const itemResults = []
  
  if (tastingData.items) {
    for (const item of tastingData.items) {
      const { data: review, error: reviewError } = await supabaseClient
        .from('user_reviews')
        .insert({
          user_id: userId,
          tasting_id: tastingId,
          item_id: item.id,
          rating: item.rating || 5,
          title: item.title || 'Tasting Review',
          content: item.notes || 'No additional notes',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (reviewError) {
        console.error('Error creating review:', reviewError)
      } else {
        itemResults.push(review)
      }
    }
  }

  return {
    tasting_updated: true,
    reviews_created: itemResults.length,
    reviews: itemResults
  }
}

async function generateTastingInsights(userId: string, tastingData: any, supabaseClient: any) {
  try {
    // Get user's previous tastings for comparison
    const { data: previousTastings } = await supabaseClient
      .from('tastings')
      .select('tasting_data, created_at')
      .eq('created_by', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!previousTastings || previousTastings.length === 0) {
      return {
        message: 'Primera cata completada! Continúa catando para obtener insights personalizados.',
        is_first_tasting: true
      }
    }

    // Analyze flavor preferences
    const flavorPreferences = analyzeFlavorPreferences(tastingData, previousTastings)
    
    // Analyze rating patterns
    const ratingPatterns = analyzeRatingPatterns(tastingData, previousTastings)
    
    // Generate recommendations
    const recommendations = generateRecommendations(flavorPreferences, ratingPatterns)

    return {
      flavor_preferences: flavorPreferences,
      rating_patterns: ratingPatterns,
      recommendations,
      total_tastings: previousTastings.length + 1
    }

  } catch (error) {
    console.error('Error generating insights:', error)
    return { error: 'Failed to generate insights' }
  }
}

function analyzeFlavorPreferences(currentTasting: any, previousTastings: any[]) {
  const allFlavors: Record<string, number> = {}
  
  // Process current tasting
  if (currentTasting.flavors) {
    currentTasting.flavors.forEach((flavor: any) => {
      allFlavors[flavor.name] = (allFlavors[flavor.name] || 0) + (flavor.intensity || 1)
    })
  }

  // Process previous tastings
  previousTastings.forEach(tasting => {
    if (tasting.tasting_data?.flavors) {
      tasting.tasting_data.flavors.forEach((flavor: any) => {
        allFlavors[flavor.name] = (allFlavors[flavor.name] || 0) + (flavor.intensity || 1)
      })
    }
  })

  // Sort by preference
  const sortedFlavors = Object.entries(allFlavors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  return {
    top_flavors: sortedFlavors.map(([name, score]) => ({ name, score })),
    total_unique_flavors: Object.keys(allFlavors).length
  }
}

function analyzeRatingPatterns(currentTasting: any, previousTastings: any[]) {
  const ratings: number[] = []
  
  // Collect all ratings
  if (currentTasting.items) {
    currentTasting.items.forEach((item: any) => {
      if (item.rating) ratings.push(item.rating)
    })
  }

  previousTastings.forEach(tasting => {
    if (tasting.tasting_data?.items) {
      tasting.tasting_data.items.forEach((item: any) => {
        if (item.rating) ratings.push(item.rating)
      })
    }
  })

  if (ratings.length === 0) return { message: 'No ratings available' }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  const highest = Math.max(...ratings)
  const lowest = Math.min(...ratings)

  return {
    average_rating: Math.round(average * 100) / 100,
    highest_rating: highest,
    lowest_rating: lowest,
    total_ratings: ratings.length,
    rating_distribution: getRatingDistribution(ratings)
  }
}

function getRatingDistribution(ratings: number[]) {
  const distribution: Record<number, number> = {}
  
  ratings.forEach(rating => {
    const rounded = Math.round(rating)
    distribution[rounded] = (distribution[rounded] || 0) + 1
  })

  return distribution
}

function generateRecommendations(flavorPreferences: any, ratingPatterns: any) {
  const recommendations = []

  // Flavor-based recommendations
  if (flavorPreferences.top_flavors?.length > 0) {
    const topFlavor = flavorPreferences.top_flavors[0].name
    recommendations.push({
      type: 'flavor_exploration',
      message: `Te gusta mucho el sabor a ${topFlavor}. Prueba bebidas de Oaxaca que destacan este perfil.`,
      action: 'explore_region',
      data: { region: 'Oaxaca', flavor: topFlavor }
    })
  }

  // Rating-based recommendations
  if (ratingPatterns.average_rating > 7) {
    recommendations.push({
      type: 'expertise_development',
      message: 'Tienes buen paladar! Considera probar catas a ciegas para desarrollar más tu expertise.',
      action: 'try_blind_tasting',
      data: { difficulty: 'intermediate' }
    })
  }

  return recommendations
}

async function updateUserStatistics(userId: string, tastingData: any, supabaseClient: any) {
  try {
    // Update user progress
    const progressUpdate = {
      tastings_completed: 1,
      last_tasting_date: new Date().toISOString()
    }

    await supabaseClient
      .from('profiles')
      .update({
        progress: supabaseClient.raw(`progress || '${JSON.stringify(progressUpdate)}'::jsonb`),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

  } catch (error) {
    console.error('Error updating user statistics:', error)
  }
}

async function checkAchievements(userId: string, tastingData: any, supabaseClient: any) {
  try {
    // Check for various achievements
    const achievements = []

    // First tasting achievement
    const { data: tastingCount } = await supabaseClient
      .from('tastings')
      .select('id', { count: 'exact' })
      .eq('created_by', userId)
      .eq('status', 'completed')

    if (tastingCount === 1) {
      achievements.push({
        type: 'first_tasting',
        title: 'Primera Cata',
        description: 'Completaste tu primera cata',
        points: 10
      })
    }

    // High rating achievement
    if (tastingData.items?.some((item: any) => item.rating >= 9)) {
      achievements.push({
        type: 'high_rating',
        title: 'Paladar Exigente',
        description: 'Otorgaste una calificación de 9 o más',
        points: 15
      })
    }

    // Award achievements
    for (const achievement of achievements) {
      await supabaseClient.rpc('award_achievement', {
        p_user_id: userId,
        p_achievement_type: achievement.type,
        p_title: achievement.title,
        p_description: achievement.description,
        p_points: achievement.points
      })
    }

  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

async function createActivityEntry(userId: string, tastingId: string, tastingData: any, supabaseClient: any) {
  try {
    const { data: tasting } = await supabaseClient
      .from('tastings')
      .select('name, type')
      .eq('id', tastingId)
      .single()

    await supabaseClient
      .from('activities')
      .insert({
        user_id: userId,
        activity_type: 'tasting_completed',
        title: `Completó la cata: ${tasting?.name || 'Cata sin nombre'}`,
        description: `Cata tipo ${tasting?.type || 'desconocido'} completada`,
        metadata: {
          tasting_id: tastingId,
          tasting_type: tasting?.type,
          items_count: tastingData.items?.length || 0
        },
        is_public: true,
        created_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Error creating activity entry:', error)
  }
}
