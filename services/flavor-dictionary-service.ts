/**
 * Service for working with the flavor dictionary
 * Task T04: Dictionary lookup service - Map tokens → canonical keywords
 */

import { supabase } from '@/lib/supabase'
import type { TokenSpan } from '@/lib/text/normalize'
import { jaroWinklerSimilarity } from '@/lib/nlp/match'
import type {
  FlavorDictionary,
  MexicanFlavorDictionary,
  FlavorDescriptorWithMetadata
} from '@/types/flavor-types'
import type { MexicanBeverageType } from '@/types/mexican-types'

export interface FlavorMatch {
  variant: string
  keyword_id: string
  keyword: string
  category: string
  subcategory?: string
  language: 'es' | 'en'
  intensity_weight: number
  product_types: string[]
  span: TokenSpan
  matchType: 'exact' | 'fuzzy'
  similarity?: number
}

export interface DictionaryLookupOptions {
  language?: 'es' | 'en'
  productTypes?: string[]
  enableFuzzyMatch?: boolean
  fuzzyThreshold?: number
  jaroWinklerThreshold?: number
  enableNGramMatch?: boolean
  ngramThreshold?: number
  enableLemmaMatch?: boolean
  maxResults?: number
  lemmas?: string[]
  phrases?: string[]
}

/**
 * Look up flavor keywords from tokens
 * Maps normalized tokens to canonical flavor keywords with metadata
 */
