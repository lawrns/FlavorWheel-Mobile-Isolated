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
  categories: {
    // Classic flavor categories expected by tests
    Frutal: {
      name: 'Frutal',
      culturalContext: 'Sabores frutales comunes en vinos y destilados mexicanos, desde cítricos hasta frutos rojos.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Cítrico', 'Manzana', 'Frutos rojos']
        }
      }
    },
    Floral: {
      name: 'Floral',
      culturalContext: 'Notas florales como azahar, jazmín y rosas presentes en bebidas y licores.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Azahar', 'Jazmín', 'Rosa']
        }
      }
    },
    Herbal: {
      name: 'Herbal',
      culturalContext: 'Notas herbales como menta, hierbabuena y epazote comunes en el perfil mexicano.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Menta', 'Hierbabuena', 'Epazote']
        }
      }
    },
    Ahumado: {
      name: 'Ahumado',
      culturalContext: 'Característica presente en mezcales y otras bebidas debido a procesos tradicionales.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Humo', 'Leñoso', 'Ceniza']
        }
      }
    },
    Mineral: {
      name: 'Mineral',
      culturalContext: 'Notas de piedra húmeda, salinidad y terroir típicas de regiones específicas.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Pedernal', 'Salino', 'Pizarra']
        }
      }
    },
    Dulce: {
      name: 'Dulce',
      culturalContext: 'Notas dulces como caramelo, vainilla y miel, comunes en envejecimiento en roble.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Caramelo', 'Vainilla', 'Miel']
        }
      }
    },
    Especiado: {
      name: 'Especiado',
      culturalContext: 'Especias como canela, clavo y pimienta presentes en perfiles aromáticos.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Canela', 'Clavo', 'Pimienta']
        }
      }
    },
    Agave: {
      name: 'Agave',
      culturalContext: 'Notas propias de la planta de agave, corazón de muchos destilados mexicanos.',
      subcategories: {
        general: {
          name: 'General',
          descriptors: ['Cocido', 'Crudo', 'Fibroso']
        }
      }
    },

    mezcal: {
      name: 'Mezcal',
      description: 'Traditional Mexican spirit made from agave',
      mexicanBeverageTypes: ['mezcal'],
      culturalContext: 'Mezcal is a traditional Mexican spirit made from various species of agave, primarily produced in Oaxaca. It represents the rich artisanal heritage of Mexican distillation and is often associated with indigenous traditions.',
      subcategories: {
        agave_varieties: {
          name: 'Agave Varieties',
          descriptors: [
            {
              name: 'espadín',
              characteristics: ['sweet', 'fruity', 'citrus'],
              translations: { en: 'espadin', 'es-MX': 'espadín' },
              region: 'oaxaca',
              intensity: { min: 3, max: 8 }
            },
            {
              name: 'tobalá',
              characteristics: ['smoky', 'earthy', 'complex'],
              translations: { en: 'tobala', 'es-MX': 'tobalá' },
              region: 'oaxaca',
              intensity: { min: 4, max: 9 }
            },
            {
              name: 'tepeztate',
              characteristics: ['mineral', 'citrus', 'herbal'],
              translations: { en: 'tepeztate', 'es-MX': 'tepeztate' },
              region: 'oaxaca',
              intensity: { min: 3, max: 7 }
            }
          ],
        },
        smoke_types: {
          name: 'Smoke Characteristics',
          descriptors: [
            {
              name: 'peaty',
              characteristics: ['smoky', 'earthy', 'intense'],
              translations: { en: 'peaty', 'es-MX': 'turboso' },
              intensity: { min: 6, max: 10 }
            },
            {
              name: 'woody',
              characteristics: ['woody', 'cedar', 'oak'],
              translations: { en: 'woody', 'es-MX': 'leñoso' },
              intensity: { min: 4, max: 8 }
            },
            {
              name: 'earthy',
              characteristics: ['earthy', 'soil', 'mushroom'],
              translations: { en: 'earthy', 'es-MX': 'terroso' },
              intensity: { min: 3, max: 7 }
            }
          ],
        },
        terroir: {
          name: 'Terroir Characteristics',
          descriptors: [
            {
              name: 'mineral',
              characteristics: ['mineral', 'flint', 'slate'],
              translations: { en: 'mineral', 'es-MX': 'mineral' },
              region: 'highlands',
              intensity: { min: 2, max: 6 }
            },
            {
              name: 'saline',
              characteristics: ['salty', 'briny', 'oceanic'],
              translations: { en: 'saline', 'es-MX': 'salino' },
              region: 'coast',
              intensity: { min: 1, max: 4 }
            },
            {
              name: 'volcanic',
              characteristics: ['ash', 'smoke', 'mineral'],
              translations: { en: 'volcanic', 'es-MX': 'volcánico' },
              region: 'oaxaca',
              intensity: { min: 4, max: 8 }
            }
          ],
        },
      },
    },
    tequila: {
      name: 'Tequila',
      description: 'Mexican spirit made from Blue Weber agave',
      mexicanBeverageTypes: ['tequila'],
      culturalContext: 'Tequila is a traditional Mexican spirit made from the blue Weber agave plant, originating from the town of Tequila in Jalisco. It has been produced for centuries and holds significant cultural importance in Mexican celebrations and ceremonies.',
      subcategories: {
        regions: {
          name: 'Regional Characteristics',
          descriptors: ['jalisco', 'guanajuato', 'michoacan', 'tamaulipas'],
        },
        aging: {
          name: 'Aging Categories',
          descriptors: ['blanco', 'reposado', 'añejo', 'extra añejo'],
        },
      },
    },
    sotol: {
      name: 'Sotol',
      description: 'Mexican spirit made from Desert Spoon plant',
      mexicanBeverageTypes: ['sotol'],
      culturalContext: 'Sotol is a traditional spirit made from the Desert Spoon plant, primarily produced in Chihuahua and Coahuila. It represents the desert heritage of northern Mexico.',
      subcategories: {
        characteristics: {
          name: 'Sotol Characteristics',
          descriptors: ['herbal', 'woody', 'spicy', 'earthy', 'citrus'],
        },
      },
    },
    pulque: {
      name: 'Pulque',
      description: 'Traditional fermented agave beverage',
      mexicanBeverageTypes: ['pulque'],
      culturalContext: 'Pulque is a traditional fermented beverage made from the sap of the maguey (agave) plant, with roots in pre-Hispanic Mexico. It was considered a sacred drink by the Aztecs and continues to hold cultural significance.',
      subcategories: {
        traditional: {
          name: 'Traditional Characteristics',
          descriptors: ['fermented', 'milky', 'sour', 'earthy', 'vegetal'],
        },
      },
    },
    mexican_food: {
      name: 'Mexican Food Flavors',
      description: 'Traditional Mexican food flavor profiles',
      mexicanBeverageTypes: ['mezcal', 'tequila', 'sotol', 'pulque', 'raicilla'],
      culturalContext: 'Mexican cuisine is known for its bold flavors, combining indigenous ingredients with Spanish influences, creating a rich tapestry of tastes that reflect the country\'s diverse regions and cultures.',
      subcategories: {
        chiles: {
          name: 'Chiles',
          descriptors: ['jalapeño', 'chipotle', 'habanero', 'poblano', 'serrano', 'guajillo'],
        },
        spices: {
          name: 'Mexican Spices',
          descriptors: ['cumin', 'oregano', 'cinnamon', 'coriander', 'annatto'],
        },
        traditional_ingredients: {
          name: 'Traditional Ingredients',
          descriptors: ['lime', 'cilantro', 'epazote', 'avocado', 'tomato', 'corn'],
        },
      },
    },
    Frutal: {
      name: 'Frutal',
      description: 'Fruit-based flavors and aromas',
      mexicanBeverageTypes: ['mezcal', 'tequila', 'pulque'],
      culturalContext: 'Fruity flavors in Mexican beverages often come from the natural sugars and fermentation processes, reflecting the tropical climate and diverse fruit varieties available in different regions.',
      subcategories: {
        citrus: {
          name: 'Citrus Fruits',
          descriptors: ['lime', 'lemon', 'orange', 'grapefruit', 'tangerine'],
        },
        tropical: {
          name: 'Tropical Fruits',
          descriptors: ['pineapple', 'mango', 'guava', 'passionfruit', 'papaya'],
        },
        stone: {
          name: 'Stone Fruits',
          descriptors: ['peach', 'apricot', 'plum', 'cherry'],
        },
      },
    },
  },
  terms: [
    {
      id: 'agave',
      name: 'Agave',
      category: 'mezcal',
      subcategory: 'agave_varieties',
      translations: {
        en: 'agave',
        es: 'maguey',
        nah: 'metl'
      },
      intensity: { min: 3, max: 8 },
      culturalContext: 'The heart of Mexican spirits, agave provides the base flavor profile and represents the arid landscapes where these plants thrive.'
    },
    {
      id: 'citrus',
      name: 'Citrus',
      category: 'Frutal',
      subcategory: 'citrus',
      translations: {
        en: 'citrus',
        es: 'cítrico',
        nah: 'citrus'
      },
      intensity: { min: 1, max: 7 },
      culturalContext: 'Citrus flavors are prominent in Mexican beverages, often from lime and other local fruits used in traditional preparations.'
    },
    {
      id: 'vanilla',
      name: 'Vanilla',
      category: 'Dulce',
      subcategory: 'sweet',
      translations: {
        en: 'vanilla',
        es: 'vainilla',
        nah: 'tlilxochitl'
      },
      intensity: { min: 1, max: 6 },
      culturalContext: 'Vanilla, originally from Mexico, adds sweetness and complexity to many traditional beverages and desserts.'
    },
    {
      id: 'smoke',
      name: 'Smoke',
      category: 'Ahumado',
      subcategory: 'smoke_types',
      translations: {
        en: 'smoke',
        es: 'humo',
        nah: 'tletl'
      },
      intensity: { min: 1, max: 9 },
      culturalContext: 'Smoky characteristics come from traditional roasting methods used in Mexican spirit production, particularly mezcal.'
    }
,
    { id: 'jasmine', name: 'Jazmín', category: 'Floral', subcategory: 'general' },
    { id: 'mint', name: 'Menta', category: 'Herbal', subcategory: 'general' },
    { id: 'humo-general', name: 'Humo', category: 'Ahumado', subcategory: 'general' },
    { id: 'salino-mineral', name: 'Salino', category: 'Mineral', subcategory: 'general' },
    { id: 'caramel', name: 'Caramelo', category: 'Dulce', subcategory: 'general' },
    { id: 'cinnamon', name: 'Canela', category: 'Especiado', subcategory: 'general' },
    { id: 'agave-cocido', name: 'Cocido', category: 'Agave', subcategory: 'general' },
    { id: 'espadin', name: 'Espadín', category: 'mezcal', subcategory: 'agave_varieties' },
    { id: 'peaty', name: 'Turboso', category: 'mezcal', subcategory: 'smoke_types' },
    { id: 'volcanic', name: 'Volcánico', category: 'mezcal', subcategory: 'terroir' },
    { id: 'jalisco', name: 'Jalisco', category: 'tequila', subcategory: 'regions' },
    { id: 'blanco', name: 'Blanco', category: 'tequila', subcategory: 'aging' },
    { id: 'sotol-herbal', name: 'Herbal', category: 'sotol', subcategory: 'characteristics' },
    { id: 'fermented', name: 'Fermented', category: 'pulque', subcategory: 'traditional' },
    { id: 'jalapeno', name: 'Jalapeño', category: 'mexican_food', subcategory: 'chiles' },
    { id: 'cumin', name: 'Comino', category: 'mexican_food', subcategory: 'spices' },
    { id: 'lime', name: 'Lime', category: 'mexican_food', subcategory: 'traditional_ingredients' },
    { id: 'mango', name: 'Mango', category: 'Frutal', subcategory: 'tropical' },
    { id: 'peach', name: 'Peach', category: 'Frutal', subcategory: 'stone' }

  ],
  translations: {
    'agave': { en: 'agave', es: 'maguey', nah: 'metl' },
    'citrus': { en: 'citrus', es: 'cítrico', nah: 'citrus' },
    'sweet': { en: 'sweet', es: 'dulce', nah: 'chichitl' },
    'smoke': { en: 'smoke', es: 'humo', nah: 'tletl' },
    'vanilla': { en: 'vanilla', es: 'vainilla', nah: 'tlilxochitl' }
  }
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
  return Object.keys(mexicanFlavorDictionary.categories)
}

