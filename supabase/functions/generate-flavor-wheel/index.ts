// Supabase Edge Function: Generate Flavor Wheel
// This function processes tasting notes and generates flavor wheel data

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FlavorExtractionRequest {
  tasting_id: string
  user_id: string
  notes: string
  language?: string
  wheel_type?: 'personal' | 'universal'
}

interface FlavorData {
  category: string
  subcategory: string
  intensity: number
  confidence: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { tasting_id, user_id, notes, language = 'es', wheel_type = 'personal' }: FlavorExtractionRequest = await req.json()

    // Validate input
    if (!tasting_id || !user_id || !notes) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tasting_id, user_id, notes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract flavors from notes
    const extractedFlavors = await extractFlavorsFromText(notes, language)

    // Generate wheel data structure
    const wheelData = await generateWheelStructure(extractedFlavors, wheel_type, supabaseClient)

    // Save flavor wheel to database
    const { data: flavorWheel, error: insertError } = await supabaseClient
      .from('flavor_wheels')
      .insert({
        tasting_id,
        user_id,
        wheel_type,
        wheel_data: wheelData,
        prose_excerpt: notes.substring(0, 200),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to save flavor wheel: ${insertError.message}`)
    }

    // Update user progress and achievements
    await updateUserProgress(user_id, supabaseClient)

    return new Response(
      JSON.stringify({
        success: true,
        flavor_wheel: flavorWheel,
        extracted_flavors: extractedFlavors,
        wheel_data: wheelData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating flavor wheel:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function extractFlavorsFromText(notes: string, language: string): Promise<FlavorData[]> {
  // Mexican beverage flavor dictionary
  const flavorDictionary = {
    es: {
      'agave': { category: 'base', subcategory: 'agave', weight: 1.0 },
      'dulce': { category: 'sabor', subcategory: 'dulce', weight: 0.8 },
      'vainilla': { category: 'sabor', subcategory: 'vainilla', weight: 0.7 },
      'caramelo': { category: 'sabor', subcategory: 'caramelo', weight: 0.7 },
      'miel': { category: 'sabor', subcategory: 'miel', weight: 0.6 },
      'citrico': { category: 'aroma', subcategory: 'citrico', weight: 0.8 },
      'limon': { category: 'aroma', subcategory: 'citrico', weight: 0.8 },
      'naranja': { category: 'aroma', subcategory: 'citrico', weight: 0.7 },
      'pimienta': { category: 'especias', subcategory: 'pimienta', weight: 0.9 },
      'canela': { category: 'especias', subcategory: 'canela', weight: 0.7 },
      'humo': { category: 'aroma', subcategory: 'humo', weight: 0.9 },
      'tierra': { category: 'mineral', subcategory: 'tierra', weight: 0.8 },
      'mineral': { category: 'mineral', subcategory: 'mineral', weight: 0.8 },
      'herbal': { category: 'vegetal', subcategory: 'herbal', weight: 0.7 },
      'floral': { category: 'aroma', subcategory: 'floral', weight: 0.6 },
    },
    en: {
      'agave': { category: 'base', subcategory: 'agave', weight: 1.0 },
      'sweet': { category: 'flavor', subcategory: 'sweet', weight: 0.8 },
      'vanilla': { category: 'flavor', subcategory: 'vanilla', weight: 0.7 },
      'caramel': { category: 'flavor', subcategory: 'caramel', weight: 0.7 },
      'honey': { category: 'flavor', subcategory: 'honey', weight: 0.6 },
      'citrus': { category: 'aroma', subcategory: 'citrus', weight: 0.8 },
      'lemon': { category: 'aroma', subcategory: 'citrus', weight: 0.8 },
      'orange': { category: 'aroma', subcategory: 'citrus', weight: 0.7 },
      'pepper': { category: 'spice', subcategory: 'pepper', weight: 0.9 },
      'cinnamon': { category: 'spice', subcategory: 'cinnamon', weight: 0.7 },
      'smoke': { category: 'aroma', subcategory: 'smoke', weight: 0.9 },
      'earth': { category: 'mineral', subcategory: 'earth', weight: 0.8 },
      'mineral': { category: 'mineral', subcategory: 'mineral', weight: 0.8 },
      'herbal': { category: 'vegetal', subcategory: 'herbal', weight: 0.7 },
      'floral': { category: 'aroma', subcategory: 'floral', weight: 0.6 },
    }
  }

  const dictionary = flavorDictionary[language as keyof typeof flavorDictionary] || flavorDictionary.es
  const extractedFlavors: FlavorData[] = []

  // Normalize text for processing
  const normalizedNotes = notes.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)

  // Extract flavors with context analysis
  for (const [flavor, data] of Object.entries(dictionary)) {
    const regex = new RegExp(`\\b${flavor}\\b`, 'gi')
    const matches = normalizedNotes.filter(word => regex.test(word))
    
    if (matches.length > 0) {
      // Calculate intensity based on context and frequency
      let intensity = Math.min(matches.length * data.weight, 1.0)
      
      // Boost intensity for intensity modifiers
      const intensityModifiers = ['muy', 'mucho', 'intenso', 'fuerte', 'strong', 'intense', 'pronounced']
      const hasIntensityModifier = intensityModifiers.some(modifier => 
        normalizedNotes.some(word => word.includes(modifier))
      )
      
      if (hasIntensityModifier) {
        intensity = Math.min(intensity * 1.3, 1.0)
      }

      extractedFlavors.push({
        category: data.category,
        subcategory: data.subcategory,
        intensity: Math.round(intensity * 100) / 100,
        confidence: data.weight
      })
    }
  }

  return extractedFlavors.sort((a, b) => b.intensity - a.intensity)
}

async function generateWheelStructure(flavors: FlavorData[], wheelType: string, supabaseClient: any) {
  // Group flavors by category
  const categories = flavors.reduce((acc, flavor) => {
    if (!acc[flavor.category]) {
      acc[flavor.category] = []
    }
    acc[flavor.category].push(flavor)
    return acc
  }, {} as Record<string, FlavorData[]>)

  // Generate hierarchical wheel structure
  const wheelStructure = {
    name: 'root',
    children: Object.entries(categories).map(([category, categoryFlavors]) => ({
      name: category,
      value: categoryFlavors.reduce((sum, f) => sum + f.intensity, 0),
      children: categoryFlavors.map(flavor => ({
        name: flavor.subcategory,
        value: flavor.intensity,
        intensity: flavor.intensity,
        confidence: flavor.confidence
      }))
    }))
  }

  return wheelStructure
}

async function updateUserProgress(userId: string, supabaseClient: any) {
  try {
    // Award achievement for first flavor wheel
    await supabaseClient.rpc('award_achievement', {
      p_user_id: userId,
      p_achievement_type: 'first_flavor_wheel',
      p_title: 'Primer Rueda de Sabores',
      p_description: 'Generaste tu primera rueda de sabores',
      p_points: 25
    })

    // Update user streak
    await supabaseClient.rpc('calculate_user_streak', {
      p_user_id: userId,
      p_streak_type: 'daily_tasting'
    })

  } catch (error) {
    console.error('Error updating user progress:', error)
    // Don't throw error as this is not critical
  }
}