export async function lookupFlavorKeywords(
  tokens: string[],
  spans: TokenSpan[],
  options: DictionaryLookupOptions = {}
): Promise<FlavorMatch[]> {
  const {
    language,
    productTypes,
    enableFuzzyMatch = process.env.FEATURE_FUZZY_MATCH === 'true',
    fuzzyThreshold = 0.70, // Lowered from 0.75 for better recall
    jaroWinklerThreshold = 0.70, // Lowered from 0.85 for better recall
    enableNGramMatch = true,
    ngramThreshold = 0.65, // Lowered from 0.7 for better recall
    enableLemmaMatch = true,
    maxResults = 1000,
    lemmas = [],
    phrases = []
  } = options

  if (tokens.length === 0) {
    return []
  }

  const matches: FlavorMatch[] = []

  try {
    // Step 1: Exact matches on variants
    let exactQuery = supabase
      .from('flavor_keyword_variants')
      .select(`
        variant,
        keyword_id,
        language,
        flavor_keywords!inner (
          keyword,
          category,
          subcategory,
          intensity_weight,
          product_types
        )
      `)
      .in('variant', tokens)

    // Apply language filter if specified
    if (language) {
      exactQuery = exactQuery.eq('language', language)
    }

    const { data: exactMatches, error: exactError } = await exactQuery.limit(maxResults)

    if (exactError) {
      console.error('Error in exact keyword lookup:', exactError)
    } else if (exactMatches) {
      // Process exact matches
      for (const match of exactMatches) {
        const tokenIndex = tokens.indexOf(match.variant)
        if (tokenIndex !== -1 && match.flavor_keywords) {
          const keyword = match.flavor_keywords as any

          // Filter by product types if specified
          if (productTypes && productTypes.length > 0) {
            const hasMatchingProductType = keyword.product_types.some((pt: string) =>
              productTypes.includes(pt)
            )
            if (!hasMatchingProductType) continue
          }

          matches.push({
            variant: match.variant,
            keyword_id: match.keyword_id,
            keyword: keyword.keyword,
            category: keyword.category,
            subcategory: keyword.subcategory,
            language: match.language,
            intensity_weight: keyword.intensity_weight,
            product_types: keyword.product_types,
            span: spans[tokenIndex],
            matchType: 'exact'
          })
        }
      }
    }

    // Step 2: Fuzzy matches (if enabled and no exact matches found)
    if (enableFuzzyMatch && matches.length < tokens.length) {
      const unmatchedTokens = tokens.filter(token =>
        !matches.some(match => match.variant === token)
      )

      if (unmatchedTokens.length > 0) {
        let fuzzyQuery = supabase
          .from('flavor_keyword_variants')
          .select(`
            variant,
            keyword_id,
            language,
            flavor_keywords!inner (
              keyword,
              category,
              subcategory,
              intensity_weight,
              product_types
            )
          `)
          .textSearch('variant', unmatchedTokens.join(' | '), {
            type: 'websearch',
            config: 'english'
          })

        // Apply language filter if specified
        if (language) {
          fuzzyQuery = fuzzyQuery.eq('language', language)
        }

        const { data: fuzzyMatches, error: fuzzyError } = await fuzzyQuery.limit(maxResults)

        if (fuzzyError) {
          console.error('Error in fuzzy keyword lookup:', fuzzyError)
        } else if (fuzzyMatches) {
          // Process fuzzy matches with similarity scoring
          for (const match of fuzzyMatches) {
            const keyword = match.flavor_keywords as any

            // Filter by product types if specified
            if (productTypes && productTypes.length > 0) {
              const hasMatchingProductType = keyword.product_types.some((pt: string) =>
                productTypes.includes(pt)
              )
              if (!hasMatchingProductType) continue
            }

            // Find best matching token using advanced similarity
            let bestToken = ''
            let bestSimilarity = 0
            let bestTokenIndex = -1
            let bestMatchType = 'fuzzy'

            for (let i = 0; i < unmatchedTokens.length; i++) {
              const token = unmatchedTokens[i]

              // Try Jaro-Winkler similarity first (more accurate)
              const jaroSimilarity = jaroWinklerSimilarity(token, match.variant)
              if (jaroSimilarity >= jaroWinklerThreshold && jaroSimilarity > bestSimilarity) {
                bestToken = token
                bestSimilarity = jaroSimilarity
                bestTokenIndex = tokens.indexOf(token)
                bestMatchType = 'jaro-winkler'
                continue
              }

              // Fallback to Levenshtein-based similarity
              const levenshteinSimilarity = calculateSimilarity(token, match.variant)
              if (levenshteinSimilarity >= fuzzyThreshold && levenshteinSimilarity > bestSimilarity) {
                bestToken = token
                bestSimilarity = levenshteinSimilarity
                bestTokenIndex = tokens.indexOf(token)
                bestMatchType = 'levenshtein'
              }
            }

            if (bestToken && bestTokenIndex !== -1) {
              matches.push({
                variant: match.variant,
                keyword_id: match.keyword_id,
                keyword: keyword.keyword,
                category: keyword.category,
                subcategory: keyword.subcategory,
                language: match.language,
                intensity_weight: keyword.intensity_weight,
                product_types: keyword.product_types,
                span: spans[bestTokenIndex],
                matchType: bestMatchType as 'exact' | 'fuzzy',
                similarity: bestSimilarity
              })
            }
          }
        }
      }
    }

    // Step 3: Lemma-based matching (if enabled and lemmas provided)
    if (enableLemmaMatch && lemmas.length > 0 && matches.length < tokens.length) {
      const unmatchedTokens = tokens.filter(token =>
        !matches.some(match => match.variant === token)
      )

      if (unmatchedTokens.length > 0) {
        let lemmaQuery = supabase
          .from('flavor_keywords')
          .select(`
            id,
            keyword,
            category,
            subcategory,
            language,
            intensity_weight,
            product_types,
            lemmas
          `)
          .overlaps('lemmas', lemmas)

        // Apply language filter if specified
        if (language) {
          lemmaQuery = lemmaQuery.eq('language', language)
        }

        const { data: lemmaMatches, error: lemmaError } = await lemmaQuery.limit(maxResults)

        if (lemmaError) {
          console.error('Error in lemma keyword lookup:', lemmaError)
        } else if (lemmaMatches) {
          for (const match of lemmaMatches) {
            // Filter by product types if specified
            if (productTypes && productTypes.length > 0) {
              const hasMatchingProductType = match.product_types.some((pt: string) =>
                productTypes.includes(pt)
              )
              if (!hasMatchingProductType) continue
            }

            // Find which lemma matched
            const matchingLemmas = match.lemmas.filter((lemma: string) => lemmas.includes(lemma))

            for (const matchingLemma of matchingLemmas) {
              // Find the original token that produced this lemma
              const originalTokenIndex = tokens.findIndex((token, idx) =>
                lemmas[idx] === matchingLemma && !matches.some(m => m.span === spans[idx])
              )

              if (originalTokenIndex !== -1) {
                matches.push({
                  variant: matchingLemma,
                  keyword_id: match.id,
                  keyword: match.keyword,
                  category: match.category,
                  subcategory: match.subcategory,
                  language: match.language,
                  intensity_weight: match.intensity_weight,
                  product_types: match.product_types,
                  span: spans[originalTokenIndex],
                  matchType: 'fuzzy', // Lemma matching is considered fuzzy
                  similarity: 0.9 // High confidence for lemma matches
                })
              }
            }
          }
        }
      }
    }

    // Step 4: N-gram phrase matching (if enabled and phrases provided)
    if (enableNGramMatch && phrases.length > 0) {
      let phraseQuery = supabase
        .from('flavor_keywords')
        .select(`
          id,
          keyword,
          category,
          subcategory,
          language,
          intensity_weight,
          product_types,
          compound_phrase
        `)
        .eq('compound_phrase', true)

      // Apply language filter if specified
      if (language) {
        phraseQuery = phraseQuery.eq('language', language)
      }

      const { data: phraseMatches, error: phraseError } = await phraseQuery.limit(maxResults)

      if (phraseError) {
        console.error('Error in phrase keyword lookup:', phraseError)
      } else if (phraseMatches) {
        for (const match of phraseMatches) {
          // Filter by product types if specified
          if (productTypes && productTypes.length > 0) {
            const hasMatchingProductType = match.product_types.some((pt: string) =>
              productTypes.includes(pt)
            )
            if (!hasMatchingProductType) continue
          }

          // Check if any phrase matches this compound keyword
          for (const phrase of phrases) {
            const similarity = jaroWinklerSimilarity(phrase.toLowerCase(), match.keyword.toLowerCase())

            if (similarity >= ngramThreshold) {
              // Find the span for this phrase (approximate)
              const phraseStart = tokens.findIndex(token => phrase.toLowerCase().includes(token.toLowerCase()))

              if (phraseStart !== -1) {
                matches.push({
                  variant: phrase,
                  keyword_id: match.id,
                  keyword: match.keyword,
                  category: match.category,
                  subcategory: match.subcategory,
                  language: match.language,
                  intensity_weight: match.intensity_weight,
                  product_types: match.product_types,
                  span: spans[phraseStart], // Use first token's span as approximation
                  matchType: 'fuzzy',
                  similarity: similarity
                })
              }
            }
          }
        }
      }
    }

    // Step 5: Sort matches by exact first, then by similarity
    matches.sort((a, b) => {
      if (a.matchType === 'exact' && b.matchType === 'fuzzy') return -1
      if (a.matchType === 'fuzzy' && b.matchType === 'exact') return 1
      if (a.matchType === 'fuzzy' && b.matchType === 'fuzzy') {
        return (b.similarity || 0) - (a.similarity || 0)
      }
      return 0
    })

    return matches

  } catch (error) {
    console.error('Error in flavor keyword lookup:', error)
    return []
  }
}