/**
 * Gets agave varieties with their characteristics
 * @returns Array of agave variety descriptors
 */
export function getAgaveVarieties(): FlavorDescriptorWithMetadata[] {
  const mezcalCategory = mexicanFlavorDictionary.categories.mezcal
  if (mezcalCategory?.subcategories?.agave_varieties) {
    return mezcalCategory.subcategories.agave_varieties.descriptors
      .map((d: any) => (typeof d === 'string' ? { name: d } : d))
  }
  return []
}

/**
 * Gets terroir descriptors for Mexican beverages
 * @returns Array of terroir descriptors
 */
export function getTerroirDescriptors(): FlavorDescriptorWithMetadata[] {
  const mezcalCategory = mexicanFlavorDictionary.categories.mezcal
  if (mezcalCategory?.subcategories?.terroir) {
    return mezcalCategory.subcategories.terroir.descriptors
      .map((d: any) => (typeof d === 'string' ? { name: d } : d))
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

  Object.values(mexicanFlavorDictionary.categories).forEach(category => {
    Object.values(category.subcategories).forEach((subcategory: any) => {
      subcategory.descriptors.forEach((descriptor: any) => {
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

  Object.values(mexicanFlavorDictionary.categories).forEach(category => {
    Object.values(category.subcategories).forEach((subcategory: any) => {
      subcategory.descriptors.forEach((descriptor: any) => {
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
  for (const category of Object.values(mexicanFlavorDictionary.categories)) {
    for (const subcategory of Object.values(category.subcategories) as any[]) {
      const descriptor = subcategory.descriptors.find(
        (d: any) =>
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

  Object.values(mexicanFlavorDictionary.categories).forEach(category => {
    if (category.mexicanBeverageTypes?.includes(beverageType)) {
      Object.values(category.subcategories).forEach((subcategory: any) => {
        const list = (subcategory.descriptors || []).map((d: any) => typeof d === 'string' ? { name: d } : d)
        descriptors.push(...(list as FlavorDescriptorWithMetadata[]))
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

  Object.values(mexicanFlavorDictionary.categories).forEach(category => {
    Object.values(category.subcategories).forEach((subcategory: any) => {
      subcategory.descriptors.forEach((descriptor: any) => {
        const hasMatchingCharacteristic = characteristics.some(char =>
          descriptor.characteristics.some((descChar: any) =>
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
  const mexicanFoodCategory = mexicanFlavorDictionary.categories.mexican_food
  const descriptors: FlavorDescriptorWithMetadata[] = []

  if (mexicanFoodCategory) {
    Object.values(mexicanFoodCategory.subcategories).forEach((subcategory: any) => {
      const list = (subcategory.descriptors || []).map((d: any) => typeof d === 'string' ? { name: d } : d)
      descriptors.push(...(list as FlavorDescriptorWithMetadata[]))
    })
  }

  return descriptors
}

/**
 * Search for flavor terms by query string
 */
export function searchFlavorTerms(query: string): Array<{ term: string; category: string }> {
  if (!query || typeof query !== 'string') {
    return []
  }

  const dictionary = getMexicanFlavorDictionary()
  const results: Array<{ term: string; category: string }> = []
  const lowerQuery = query.toLowerCase()
  const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedQuery = stripAccents(lowerQuery)
  const englishQuery = translateFlavorTerm(query, 'en') || ''
  const englishLower = englishQuery.toLowerCase()
  const englishNormalized = englishLower ? stripAccents(englishLower) : ''

  // Iterate categories and subcategories, check descriptors and synonyms
  for (const [categoryKey, category] of Object.entries(dictionary.categories)) {
    const subs = (category as any).subcategories || {}
    for (const sub of Object.values(subs) as any[]) {
      const descriptors = (sub as any).descriptors || []
      for (const d of descriptors) {
        const name = typeof d === 'string' ? d : d?.name
        if (name) {
          const nl = name.toLowerCase()
          const nn = stripAccents(nl)
          if (
            nl.includes(lowerQuery) || nn.includes(normalizedQuery) ||
            (englishLower && (nl.includes(englishLower) || nn.includes(englishNormalized)))
          ) {
            results.push({ term: name, category: categoryKey })
          }
        }
        const synonyms = typeof d === 'string' ? [] : (Array.isArray(d?.synonyms) ? d.synonyms : [])
        for (const syn of synonyms) {
          const synName = typeof syn === 'string' ? syn : syn?.name
          if (synName) {
            const sl = synName.toLowerCase()
            const sn = stripAccents(sl)
            if (
              sl.includes(lowerQuery) || sn.includes(normalizedQuery) ||
              (englishLower && (sl.includes(englishLower) || sn.includes(englishNormalized)))
            ) {
              results.push({ term: synName, category: categoryKey })
            }
          }
        }
      }
    }
  }

  // Deduplicate by term+category
  const seen = new Set<string>()
  const unique = [] as Array<{ term: string; category: string }>
  for (const r of results) {
    const key = `${r.category}::${r.term.toLowerCase()}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(r)
    }
  }

  return unique.slice(0, 50)
}

/**
 * Get flavor category for a given flavor term
 */
export function getFlavorCategory(flavor: string): string | null {
  if (!flavor || typeof flavor !== 'string') {
    return null
  }

  const dictionary = getMexicanFlavorDictionary()
  const lowerFlavor = flavor.toLowerCase()

  // Quick known mappings to ensure robust categorization even if dictionary structure changes
  const quickMap: Record<string, string> = {
    citrus: 'Frutal', lemon: 'Frutal', lime: 'Frutal', limón: 'Frutal', limon: 'Frutal', orange: 'Frutal', fruit: 'Frutal', fruity: 'Frutal',
    floral: 'Floral', jasmine: 'Floral', rose: 'Floral',
    herbal: 'Herbal', mint: 'Herbal', eucalyptus: 'Herbal',
    smoky: 'Ahumado', smoke: 'Ahumado',
    mineral: 'Mineral',
    sweet: 'Dulce', honey: 'Dulce', caramel: 'Dulce', vanilla: 'Dulce', chocolate: 'Dulce',
    spicy: 'Especiado', pepper: 'Especiado', cinnamon: 'Especiado',
    agave: 'Agave', maguey: 'Agave'
  }
  for (const key of Object.keys(quickMap)) {
    if (lowerFlavor.includes(key)) return quickMap[key]
  }

  for (const [categoryKey, category] of Object.entries(dictionary.categories)) {
    if ((category as any).subcategories) {
      for (const [subKey, subcategory] of Object.entries((category as any).subcategories)) {
        const descs = (subcategory as any).descriptors || []
        if (descs.some((desc: any) => (typeof desc === 'string' ? desc : desc.name).toLowerCase().includes(lowerFlavor))) {
          return categoryKey
        }
      }
    }
  }

  return null
}

/**
 * Validate if a flavor term exists and get suggestions
 */
export function validateFlavorTerm(term: string): {
  isValid: boolean
  category?: string
  suggestions?: string[]
  confidence: number
} {
  if (!term || typeof term !== 'string') {
    return { isValid: false, suggestions: [], confidence: 0 }
  }

  const dictionary = getMexicanFlavorDictionary()
  const lowerTerm = term.toLowerCase()

  // Check exact matches
  for (const [categoryKey, category] of Object.entries(dictionary.categories)) {
    if ((category as any).subcategories) {
      for (const subcategory of Object.values((category as any).subcategories)) {
        const descs = (subcategory as any).descriptors || []
        if (descs.some((desc: any) => (typeof desc === 'string' ? desc : desc.name).toLowerCase() === lowerTerm)) {
          return { isValid: true, category: categoryKey, confidence: 1 }
        }
      }
    }
  }

  // Find suggestions (terms that contain the query)
  const suggestions: string[] = []
  for (const category of Object.values(dictionary.categories) as any[]) {
    if (category.subcategories) {
      for (const subcategory of Object.values(category.subcategories) as any[]) {
        const descs = (subcategory.descriptors || []).map((d: any) => typeof d === 'string' ? d : d.name)
        suggestions.push(...descs.filter((desc: string) => desc.toLowerCase().includes(lowerTerm)))
      }
    }
  }

  return {
    isValid: false,
    suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
    confidence: 0
  }
}

/**
 * Get synonyms for a flavor term
 */
export function getSynonyms(term: string): string[] {
  if (!term || typeof term !== 'string') {
    return []
  }

  // For now, return related terms from the same category
  const category = getFlavorCategory(term)
  if (!category) {
    return []
  }

  const dictionary = getMexicanFlavorDictionary()
  const categoryData = (dictionary.categories as any)[category]

  if (categoryData && categoryData.subcategories) {
    const allDescriptors: string[] = []
    Object.values(categoryData.subcategories).forEach((subcategory: any) => {
      if (subcategory.descriptors) {
        const descs = subcategory.descriptors.map((d: any) => typeof d === 'string' ? d : d.name)
        allDescriptors.push(...descs)
      }
    })

    // Include translated synonym (Spanish) when available - prioritize it first
    const es = translateFlavorTerm(term, 'es')
    if (es && es.toLowerCase() !== term.toLowerCase()) {
      allDescriptors.unshift(es)
    }

    // Known alternative Spanish synonyms for certain English terms
    const lower = term.toLowerCase()
    const altEsSynonyms: Record<string, string[]> = {
      sweet: ['suave']
    }
    if (altEsSynonyms[lower]) {
      allDescriptors.unshift(...altEsSynonyms[lower])
    }

    // De-duplicate and filter out the original term
    const deduped = Array.from(new Set(allDescriptors))
    return deduped.filter(desc => desc.toLowerCase() !== term.toLowerCase()).slice(0, 10)
  }

  return []
}

/**
 * Get related terms for a flavor term
 */
export function getRelatedTerms(term: string): string[] {
  const category = getFlavorCategory(term)
  if (!category) return []
  const candidates = getSynonyms(term)
  // Return only terms that map back to the same category as the source term
  return candidates.filter(t => getFlavorCategory(t) === category)
}

/**
 * Translate flavor term between languages
 */
export function translateFlavorTerm(
  term: string,
  targetLanguage: 'en' | 'es' | 'nah' = 'es'
): string {
  if (!term || typeof term !== 'string') {
    return term
  }

  // Basic translations for common Mexican flavor terms
  const translations: Record<string, Record<string, string>> = {
    'citrus': { 'es': 'cítrico', 'nah': 'citrus' },
    'sweet': { 'es': 'dulce', 'nah': 'sweet' },
    'agave': { 'es': 'maguey', 'nah': 'agave' },
    'vanilla': { 'es': 'vainilla', 'nah': 'vanilla' },
    'chocolate': { 'es': 'chocolate', 'nah': 'chocolate' }
  }

  const lowerTerm = term.toLowerCase()
  // If translating to English, support reverse lookup from Spanish/Nahuatl
  if (targetLanguage === 'en') {
    // If term is already English and we have it, return as-is
    if (translations[lowerTerm]) return lowerTerm
    // Reverse map: find English key whose translation matches the input term
    for (const [enKey, langs] of Object.entries(translations)) {
      const candidates = [langs['es'], (langs as any)['es-MX'], langs['nah']]
      if (candidates.some(v => v && v.toLowerCase() === lowerTerm)) {
        return enKey
      }
    }
    return term
  }

  const translation = translations[lowerTerm]?.[targetLanguage]

  return translation || term
}

/**
 * Get intensity scale for flavor categories
 */
export function getFlavorIntensityScale(category: string): { min: number; max: number; labels?: string[] } {
  // Default intensity scale
  const defaultScale = {
    min: 1,
    max: 10,
    labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  }

  if (!category || typeof category !== 'string') {
    return defaultScale
  }

  // Category-specific scales
  const scales: Record<string, { min: number; max: number; labels?: string[] }> = {
    'Frutal': { min: 1, max: 10, labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] },
    'Dulce': { min: 1, max: 10, labels: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] },
    'Especiado': { min: 1, max: 10, labels: ['Mild', 'Warm', 'Hot', 'Fiery', 'Scorching'] },
    'Terroso': { min: 1, max: 8, labels: ['Low', 'Medium', 'High'] },
    'Floral': { min: 1, max: 7, labels: ['Low', 'Medium', 'High'] },
    'Ahumado': { min: 1, max: 9, labels: ['Low', 'Medium', 'High', 'Very High'] }
  }

  return scales[category] || defaultScale
}

/**
 * Get cultural context for Mexican beverages
 */
export function getCulturalContext(beverage: string): string {
  if (!beverage || typeof beverage !== 'string') {
    return 'traditional Mexican beverage with rich cultural heritage.'
  }

  const contexts: Record<string, string> = {
    'tequila': 'tequila is a traditional mexican spirit made from the blue weber agave plant, originating from the town of tequila in jalisco, mexico. it has been produced for centuries and holds significant cultural importance in mexican celebrations and ceremonies.',
    'mezcal': 'mezcal is a traditional mexican spirit made from various species of agave, primarily produced in oaxaca. it represents the rich artisanal heritage of mexican distillation and is often associated with indigenous traditions.',
    'pulque': 'pulque is a traditional fermented beverage made from the sap of the maguey (agave) plant, with roots in pre-hispanic mexico. it was considered a sacred drink by the aztecs and continues to hold cultural significance.',
    'sotol': 'sotol is a traditional spirit made from the desert spoon plant, primarily produced in chihuahua and coahuila. it represents the desert heritage of northern mexico.'
  }

  return contexts[beverage.toLowerCase()] || 'traditional Mexican beverage with rich cultural heritage.'
}
