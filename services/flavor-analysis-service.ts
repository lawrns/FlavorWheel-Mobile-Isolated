/**
 * Flavor Analysis Service for FlavorWheel México
 * Analyzes tasting data to generate interactive flavor wheels
 */

import { supabase } from '@/lib/supabase'
import { getMexicanFlavorDictionary } from '@/services/flavor-dictionary-service'
import { extractFlavorDescriptorsMultilingual } from '@/lib/flavor-utils'
import type { MexicanBeverageType } from '@/types/mexican-types'

export interface FlavorAnalysisData {
  category: string
  subcategory?: string
  descriptor: string
  frequency: number
  intensity: number
  beverageTypes: MexicanBeverageType[]
  regions: string[]
  userCount: number
  lastDetected: string
}

export interface FlavorWheelData {
  name: string
  color: string
  percentage: number
  intensity: number
  count: number
  subcategories?: {
    name: string
    percentage: number
    intensity: number
    descriptors?: {
      name: string
      percentage: number
      intensity: number
      regions: string[]
      beverageTypes: MexicanBeverageType[]
    }[]
  }[]
}

export interface FlavorWheelConfig {
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor'
  scope: 'personal' | 'universal'
  userId?: string
  beverageType?: MexicanBeverageType
  region?: string
  timeRange?: {
    start: string
    end: string
  }
  // Enables dictionary-driven multilingual extraction for better mapping
  useMultilingualExtraction?: boolean
  // New demographic filters for enhanced personalization
  demographicFilters?: {
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    ageRange?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'
    location?: string
    geographicRadius?: number
  }
}

// Mexican beverage flavor categories with cultural context
export const MEXICAN_FLAVOR_CATEGORIES = {
  Frutal: {
    color: '#FF6B6B',
    subcategories: ['Cítricos', 'Frutas Tropicales', 'Frutas del Bosque', 'Frutas de Hueso'],
    culturalContext: 'Sabores que reflejan la biodiversidad mexicana',
  },
  Floral: {
    color: '#FF9F43',
    subcategories: ['Flores Blancas', 'Flores Silvestres', 'Hierbas Aromáticas'],
    culturalContext: 'Aromas de la flora mexicana tradicional',
  },
  Herbal: {
    color: '#26de81',
    subcategories: ['Hierbas Medicinales', 'Especias', 'Plantas Silvestres'],
    culturalContext: 'Tradición herbolaria mexicana',
  },
  Ahumado: {
    color: '#4834d4',
    subcategories: ['Humo de Leña', 'Tierra Cocida', 'Carbón'],
    culturalContext: 'Métodos ancestrales de cocción',
  },
  Mineral: {
    color: '#686de0',
    subcategories: ['Tierra', 'Piedra', 'Sal Marina'],
    culturalContext: 'Terroir mexicano único',
  },
  Dulce: {
    color: '#FD79A8',
    subcategories: ['Miel', 'Caramelo', 'Piloncillo', 'Frutas Maduras'],
    culturalContext: 'Dulzores tradicionales mexicanos',
  },
  Especiado: {
    color: '#E17055',
    subcategories: ['Canela', 'Vainilla', 'Pimienta', 'Chile'],
    culturalContext: 'Especias de la cocina mexicana',
  },
  Agave: {
    color: '#00b894',
    subcategories: ['Agave Cocido', 'Agave Crudo', 'Pencas', 'Corazón'],
    culturalContext: 'Esencia del agave mexicano',
  },
}

/**
 * Analyzes user's tasting data to generate flavor wheel
 */