/**
 * Simple similarity calculation (Levenshtein-based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

// Legacy dictionary support (keeping existing structure for compatibility)
const flavorDictionary: any = {
  wine: {
    fruit: [
      'apple',
      'apricot',
      'blackberry',
      'blackcurrant',
      'cherry',
      'currant',
      'fig',
      'grapefruit',
      'lemon',
      'lime',
      'mango',
      'nectarine',
      'orange',
      'papaya',
      'peach',
      'pear',
      'pineapple',
      'plum',
      'raisin',
      'raspberry',
      'strawberry',
    ],
    floral: ['elderflower', 'honeysuckle', 'jasmine', 'rose', 'violet'],
    herbal_green: ['basil', 'cut grass', 'eucalyptus', 'green bell pepper', 'mint', 'thyme'],
    spice: ['anise', 'black pepper', 'cinnamon', 'clove', 'ginger', 'nutmeg', 'pepper'],
    oak_aged: ['cedar', 'cigar box', 'coconut', 'smoke', 'toast', 'vanilla'],
    earthy: ['forest floor', 'graphite', 'gravel', 'leather', 'mushroom', 'wet leaves', 'wet soil'],
    other: ['chalk', 'flint', 'petrol', 'rubber', 'saline'],
    tannin_texture: ['chalky', 'chewy', 'coarse', 'soft'],
  },
  coffee: {
    fruity: ['apple', 'berry', 'blueberry', 'cherry', 'grape', 'mango', 'pineapple', 'tropical', 'pome fruits', 'citrus', 'lemon', 'lime', 'orange'],
    nutty_sweet: ['almond', 'brown sugar', 'caramel', 'hazelnut', 'honey', 'molasses', 'nutty', 'milky', 'creamy', 'vainilla', 'vanilla'],
    floral: ['jasmine', 'lilac', 'rose', 'green tea', 'tea-like', 'floral', 'chamomile'],
    spicy: ['cardamom', 'cinnamon', 'canela', 'clove', 'herbal', 'spicy', 'peppery', 'ginger', 'nutmeg'],
    earthy_woody: ['cedar', 'earth', 'forest', 'leather', 'tobacco', 'woody', 'chocolate', 'dark chocolate'],
    other: ['buttery', 'chocolate', 'creamy', 'dark chocolate', 'milk chocolate', 'sweet', 'bitter', 'tart', 'sour', 'rough'],
    acidity_types: ['citric', 'malic', 'tartaric', 'bright', 'acidic', 'lively', 'sharp'],
    body_descriptors: ['round', 'syrupy', 'thin', 'full-bodied', 'light', 'heavy', 'smooth'],
    herbal_vegetal: ['herbal', 'green tea', 'vegetal', 'grass', 'leafy', 'fresh', 'minty', 'eucalyptus'],
  },
  beer: {
    hop_aromas: ['citrus', 'dank', 'earthy', 'floral', 'herbal', 'pine', 'resin', 'tropical'],
    malt_aromas: [
      'biscuit',
      'bread',
      'caramel',
      'chocolate',
      'coffee',
      'roasted',
      'toast',
      'toffee',
    ],
    yeast_aromas: ['banana', 'bubblegum', 'clove', 'fruity', 'funky', 'phenolic', 'sulfur'],
    mouthfeel_finish: [
      'bitter',
      'clean',
      'creamy',
      'crisp',
      'dry',
      'sharp',
      'smooth',
      'sweet',
      'warming',
    ],
  },
}

// Mexican beverage flavor dictionary with metadata
const mexicanFlavorDictionary: MexicanFlavorDictionary = {
  mezcal: {
    name: 'Mezcal',
    description: 'Traditional Mexican spirit made from agave',
    mexicanBeverageTypes: ['mezcal'],
    subcategories: {
      agave_varieties: {
        name: 'Agave Varieties',
        descriptors: [],
      },
      smoke_types: {
        name: 'Smoke Characteristics',
        descriptors: [],
      },
      terroir: {
        name: 'Terroir Characteristics',
        descriptors: [],
      },
    },
  },
  tequila: {
    name: 'Tequila',
    description: 'Mexican spirit made from Blue Weber agave',
    mexicanBeverageTypes: ['tequila'],
    subcategories: {
      regions: {
        name: 'Regional Characteristics',
        descriptors: [],
      },
      aging: {
        name: 'Aging Categories',
        descriptors: [],
      },
    },
  },
  sotol: {
    name: 'Sotol',
    description: 'Mexican spirit made from Desert Spoon plant',
    mexicanBeverageTypes: ['sotol'],
    subcategories: {
      characteristics: {
        name: 'Sotol Characteristics',
        descriptors: [],
      },
    },
  },
  pulque: {
    name: 'Pulque',
    description: 'Traditional fermented agave beverage',
    mexicanBeverageTypes: ['pulque'],
    subcategories: {
      traditional: {
        name: 'Traditional Characteristics',
        descriptors: [],
      },
    },
  },
  mexican_food: {
    name: 'Mexican Food Flavors',
    description: 'Traditional Mexican food flavor profiles',
    mexicanBeverageTypes: ['mezcal', 'tequila', 'sotol', 'pulque', 'raicilla'],
    subcategories: {
      chiles: {
        name: 'Chiles',
        descriptors: [],
      },
      spices: {
        name: 'Mexican Spices',
        descriptors: [],
      },
      traditional_ingredients: {
        name: 'Traditional Ingredients',
        descriptors: [],
      },
    },
  },
}

/**
 * Gets all descriptors for a specific category
 * @param category - The category to get descriptors for (e.g., "wine", "coffee")
 * @returns Array of descriptors
 */
