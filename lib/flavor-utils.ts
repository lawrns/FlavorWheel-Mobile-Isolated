import type { FlavorDescriptorWithMetadata, MexicanFlavorDictionary, FlavorSubcategory } from '@/types/flavor-types'
import type { MexicanBeverageType } from '@/types/mexican-types'
import {
  getMexicanFlavorDictionary,
  getMexicanSpanishTranslations,
} from '@/services/flavor-dictionary-service'

/**
 * Adjusts the brightness of a color by a percentage
 * @param color - The color in hex format (e.g., "#FF6B6B")
 * @param percent - The percentage to adjust brightness by
 * @returns The adjusted color in hex format
 */
export function adjustBrightness(color: string, percent: number): string {
  const num = Number.parseInt(color.replace('#', ''), 16)
  const r = (num >> 16) + percent
  const g = ((num >> 8) & 0x00ff) + percent
  const b = (num & 0x0000ff) + percent

  return `#${(
    (Math.min(Math.max(r, 0), 255) << 16) |
    (Math.min(Math.max(g, 0), 255) << 8) |
    Math.min(Math.max(b, 0), 255)
  )
    .toString(16)
    .padStart(6, '0')}`
}

/**
 * Gets a color for a specific flavor category
 * @param flavor - The flavor category name
 * @returns The color in hex format
 */
export function getColorForFlavor(flavor: string): string {
  // Mexican beverage specific colors
  const mexicanBeverageColors: Record<string, string> = {
    // Mezcal colors
    mezcal: '#8B4513',
    agave: '#228B22',
    smoke: '#696969',
    earth: '#8B4513',
    mineral: '#708090',

    // Tequila colors
    tequila: '#FFD700',
    highland: '#87CEEB',
    lowland: '#DEB887',
    blue_weber: '#4169E1',

    // Sotol colors
    sotol: '#F4A460',
    desert: '#D2B48C',

    // Pulque colors
    pulque: '#F5F5DC',
    fermented: '#DDA0DD',

    // Mexican food flavors
    chile: '#FF4500',
    mole: '#8B4513',
    cacao: '#D2691E',
    corn: '#FFD700',
    nopal: '#32CD32',
    tamarind: '#CD853F',

    // Traditional colors
    Fruity: '#FF6B6B',
    Floral: '#4ECDC4',
    Sweet: '#FFD166',
    Nutty: '#C06014',
    Spicy: '#F45D01',
    Earthy: '#6B705C',
  }

  return mexicanBeverageColors[flavor] || mexicanBeverageColors[flavor.toLowerCase()] || '#888888'
}

/**
 * Extracts flavor descriptors from a text review
 * @param text - The review text
 * @param descriptorDictionary - Dictionary of flavor descriptors
 * @returns Array of matched descriptors
 */
export function extractFlavorDescriptors(
  text: string,
  descriptorDictionary: Record<string, string[] | Record<string, string[]>> = {}
): string[] {
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase()

  // Normalize punctuation
  const normalizedText = ' ' + lowerText.replace(/[.,;:!?]/g, ' ') + ' '

  // Flatten the descriptor dictionary into a single array
  const allDescriptors: string[] = []
  const dict = descriptorDictionary || {}
  Object.values(dict).forEach(categoryDescriptors => {
    if (Array.isArray(categoryDescriptors)) {
      allDescriptors.push(...categoryDescriptors)
    } else {
      Object.values(categoryDescriptors).forEach(subcategoryDescriptors => {
        if (Array.isArray(subcategoryDescriptors)) {
          allDescriptors.push(...subcategoryDescriptors)
        }
      })
    }
  })

  // Find matches
  const matches: string[] = []

  // First check multi-word descriptors (to avoid partial matches)
  const multiWordDescriptors = allDescriptors.filter(d => d.includes(' '))
  multiWordDescriptors.forEach(descriptor => {
    if (normalizedText.includes(` ${descriptor} `)) {
      matches.push(descriptor)
    }
  })

  // Then check single-word descriptors
  const singleWordDescriptors = allDescriptors.filter(d => !d.includes(' '))
  singleWordDescriptors.forEach(descriptor => {
    if (normalizedText.includes(` ${descriptor} `)) {
      matches.push(descriptor)
    }
  })

  return [...new Set(matches)] // Remove duplicates
}

/**
 * Extracts flavor descriptors with multilingual support (es-MX)
 * @param text - The review text
 * @param descriptorDictionary - Dictionary of flavor descriptors
 * @param locale - The locale for matching ('en' or 'es-MX')
 * @returns Array of matched descriptors with metadata
 */
export function extractFlavorDescriptorsMultilingual(
  text: string,
  descriptorDictionary: Record<string, string[] | Record<string, string[]>>,
  locale: 'en' | 'es-MX' = 'es-MX'
): FlavorDescriptorWithMetadata[] {
  const lowerText = text.toLowerCase()
  const normalizedText = ' ' + lowerText.replace(/[.,;:!?¿¡]/g, ' ') + ' '
  const matches: FlavorDescriptorWithMetadata[] = []

  // Get Mexican flavor dictionary for metadata matching
  const mexicanDict = getMexicanFlavorDictionary()

  // Search through Mexican flavor dictionary
  Object.values(mexicanDict).forEach((category: any) => {
    Object.values(category.subcategories).forEach((subcategory: any) => {
      subcategory.descriptors.forEach((descriptor: any) => {
        const searchTerm =
          locale === 'es-MX'
            ? descriptor.translations['es-MX'].toLowerCase()
            : descriptor.translations.en.toLowerCase()

        // Also check characteristics for matching
        const characteristicMatches = descriptor.characteristics.some((char: string) =>
          normalizedText.includes(` ${char.toLowerCase()} `)
        )

        if (normalizedText.includes(` ${searchTerm} `) || characteristicMatches) {
          matches.push(descriptor)
        }
      })
    })
  })

  // Fallback to traditional extraction for non-Mexican descriptors
  const traditionalMatches = extractFlavorDescriptors(text, descriptorDictionary)
  traditionalMatches.forEach(match => {
    // Convert traditional matches to metadata format
    const metadataDescriptor: FlavorDescriptorWithMetadata = {
      name: match,
      characteristics: [match],
      translations: {
        'es-MX': getMexicanSpanishTranslations(match, 'es-MX'),
        en: getMexicanSpanishTranslations(match, 'en'),
      },
    }
    matches.push(metadataDescriptor)
  })

  return [...new Set(matches)] // Remove duplicates
}