export async function generateFlavorWheelData(
  config: FlavorWheelConfig
): Promise<FlavorWheelData[]> {
  let query = supabase.from('tastings').select(`
      id,
      tasting_type,
      notes,
      ratings,
      created_at,
      tasting_items(*)
    `)

  if (config.scope === 'personal' && config.userId) {
    query = query.eq('created_by', config.userId)
  }

  if (config.beverageType) {
    const type = String(config.beverageType)
    query = query.or(`tasting_type.eq.${type},type.eq.${type}`)
  }

  if (config.timeRange) {
    query = query.gte('created_at', config.timeRange.start).lte('created_at', config.timeRange.end)
  }

  const { data: tastings, error } = await query

  if (error) {
    console.error('Error fetching tasting data:', error)
    throw new Error('No se pudieron cargar los datos de catas')
  }

  if (!tastings || tastings.length === 0) {
    // Gracefully return empty dataset so the page can render an empty state
    return []
  }

  const flavorAnalysis = analyzeTastingData(tastings, config)
  return convertToWheelData(flavorAnalysis, config)
}

/**
 * Analyzes raw tasting data to extract flavor patterns
 */
function analyzeTastingData(
  tastings: any[],
  config: FlavorWheelConfig
): Map<string, FlavorAnalysisData> {
  const flavorMap = new Map<string, FlavorAnalysisData>()

  // Apply demographic filtering if specified
  let filteredTastings = tastings

  if (config.demographicFilters) {
    filteredTastings = tastings.filter(tasting => {
      // Check gender filter
      if (config.demographicFilters?.gender && tasting.user_gender) {
        if (tasting.user_gender !== config.demographicFilters.gender) {
          return false
        }
      }

      // Check age range filter
      if (config.demographicFilters?.ageRange && tasting.user_age) {
        const userAge = parseInt(tasting.user_age)
        const [minAge, maxAge] = config.demographicFilters.ageRange.split('-').map((age, index) => {
          if (age === '+') return 100 // Handle 65+ case
          return parseInt(age)
        })

        if (userAge < minAge || (maxAge && userAge > maxAge)) {
          return false
        }
      }

      // Check location filter
      if (config.demographicFilters?.location && tasting.user_location) {
        // Simple string matching - could be enhanced with geocoding
        if (!tasting.user_location.toLowerCase().includes(config.demographicFilters.location.toLowerCase())) {
          return false
        }
      }

      // Geographic radius filtering would require lat/lng coordinates
      // For now, we'll skip this as it requires additional user location data

      return true
    })
  }

  filteredTastings.forEach(tasting => {
    // Extract flavors from different sources based on wheel type and review type
    let flavors: string[] = []
    let noteText = ''

    // Handle custom categories from tasting reviews
    if (tasting.review_type === 'prose') {
      // For prose reviews, extract from prose text
      if (tasting.prose_review) {
        flavors = extractFlavorsFromText(tasting.prose_review)
        noteText = tasting.prose_review
      } else if (tasting.notes?.prose) {
        flavors = extractFlavorsFromText(tasting.notes.prose)
        noteText = tasting.notes.prose
      }
    } else if (tasting.review_type === 'quick' && tasting.custom_categories) {
      // For quick reviews with custom categories, combine all category notes
      const categoryNotes: string[] = []
      const categoryFlavors: string[] = []

      tasting.custom_categories.forEach((category: any) => {
        if (tasting.notes?.[`${category.name}_notes`]) {
          const notes = tasting.notes[`${category.name}_notes`]
          categoryNotes.push(notes)
          categoryFlavors.push(...extractFlavorsFromText(notes))
        }
      })

      flavors = categoryFlavors
      noteText = categoryNotes.join(' ')
    } else {
      // Default behavior for standard categories
      switch (config.wheelType) {
        case 'aroma':
          flavors = extractAromaFlavors(tasting)
          noteText = Array.isArray(tasting.notes?.aroma)
            ? tasting.notes.aroma.join(', ')
            : String(tasting.notes?.aroma ?? '')
          break
        case 'flavor':
          flavors = extractTasteFlavors(tasting)
          noteText = Array.isArray(tasting.notes?.taste || tasting.notes?.flavor)
            ? (tasting.notes?.taste || tasting.notes?.flavor).join(', ')
            : String(tasting.notes?.taste || tasting.notes?.flavor || '')
          break
        case 'combined':
          flavors = [...extractAromaFlavors(tasting), ...extractTasteFlavors(tasting)]
          noteText = [
            Array.isArray(tasting.notes?.aroma)
              ? tasting.notes.aroma.join(', ')
              : String(tasting.notes?.aroma ?? ''),
            Array.isArray(tasting.notes?.taste || tasting.notes?.flavor)
              ? (tasting.notes?.taste || tasting.notes?.flavor).join(', ')
              : String(tasting.notes?.taste || tasting.notes?.flavor || ''),
          ].join(', ')
          break
        case 'metaphor':
          flavors = extractMetaphorFlavors(tasting)
          noteText = Array.isArray(tasting.notes?.metaphors) ? tasting.notes.metaphors.join(', ') : ''
          break
      }
    }

    // Optional multilingual enrichment to better map descriptors to categories/subcategories
    let metaIndex = new Map<string, { category?: string; subcategory?: string }>()
    if (config.useMultilingualExtraction) {
      try {
        const enriched = extractFlavorDescriptorsMultilingual(
          noteText,
          getMexicanFlavorDictionary() as any,
          'es-MX'
        )
        enriched.forEach((d: any) => {
          // We only need category/subcategory-like info if present in dictionary naming
          metaIndex.set(d.name, {
            category: (d as any).category,
            subcategory: (d as any).subcategory,
          })
        })
      } catch (e) {
        console.warn('Multilingual extraction failed, using fallback categorization:', e)
      }
    }

    // Process each flavor
    flavors.forEach(flavor => {
      const meta = metaIndex.get(flavor) || {}
      const category = meta.category || categorizeFlavorDescriptor(flavor)
      const key = `${category}-${flavor}`

      if (!flavorMap.has(key)) {
        flavorMap.set(key, {
          category,
          subcategory: meta.subcategory || getSubcategoryForDescriptor(flavor, category),
          descriptor: flavor,
          frequency: 0,
          intensity: 0,
          beverageTypes: [],
          regions: [],
          userCount: 0,
          lastDetected: tasting.created_at,
        })
      }

      const existing = flavorMap.get(key)!
      existing.frequency += 1
      existing.intensity += getFlavorIntensity(tasting, flavor)

      // Add beverage type if not already included
      const beverageType = tasting.type as MexicanBeverageType
      if (beverageType && !existing.beverageTypes.includes(beverageType)) {
        existing.beverageTypes.push(beverageType)
      }

      // Add region if available
      const region = tasting.mexican_beverages?.region
      if (region && !existing.regions.includes(region)) {
        existing.regions.push(region)
      }

      existing.lastDetected = tasting.created_at
    })
  })

  return flavorMap
}