export function getDescriptorsForCategory(category: string): string[] {
  if (!flavorDictionary[category]) {
    return []
  }

  const descriptors: string[] = []
  Object.values(flavorDictionary[category]).forEach(subcategoryDescriptors => {
    if (Array.isArray(subcategoryDescriptors)) {
      subcategoryDescriptors.forEach(descriptor => {
        if (typeof descriptor === 'string') {
          descriptors.push(descriptor)
        } else {
          descriptors.push(descriptor.name)
        }
      })
    }
  })

  return descriptors
}

/**
 * Gets all subcategories for a specific category
 * @param category - The category to get subcategories for
 * @returns Array of subcategory names
 */
export function getSubcategoriesForCategory(category: string): string[] {
  if (!flavorDictionary[category]) {
    return []
  }

  return Object.keys(flavorDictionary[category])
}

/**
 * Gets all descriptors for a specific subcategory
 * @param category - The main category (e.g., "wine")
 * @param subcategory - The subcategory (e.g., "fruit")
 * @returns Array of descriptors
 */
export function getDescriptorsForSubcategory(category: string, subcategory: string): string[] {
  if (!flavorDictionary[category] || !flavorDictionary[category][subcategory]) {
    return []
  }

  const descriptors = flavorDictionary[category][subcategory]
  if (Array.isArray(descriptors)) {
    return descriptors.map(descriptor =>
      typeof descriptor === 'string' ? descriptor : descriptor.name
    )
  }

  return []
}