/**
 * Gets Mexican flavor profile for a specific beverage type
 * @param beverageType - The Mexican beverage type
 * @param region - Optional region filter
 * @returns Array of flavor descriptors specific to the beverage type
 */
export function getMexicanFlavorProfile(
  beverageType: MexicanBeverageType,
  region?: string
): FlavorDescriptorWithMetadata[] {
  const mexicanDict = getMexicanFlavorDictionary()
  const profile: FlavorDescriptorWithMetadata[] = []

  Object.values(mexicanDict).forEach(category => {
    if (category.mexicanBeverageTypes?.includes(beverageType)) {
      (Object.values(category.subcategories) as FlavorSubcategory[]).forEach((subcategory) => {
        (subcategory.descriptors || []).forEach((descriptor: any) => {
          if (typeof descriptor === 'string') return
          if (!region || descriptor.region === region || descriptor.regions?.includes(region)) {
            profile.push(descriptor as FlavorDescriptorWithMetadata)
          }
        })
      })
    }
  })

  return profile
}

/**
 * Gets terroir characteristics for flavor analysis
 * @param region - The region to get characteristics for
 * @returns Array of terroir-specific flavor descriptors
 */
export function getTerroirCharacteristics(region: string): FlavorDescriptorWithMetadata[] {
  const mexicanDict = getMexicanFlavorDictionary()
  const characteristics: FlavorDescriptorWithMetadata[] = []

  // Look for terroir-specific descriptors
  Object.values(mexicanDict).forEach(category => {
    (Object.values(category.subcategories) as FlavorSubcategory[]).forEach((subcategory) => {
      if (
        subcategory.name.toLowerCase().includes('terroir') ||
        subcategory.name.toLowerCase().includes('regional')
      ) {
        (subcategory.descriptors || []).forEach((descriptor: any) => {
          if (typeof descriptor === 'string') return
          if (descriptor.region === region || descriptor.regions?.includes(region)) {
            characteristics.push(descriptor as FlavorDescriptorWithMetadata)
          }
        })
      }
    })
  })

  return characteristics
}

/**
 * Gets agave flavor profile based on variety
 * @param agaveVariety - The agave variety name
 * @returns Array of flavor descriptors for the agave variety
 */
export function getAgaveFlavorProfile(agaveVariety: string): FlavorDescriptorWithMetadata[] {
  const mexicanDict = getMexicanFlavorDictionary()
  const profile: FlavorDescriptorWithMetadata[] = []

  // Look for agave variety descriptors
  Object.values(mexicanDict).forEach(category => {
    (Object.values(category.subcategories) as FlavorSubcategory[]).forEach((subcategory) => {
      if (
        subcategory.name.toLowerCase().includes('agave') ||
        subcategory.name.toLowerCase().includes('varieties')
      ) {
        (subcategory.descriptors || []).forEach((descriptor: any) => {
          if (typeof descriptor === 'string') return
          if (
            descriptor.name.toLowerCase().includes(agaveVariety.toLowerCase()) ||
            (descriptor as any).agaveType === agaveVariety
          ) {
            profile.push(descriptor as FlavorDescriptorWithMetadata)
          }
        })
      }
    })
  })

  return profile
}

/**
 * Translates descriptors between languages
 * @param descriptors - Array of descriptor names
 * @param targetLocale - Target locale ('en' or 'es-MX')
 * @returns Array of translated descriptors
 */
export function translateDescriptors(
  descriptors: string[],
  targetLocale: 'en' | 'es-MX'
): string[] {
  return descriptors.map(descriptor => getMexicanSpanishTranslations(descriptor, targetLocale))
}

/**
 * Extracts Mexican cultural references from text
 * @param text - The review text
 * @returns Array of cultural references found
 */
export function extractMexicanCulturalReferences(text: string): string[] {
  const lowerText = text.toLowerCase()
  const culturalTerms = [
    // Traditional terms
    'ancestral',
    'tradicional',
    'artesanal',
    'maestro mezcalero',
    'palenque',
    'tahona',
    'horno de tierra',
    'olla de barro',

    // Regional terms
    'oaxaqueño',
    'jalisciense',
    'duranguense',
    'guerrerense',

    // Cultural practices
    'ritual',
    'ceremonia',
    'ofrenda',
    'día de muertos',
    'gusano',
    'sal de gusano',
    'naranja',
    'limón',

    // Traditional foods
    'mole',
    'chapulines',
    'tlayuda',
    'pozole',
    'birria',
    'tamal',
    'quesadilla',
    'salsa',
    'guacamole',

    // Agave terms
    'piña',
    'corazón',
    'quiote',
    'pencas',
    'hijuelos',
  ]

  const matches: string[] = []
  culturalTerms.forEach(term => {
    if (lowerText.includes(term)) {
      matches.push(term)
    }
  })

  return [...new Set(matches)]
}