/**
 * Converts flavor analysis to wheel data format
 */
function convertToWheelData(
  flavorAnalysis: Map<string, FlavorAnalysisData>,
  config: FlavorWheelConfig
): FlavorWheelData[] {
  const categoryMap = new Map<string, FlavorWheelData>()
  const totalFlavors = Array.from(flavorAnalysis.values()).reduce(
    (sum, item) => sum + item.frequency,
    0
  )

  // Group by category
  flavorAnalysis.forEach(analysis => {
    const categoryName = analysis.category

    if (!categoryMap.has(categoryName)) {
      const categoryInfo =
        MEXICAN_FLAVOR_CATEGORIES[categoryName as keyof typeof MEXICAN_FLAVOR_CATEGORIES]
      categoryMap.set(categoryName, {
        name: categoryName,
        color: categoryInfo?.color || '#95a5a6',
        percentage: 0,
        intensity: 0,
        count: 0,
        subcategories: [],
      })
    }

    const category = categoryMap.get(categoryName)!
    category.count += analysis.frequency
    category.intensity += analysis.intensity
    category.percentage = (category.count / totalFlavors) * 100

    // Add to subcategories (simplified for now)
    const subcategoryName =
      analysis.subcategory || getSubcategoryForDescriptor(analysis.descriptor, categoryName)
    let subcategory = category.subcategories?.find(sub => sub.name === subcategoryName)

    if (!subcategory) {
      subcategory = {
        name: subcategoryName,
        percentage: 0,
        intensity: 0,
        descriptors: [],
      }
      category.subcategories?.push(subcategory)
    }

    subcategory.descriptors?.push({
      name: analysis.descriptor,
      percentage: (analysis.frequency / totalFlavors) * 100,
      intensity: analysis.intensity / analysis.frequency,
      regions: analysis.regions,
      beverageTypes: analysis.beverageTypes,
    })

    subcategory.percentage += (analysis.frequency / totalFlavors) * 100
    subcategory.intensity = Math.max(subcategory.intensity, analysis.intensity / analysis.frequency)
  })

  // Calculate average intensities
  categoryMap.forEach(category => {
    if (category.count > 0) {
      category.intensity = category.intensity / category.count
    }
  })

  return Array.from(categoryMap.values()).sort((a, b) => b.percentage - a.percentage)
}