/**
 * Gets all available categories
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  return Object.keys(flavorDictionary)
}

/**
 * Gets the entire flavor dictionary
 * @returns The flavor dictionary
 */
export function getFlavorDictionary(): FlavorDictionary {
  return flavorDictionary
}

/**
 * Gets Mexican beverage categories
 * @returns Array of Mexican beverage category names
 */
export function getMexicanBeverageCategories(): string[] {
  return Object.keys(mexicanFlavorDictionary)
}

/**
 * Gets agave varieties with their characteristics
 * @returns Array of agave variety descriptors
 */
export function getAgaveVarieties(): FlavorDescriptorWithMetadata[] {
  const mezcalCategory = mexicanFlavorDictionary.mezcal
  if (mezcalCategory?.subcategories?.agave_varieties) {
    return mezcalCategory.subcategories.agave_varieties.descriptors
  }
  return []
}

/**
 * Gets terroir descriptors for Mexican beverages
 * @returns Array of terroir descriptors
 */
export function getTerroirDescriptors(): FlavorDescriptorWithMetadata[] {
  const mezcalCategory = mexicanFlavorDictionary.mezcal
  if (mezcalCategory?.subcategories?.terroir) {
    return mezcalCategory.subcategories.terroir.descriptors
  }
  return []
}

/**
 * Gets descriptors by region
 * @param region - The region to filter by
 * @returns Array of descriptors for the specified region
 */