// Helper functions
function extractAromaFlavors(tasting: any): string[] {
  const flavors: string[] = []

  if (tasting.notes?.aroma) {
    if (Array.isArray(tasting.notes.aroma)) {
      flavors.push(...tasting.notes.aroma)
    } else if (typeof tasting.notes.aroma === 'string') {
      flavors.push(...tasting.notes.aroma.split(',').map((f: string) => f.trim()))
    }
  }

  // beverage-derived notes can be merged later via tasting_items if desired

  return flavors.filter(f => f && f.length > 0)
}

function extractTasteFlavors(tasting: any): string[] {
  const flavors: string[] = []

  if (tasting.notes?.taste || tasting.notes?.flavor) {
    const tasteNotes = tasting.notes.taste || tasting.notes.flavor
    if (Array.isArray(tasteNotes)) {
      flavors.push(...tasteNotes)
    } else if (typeof tasteNotes === 'string') {
      flavors.push(...tasteNotes.split(',').map((f: string) => f.trim()))
    }
  }

  // beverage-derived notes can be merged later via tasting_items if desired

  return flavors.filter(f => f && f.length > 0)
}

function extractMetaphorFlavors(tasting: any): string[] {
  const metaphors: string[] = []

  if (tasting.notes?.metaphors) {
    if (Array.isArray(tasting.notes.metaphors)) {
      metaphors.push(...tasting.notes.metaphors)
    }
  }

  return metaphors.filter(m => m && m.length > 0)
}

function categorizeFlavorDescriptor(descriptor: string): string {
  const lowerDescriptor = descriptor.toLowerCase()

  // Consolidated categorization to eliminate redundancies
  // Check for most specific matches first to avoid conflicts

  // Fruit-related (consolidate fruity/fruit variations)
  if (lowerDescriptor.includes('fruta') || lowerDescriptor.includes('cítrico') ||
      lowerDescriptor.includes('fruity') || lowerDescriptor.includes('fruit') ||
      lowerDescriptor.includes('citrus') || lowerDescriptor.includes('citric')) {
    return 'Frutal'
  }

  // Floral
  if (lowerDescriptor.includes('flor') || lowerDescriptor.includes('floral') ||
      lowerDescriptor.includes('rosa') || lowerDescriptor.includes('flower')) {
    return 'Floral'
  }

  // Herbal/Spicy
  if (lowerDescriptor.includes('hierba') || lowerDescriptor.includes('herbal') ||
      lowerDescriptor.includes('especia') || lowerDescriptor.includes('spicy') ||
      lowerDescriptor.includes('spice') || lowerDescriptor.includes('mint')) {
    return 'Herbal'
  }

  // Smoky/Earthy
  if (lowerDescriptor.includes('humo') || lowerDescriptor.includes('ahumado') ||
      lowerDescriptor.includes('smoky') || lowerDescriptor.includes('smoke')) {
    return 'Ahumado'
  }

  // Mineral/Earthy
  if (lowerDescriptor.includes('tierra') || lowerDescriptor.includes('mineral') ||
      lowerDescriptor.includes('earthy') || lowerDescriptor.includes('earth')) {
    return 'Mineral'
  }

  // Sweet
  if (lowerDescriptor.includes('dulce') || lowerDescriptor.includes('sweet') ||
      lowerDescriptor.includes('miel') || lowerDescriptor.includes('honey') ||
      lowerDescriptor.includes('caramel')) {
    return 'Dulce'
  }

  // Spiced
  if (lowerDescriptor.includes('canela') || lowerDescriptor.includes('vainilla') ||
      lowerDescriptor.includes('cinnamon') || lowerDescriptor.includes('vanilla') ||
      lowerDescriptor.includes('clove') || lowerDescriptor.includes('nutmeg')) {
    return 'Especiado'
  }

  // Agave
  if (lowerDescriptor.includes('agave') || lowerDescriptor.includes('maguey')) {
    return 'Agave'
  }

  return 'Otros'
}

function getSubcategoryForDescriptor(descriptor: string, category: string): string {
  const categoryInfo = MEXICAN_FLAVOR_CATEGORIES[category as keyof typeof MEXICAN_FLAVOR_CATEGORIES]
  if (categoryInfo?.subcategories) {
    // Simple matching - could be enhanced with ML
    return categoryInfo.subcategories[0]
  }
  return 'General'
}

function getFlavorIntensity(tasting: any, flavor: string): number {
  // Try to extract intensity from ratings or default to medium
  if (tasting.ratings?.intensity) {
    return tasting.ratings.intensity
  }
  return 5 // Default medium intensity
}

/**
 * Generates mock data for demonstration when no real data is available
 */
// Removed mock fallback to avoid masking data issues

/**
 * Gets flavor statistics for the sidebar
 */
export async function getFlavorStatistics(userId?: string): Promise<{
  totalTastings: number
  categoriesDetected: number
  dominantFlavor: string
  lastUpdate: string
}> {
  try {
    let query = supabase.from('tastings').select('id, notes, created_at')

    if (userId) {
      query = query.eq('created_by', userId)
    }

    const { data: tastings, error } = await query

    if (error || !tastings) {
      console.error('Flavor stats error:', error)
      throw new Error('No se pudieron cargar estadísticas de sabor')
    }

    const flavorCounts = new Map<string, number>()

    tastings.forEach((tasting: any) => {
      const flavors = [...extractAromaFlavors(tasting), ...extractTasteFlavors(tasting)]

      flavors.forEach(flavor => {
        const category = categorizeFlavorDescriptor(flavor)
        flavorCounts.set(category, (flavorCounts.get(category) || 0) + 1)
      })
    })

    const dominantFlavor =
      Array.from(flavorCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Desconocido'

    // compute last update
    let lastUpdate = 'Nunca'
    let lastTs = 0
    tastings.forEach((t: any) => {
      const ts = Date.parse(t.created_at)
      if (!Number.isNaN(ts) && ts > lastTs) lastTs = ts
    })
    if (lastTs) lastUpdate = new Date(lastTs).toLocaleDateString('es-MX')

    return {
      totalTastings: tastings.length,
      categoriesDetected: flavorCounts.size,
      dominantFlavor,
      lastUpdate,
    }
  } catch (error) {
    console.error('Error getting flavor statistics:', error)
    throw error
  }
}

/**
 * Extracts flavors from free-form text using multilingual extraction
 */
export function extractFlavorsFromText(text: string): string[] {
  if (!text || typeof text !== 'string') return []

  try {
    // Use the multilingual extraction function
    const extracted = extractFlavorDescriptorsMultilingual(
      text,
      getMexicanFlavorDictionary() as any,
      'es-MX'
    )

    return extracted.map(descriptor => descriptor.name)
  } catch (error) {
    console.warn('Failed to extract flavors from text, using fallback:', error)

    // Fallback: naive keyword scan using a basic descriptor list to ensure non-empty results for flavorful text
    const fallbackTerms = [
      'agave','maguey','mezcal','tequila','citrus','lemon','lime','orange','grapefruit','floral','rose','jasmine','herbal','mint','eucalyptus','smoky','smoke','woody','mineral','sweet','honey','caramel','vanilla','chocolate','spicy','pepper','cinnamon','cardamom','clove','ginger','nutmeg','fruit','fruity','apple','berry','cherry','tropical'
    ]
    const lc = text.toLowerCase()
    const hits = new Set<string>()
    for (const term of fallbackTerms) {
      if (lc.includes(term)) hits.add(term)
    }
    return Array.from(hits)
  }
}

/**
 * Build hierarchical flavor wheel data from extracted keywords
 */
export function buildFlavorHierarchy(keywords: string[], productType: string = 'coffee'): FlavorWheelData {
  console.log('🎨 BUILDING HIERARCHY - Keywords:', keywords, 'Product:', productType)

  const hierarchy: FlavorWheelData = {
    name: `${productType.charAt(0).toUpperCase() + productType.slice(1)} Flavors`,
    color: '#8B4513',
    percentage: keywords.length === 0 ? 0 : 100,
    intensity: 5,
    count: keywords.length,
    subcategories: []
  }

  // Define explicit category mappings for better hierarchy building
  // Consolidated to match categorizeFlavorDescriptor function
  const categoryMappings = {
    'Frutal': ['lemon', 'citrus', 'lime', 'orange', 'apple', 'berry', 'cherry', 'pome fruits', 'fruity', 'fruit'],
    'Floral': ['floral', 'jasmine', 'rose', 'lilac', 'chamomile', 'flower'],
    'Herbal': ['herbal', 'green tea', 'minty', 'eucalyptus', 'leafy', 'fresh', 'mint'],
    'Ahumado': ['smoky', 'smoke', 'earthy', 'earth', 'woody', 'cedar', 'forest', 'leather'],
    'Mineral': ['mineral', 'earthy', 'earth', 'stone', 'rock'],
    'Dulce': ['sweet', 'honey', 'caramel', 'vanilla', 'vainilla', 'chocolate', 'sugar'],
    'Especiado': ['cinnamon', 'spicy', 'peppery', 'cardamom', 'clove', 'ginger', 'nutmeg', 'spice'],
    'Agave': ['agave', 'maguey', 'mezcal', 'tequila']
  }

  // Group keywords by flavor categories using explicit mappings
  const categoryMap: { [key: string]: string[] } = {}

  keywords.forEach(keyword => {
    let foundCategory = 'Other'

    // Check explicit mappings first
    Object.entries(categoryMappings).forEach(([category, descriptors]) => {
      if (descriptors.some(desc => desc.toLowerCase().includes(keyword.toLowerCase()) ||
                                 keyword.toLowerCase().includes(desc.toLowerCase()))) {
        foundCategory = category
      }
    })

    // Fallback to dictionary lookup if no explicit match
    if (foundCategory === 'Other') {
      const flavorDictionary = getMexicanFlavorDictionary()
      Object.entries(flavorDictionary).forEach(([category, data]) => {
        if (data.subcategories) {
          Object.values(data.subcategories).forEach(subcategory => {
            if ((subcategory as any).descriptors && Array.isArray((subcategory as any).descriptors)) {
              if ((subcategory as any).descriptors.some((desc: any) =>
                typeof desc === 'string' ? desc.toLowerCase().includes(keyword.toLowerCase()) :
                desc.name?.toLowerCase().includes(keyword.toLowerCase())
              )) {
                foundCategory = category.charAt(0).toUpperCase() + category.slice(1)
              }
            }
          })
        }
      })
    }

    if (!categoryMap[foundCategory]) {
      categoryMap[foundCategory] = []
    }
    categoryMap[foundCategory].push(keyword)
  })

  console.log('🎨 CATEGORY MAPPINGS:', categoryMap)

  // Build subcategory structure
  Object.entries(categoryMap).forEach(([category, terms]) => {
    const subcategory = {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      percentage: (terms.length / keywords.length) * 100,
      intensity: 4,
      descriptors: terms.map(term => ({
        name: term,
        percentage: 100 / terms.length,
        intensity: 3,
        regions: [] as string[],
        beverageTypes: [] as any[]
      }))
    } as any

    ;(hierarchy.subcategories as any[])?.push(subcategory)
  })

  console.log('🎨 BUILT HIERARCHY:', hierarchy)
  return hierarchy
}