export function getDescriptorsByRegion(region: string): FlavorDescriptorWithMetadata[] {
  const descriptors: FlavorDescriptorWithMetadata[] = []

  Object.values(mexicanFlavorDictionary).forEach(category => {
    Object.values(category.subcategories).forEach(subcategory => {
      subcategory.descriptors.forEach(descriptor => {
        if (descriptor.region === region) {
          descriptors.push(descriptor)
        }
      })
    })
  })

  return descriptors
}

/**
 * Gets descriptors by production method
 * @param method - The production method to filter by
 * @returns Array of descriptors for the specified production method
 */
export function getDescriptorsByProductionMethod(method: string): FlavorDescriptorWithMetadata[] {
  const descriptors: FlavorDescriptorWithMetadata[] = []

  Object.values(mexicanFlavorDictionary).forEach(category => {
    Object.values(category.subcategories).forEach(subcategory => {
      subcategory.descriptors.forEach(descriptor => {
        if (descriptor.productionMethod === method) {
          descriptors.push(descriptor)
        }
      })
    })
  })

  return descriptors
}

/**
 * Gets Mexican Spanish translations for descriptors
 * @param descriptorName - The descriptor name to translate
 * @param locale - The target locale ('es-MX' or 'en')
 * @returns Translated descriptor name
 */
export function getMexicanSpanishTranslations(
  descriptorName: string,
  locale: 'es-MX' | 'en' = 'es-MX'
): string {
  // Search through all Mexican descriptors for the translation
  for (const category of Object.values(mexicanFlavorDictionary)) {
    for (const subcategory of Object.values(category.subcategories)) {
      const descriptor = subcategory.descriptors.find(
        d =>
          d.name === descriptorName ||
          d.translations.en === descriptorName ||
          d.translations['es-MX'] === descriptorName
      )
      if (descriptor) {
        return descriptor.translations[locale]
      }
    }
  }

  return descriptorName // Return original if no translation found
}

/**
 * Gets descriptors for a specific Mexican beverage type
 * @param beverageType - The Mexican beverage type
 * @returns Array of descriptors for the beverage type
 */
export function getDescriptorsForMexicanBeverage(
  beverageType: MexicanBeverageType
): FlavorDescriptorWithMetadata[] {
  const descriptors: FlavorDescriptorWithMetadata[] = []

  Object.values(mexicanFlavorDictionary).forEach(category => {
    if (category.mexicanBeverageTypes.includes(beverageType)) {
      Object.values(category.subcategories).forEach(subcategory => {
        descriptors.push(...subcategory.descriptors)
      })
    }
  })

  return descriptors
}

/**
 * Gets the Mexican flavor dictionary
 * @returns The Mexican flavor dictionary
 */
export function getMexicanFlavorDictionary(): MexicanFlavorDictionary {
  return mexicanFlavorDictionary
}

/**
 * Searches descriptors by characteristics
 * @param characteristics - Array of characteristics to search for
 * @returns Array of matching descriptors
 */
export function searchDescriptorsByCharacteristics(
  characteristics: string[]
): FlavorDescriptorWithMetadata[] {
  const descriptors: FlavorDescriptorWithMetadata[] = []

  Object.values(mexicanFlavorDictionary).forEach(category => {
    Object.values(category.subcategories).forEach(subcategory => {
      subcategory.descriptors.forEach(descriptor => {
        const hasMatchingCharacteristic = characteristics.some(char =>
          descriptor.characteristics.some(descChar =>
            descChar.toLowerCase().includes(char.toLowerCase())
          )
        )
        if (hasMatchingCharacteristic) {
          descriptors.push(descriptor)
        }
      })
    })
  })

  return descriptors
}

/**
 * Gets all Mexican food flavor descriptors
 * @returns Array of Mexican food flavor descriptors
 */
export function getMexicanFoodDescriptors(): FlavorDescriptorWithMetadata[] {
  const mexicanFoodCategory = mexicanFlavorDictionary.mexican_food
  const descriptors: FlavorDescriptorWithMetadata[] = []

  if (mexicanFoodCategory) {
    Object.values(mexicanFoodCategory.subcategories).forEach(subcategory => {
      descriptors.push(...subcategory.descriptors)
    })
  }

  return descriptors
}
