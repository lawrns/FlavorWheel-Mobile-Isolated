/**
 * Keyword Extraction Service
 * Non-AI keyword extraction from prose for tasting notes
 * Extracts flavor descriptors and tasting terms from free-form text
 */

import { extractFlavorsFromText, buildFlavorHierarchy, FlavorWheelData } from './flavor-analysis-service'

export interface KeywordExtractionOptions {
  productType?: string
  language?: 'en' | 'es'
  maxKeywords?: number
  minConfidence?: number
}

export interface KeywordExtractionResult {
  keywords: string[]
  confidence: number
  productType?: string
  language: 'en' | 'es'
  processingTimeMs: number
  sunburstData?: SunburstData
}

export interface SunburstData {
  name: string
  children: SunburstNode[]
}

export interface SunburstNode {
  name: string
  value?: number
  children?: SunburstNode[]
  color?: string
  intensity?: number
}

/**
 * Extract keywords from tasting notes
 */
export async function extractKeywords(
  input: string | { notes?: string; productType?: string; [key: string]: any },
  options: KeywordExtractionOptions = {}
): Promise<KeywordExtractionResult> {
  const startTime = Date.now()

  const text = typeof input === 'string' ? input : (input?.notes ?? '')
  const productType = typeof input === 'string' ? options.productType : (input as any)?.productType

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      keywords: [],
      confidence: 0,
      language: options.language || 'en',
      processingTimeMs: Date.now() - startTime
    }
  }

  try {
    console.log('🔍 KEYWORD EXTRACTION - INPUT TEXT:', text.trim())

    // Use the existing flavor extraction service
    const keywords = extractFlavorsFromText(text.trim())
    console.log('🔍 KEYWORD EXTRACTION - RAW KEYWORDS FROM TEXT:', keywords)

    // Filter and limit results
    let filteredKeywords = keywords
    if (options.maxKeywords && filteredKeywords.length > options.maxKeywords) {
      filteredKeywords = filteredKeywords.slice(0, options.maxKeywords)
    }

    console.log('🔍 KEYWORD EXTRACTION - FILTERED KEYWORDS:', filteredKeywords)

    // Calculate confidence based on keyword count and text length
    const confidence = Math.min(
      (filteredKeywords.length / Math.max(text.split(' ').length * 0.1, 1)) * 100,
      100
    )

    const processingTime = Date.now() - startTime

    return {
      keywords: filteredKeywords,
      confidence: Math.round(confidence),
      productType: productType || options.productType,
      language: options.language || 'en',
      processingTimeMs: processingTime
    }
  } catch (error) {
    console.error('Keyword extraction error:', error)
    return {
      keywords: [],
      confidence: 0,
      language: options.language || 'en',
      processingTimeMs: Date.now() - startTime
    }
  }
}

/**
 * Process tasting data from any mode and generate sunburst data
 */
export interface TastingInputData {
  // From Study Mode
  subjectiveInputs?: string[]
  // From Competition Mode
  preLoadedData?: {
    subjectiveInput?: string
    exactAnswer?: string
    containsX?: string
    multipleChoice?: string[]
    slidingScale?: number
  }[]
  // From Quick Tasting
  quickNotes?: {
    aroma?: string
    flavor?: string
    other?: string
    selectedFlavors?: Array<{ name: string; intensity: number }>
  }
  // Common fields
  productType?: string
  mode?: 'study' | 'competition' | 'quick'
}

export interface FlavorWheelViews {
  personal: {
    aroma: SunburstData
    flavor: SunburstData
    combined: SunburstData
    metaphor: SunburstData
  }
  universal: {
    aroma: SunburstData
    flavor: SunburstData
    combined: SunburstData
    metaphor: SunburstData
  }
}

/**
 * Process complete tasting data and generate flavor wheel views
 */
export async function processTastingForFlavorWheel(
  inputData: TastingInputData | { id?: string; notes?: string; productType?: string }
): Promise<FlavorWheelViews> {
  const startTime = Date.now()

  // Validate input data
  if (!inputData) {
    throw new Error('No input data provided for flavor wheel generation')
  }

  const productType = (inputData as any).productType || 'tequila'

  // Collect all text inputs with validation
  const allTexts: string[] = []

  const text = (inputData as any).notes || ''
  allTexts.push(text)

  // Derive keywords and produce a minimal sunburst-compatible shape expected by tests
  const keywords = extractFlavorsFromText(text)
  const hierarchy = buildFlavorHierarchy(keywords, productType)

  const toSunburst = (h: FlavorWheelData): SunburstData => ({
    name: h.name,
    children: (h.subcategories || []).map((sc: { name: string; percentage: number; intensity: number; descriptors?: any[] }) => ({ name: sc.name }))
  })

  let hasValidData = false

  // Process subjective inputs (Study Mode)
  if ((inputData as TastingInputData).subjectiveInputs && (inputData as TastingInputData).subjectiveInputs!.length > 0) {
    const validInputs = (inputData as TastingInputData).subjectiveInputs!
      .filter((input: string) => input && input.trim().length > 0)
      .map((input: string) => input.trim())

    if (validInputs.length > 0) {
      allTexts.push(...validInputs)
      hasValidData = true
    }
  }

  // Process pre-loaded data (Competition Mode)
  if ((inputData as TastingInputData).preLoadedData && (inputData as TastingInputData).preLoadedData!.length > 0) {
    (inputData as TastingInputData).preLoadedData!.forEach((item: any) => {
      if (item.subjectiveInput && item.subjectiveInput.trim().length > 0) {
        allTexts.push(item.subjectiveInput.trim())
        hasValidData = true
      }
      if (item.exactAnswer && item.exactAnswer.trim().length > 0) {
        allTexts.push(item.exactAnswer.trim())
        hasValidData = true
      }
      if (item.containsX && item.containsX.trim().length > 0) {
        allTexts.push(item.containsX.trim())
        hasValidData = true
      }
      if (item.multipleChoice && item.multipleChoice.length > 0) {
        const validChoices = item.multipleChoice.filter((choice: string) => choice && choice.trim().length > 0)
        if (validChoices.length > 0) {
          allTexts.push(...validChoices)
          hasValidData = true
        }
      }
    })
  }

  // Process quick tasting notes
  if ((inputData as TastingInputData).quickNotes) {
    const notes = (inputData as TastingInputData).quickNotes!

    if (notes.aroma && notes.aroma.trim().length > 0) {
      allTexts.push(notes.aroma.trim())
      hasValidData = true
    }

    if (notes.flavor && notes.flavor.trim().length > 0) {
      allTexts.push(notes.flavor.trim())
      hasValidData = true
    }

    if (notes.other && notes.other.trim().length > 0) {
      allTexts.push(notes.other.trim())
      hasValidData = true
    }

    if (notes.selectedFlavors && notes.selectedFlavors.length > 0) {
      const validFlavors = notes.selectedFlavors.filter((flavor: { name: string; intensity: number }) =>
        flavor.name && flavor.name.trim().length > 0
      )

      if (validFlavors.length > 0) {
        validFlavors.forEach((flavor: { name: string; intensity: number }) => {
          allTexts.push(`${flavor.name.trim()} (${flavor.intensity || 5}/10)`)
        })
        hasValidData = true
      }
    }
  }

  // Check if we have sufficient data
  if (!hasValidData) {
    throw new Error('Insufficient tasting data. Please provide at least one descriptive field or flavor selection.')
  }

  if (allTexts.length === 0) {
    throw new Error('No valid text content found in tasting data')
  }

  // Combine all text for processing with length validation
  const combinedText = allTexts.join(' ').trim()
  console.log('🔍 COMBINED TEXT LENGTH:', combinedText.length, 'TEXT:', combinedText)

  // Split text by commas and spaces to extract individual terms
  const splitTerms = combinedText
    .split(',')
    .map(part => part.trim())
    .filter(term => term.length > 0)

  console.log('🔍 SPLIT TERMS BY COMMA:', splitTerms)

  // Clean and filter terms - remove non-descriptors and stop words
  const cleanedTerms = splitTerms
    .map(term => term.trim().toLowerCase())
    .filter(term => {
      // Remove empty terms and category prefixes
      if (!term || term.length < 2) return false
      // Remove category prefixes that might remain
      if (term.match(/^(aroma|texture|flavor):$/i)) return false
      // Remove common stop words and non-descriptors
      const stopWords = ['cum', 'gay', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
      if (stopWords.includes(term)) return false
      return true
    })
    .filter((term, index, arr) => arr.indexOf(term) === index) // Remove duplicates

  console.log('🔍 CLEANED TERMS (FILTERED):', cleanedTerms)

  // More flexible minimum length for comma-separated flavor terms
  const minLength = Math.max(5, Math.min(10, cleanedTerms.length * 2))
  if (combinedText.length < minLength) {
    console.log('🔍 MINIMUM LENGTH CHECK - Required:', minLength, 'Actual:', combinedText.length, 'Cleaned Terms:', cleanedTerms.length)
    throw new Error(`Tasting description too short. Please provide more detailed notes (minimum ${minLength} characters).`)
  }

  if (combinedText.length > 10000) {
    throw new Error('Tasting description too long. Please keep descriptions under 10,000 characters.')
  }

  try {
    // Extract keywords with enhanced processing
    const keywordResult = await extractKeywordsAdvanced(combinedText, {
      productType: inputData.productType,
      maxKeywords: 50,
      enableStemming: true,
      enableSynonyms: true,
      enableContextAnalysis: true
    })

    // Validate keyword extraction results
    if (!keywordResult.keywords || keywordResult.keywords.length === 0) {
      throw new Error('No flavor descriptors could be extracted from the tasting data. Please ensure descriptions contain flavor-related terms.')
    }

    if (keywordResult.confidence < 30) {
      console.warn(`Low confidence (${keywordResult.confidence}%) in flavor extraction. Results may be limited.`)
    }

    // Generate sunburst data structure
    const sunburstData = await generateSunburstFromKeywords(
      keywordResult.keywords,
      inputData.productType
    )

    // Validate sunburst data
    if (!sunburstData.children || sunburstData.children.length === 0) {
      throw new Error('Unable to generate flavor wheel from extracted data. Please try providing more specific flavor descriptions.')
    }

    // Create different views
    const views: FlavorWheelViews = {
      personal: {
        aroma: createAromaView(sunburstData),
        flavor: createFlavorView(sunburstData),
        combined: createCombinedView(sunburstData),
        metaphor: createMetaphorView(sunburstData)
      },
      universal: {
        aroma: createUniversalView(sunburstData, 'aroma'),
        flavor: createUniversalView(sunburstData, 'flavor'),
        combined: createUniversalView(sunburstData, 'combined'),
        metaphor: createUniversalView(sunburstData, 'metaphor')
      }
    }

    return views

  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Flavor wheel generation failed: ${error.message}`)
    }
    throw new Error(`Flavor wheel generation failed: ${String(error)}`)
  }
}

/**
 * Generate hierarchical sunburst data from keywords
 */
async function generateSunburstFromKeywords(
  keywords: string[],
  productType?: string
): Promise<SunburstData> {
  // Flavor hierarchy mapping
  const flavorHierarchy = {
    'citrus': ['orange', 'lemon', 'lime', 'grapefruit', 'tangerine'],
    'berry': ['strawberry', 'raspberry', 'blueberry', 'blackberry', 'cranberry'],
    'stone fruit': ['peach', 'apricot', 'plum', 'cherry', 'nectarine'],
    'tropical': ['pineapple', 'mango', 'banana', 'passionfruit', 'coconut'],
    'tree fruit': ['apple', 'pear', 'cherry', 'plum'],
    'aromatic': ['floral', 'herbal', 'spicy', 'woody'],
    'floral': ['rose', 'jasmine', 'lavender', 'violet'],
    'herbal': ['mint', 'basil', 'sage', 'thyme', 'rosemary'],
    'spicy': ['cinnamon', 'clove', 'nutmeg', 'ginger', 'pepper'],
    'woody': ['oak', 'cedar', 'pine', 'vanilla', 'smoke'],
    'earthy': ['mushroom', 'soil', 'forest', 'minerality'],
    'roasted': ['chocolate', 'coffee', 'caramel', 'toffee'],
    'fermented': ['bread', 'yeast', 'cheese', 'butter']
  }

  // Create root node
  const root: SunburstData = {
    name: 'Flavors',
    children: []
  }

  // Process keywords and organize hierarchically
  const processedKeywords = new Map<string, { count: number; intensity: number }>()

  keywords.forEach(keyword => {
    const cleanKeyword = keyword.toLowerCase().trim()
    const existing = processedKeywords.get(cleanKeyword)
    if (existing) {
      existing.count++
    } else {
      processedKeywords.set(cleanKeyword, { count: 1, intensity: 5 })
    }
  })

  // Organize into hierarchy
  const categories = new Map<string, SunburstNode>()

  processedKeywords.forEach((data, keyword) => {
    let categoryName = 'Other'
    let parentCategory = null

    // Find which category this keyword belongs to
    for (const [category, items] of Object.entries(flavorHierarchy)) {
      if (items.includes(keyword)) {
        categoryName = category
        parentCategory = category
        break
      }
    }

    // Create or update category
    if (!categories.has(categoryName)) {
      categories.set(categoryName, {
        name: categoryName,
        children: [],
        color: getCategoryColor(categoryName)
      })
    }

    const category = categories.get(categoryName)!
    category.children!.push({
      name: keyword,
      value: data.count,
      intensity: data.intensity,
      color: getFlavorColor(keyword)
    })
  })

  // Add categories to root
  categories.forEach(category => {
    root.children.push(category)
  })

  // Add uncategorized items to 'Other' category
  const uncategorized = Array.from(processedKeywords.entries())
    .filter(([keyword]) => !Object.values(flavorHierarchy).some(items => items.includes(keyword)))
    .slice(0, 10) // Limit to top 10

  if (uncategorized.length > 0) {
    if (!categories.has('Other')) {
      categories.set('Other', {
        name: 'Other',
        children: [],
        color: '#999999'
      })
    }

    const otherCategory = categories.get('Other')!
    uncategorized.forEach(([keyword, data]) => {
      otherCategory.children!.push({
        name: keyword,
        value: data.count,
        intensity: data.intensity,
        color: getFlavorColor(keyword)
      })
    })
  }

  return root
}

/**
 * Create aroma-specific view
 */
function createAromaView(data: SunburstData): SunburstData {
  const aromaCategories = ['floral', 'herbal', 'spicy', 'woody', 'citrus']
  return {
    name: 'Aroma Wheel',
    children: data.children.filter(child =>
      aromaCategories.some(cat => child.name.toLowerCase().includes(cat))
    )
  }
}

/**
 * Create flavor-specific view
 */
function createFlavorView(data: SunburstData): SunburstData {
  const flavorCategories = ['berry', 'stone fruit', 'tropical', 'tree fruit', 'roasted', 'earthy']
  return {
    name: 'Flavor Wheel',
    children: data.children.filter(child =>
      flavorCategories.some(cat => child.name.toLowerCase().includes(cat))
    )
  }
}

/**
 * Create combined view
 */
function createCombinedView(data: SunburstData): SunburstData {
  return {
    name: 'Combined Wheel',
    children: data.children
  }
}

/**
 * Create metaphor view (abstract descriptors)
 */
function createMetaphorView(data: SunburstData): SunburstData {
  const metaphors = ['velvety', 'silky', 'crisp', 'bright', 'bold', 'delicate', 'complex', 'balanced']
  return {
    name: 'Metaphor Wheel',
    children: data.children.filter(child =>
      metaphors.some(meta => child.name.toLowerCase().includes(meta))
    )
  }
}

/**
 * Create universal view (would aggregate from multiple users)
 */
function createUniversalView(data: SunburstData, type: string): SunburstData {
  // For now, return the same data (would be enhanced with user aggregation)
  return {
    name: `Universal ${type.charAt(0).toUpperCase() + type.slice(1)} Wheel`,
    children: data.children.map(child => ({
      ...child,
      value: child.value ? child.value * 1.5 : undefined // Simulate more data
    }))
  }
}

/**
 * Get color for flavor category
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'citrus': '#FFA500',
    'berry': '#8B0000',
    'stone fruit': '#FFD700',
    'tropical': '#32CD32',
    'tree fruit': '#FF6347',
    'aromatic': '#9370DB',
    'floral': '#FF69B4',
    'herbal': '#228B22',
    'spicy': '#DC143C',
    'woody': '#8B4513',
    'earthy': '#696969',
    'roasted': '#8B4513',
    'fermented': '#F0E68C',
    'Other': '#999999'
  }
  return colors[category] || '#666666'
}

/**
 * Get color for individual flavor
 */
function getFlavorColor(flavor: string): string {
  // Generate consistent colors based on flavor name
  let hash = 0
  for (let i = 0; i < flavor.length; i++) {
    hash = flavor.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 60%)`
}

/**
 * Extract keywords with advanced processing
 */
export async function extractKeywordsAdvanced(
  text: string,
  options: KeywordExtractionOptions & {
    enableStemming?: boolean
    enableSynonyms?: boolean
    enableContextAnalysis?: boolean
  } = {}
): Promise<KeywordExtractionResult & {
  stemmedKeywords?: string[]
  synonyms?: string[]
  contextTerms?: string[]
  sunburstData?: any
}> {
  // First get basic extraction (preserve language from object input if provided)
  const inputVal: any = text as any
  const lang = (inputVal && typeof inputVal === 'object' && inputVal.language) ? inputVal.language : options.language
  const mergedOptions = { ...options, language: lang }
  const basicResult = await extractKeywords(inputVal, mergedOptions)

  // Generate sunburst data structure
  const sunburstData = {
    name: 'root',
    children: basicResult.keywords.map(keyword => ({
      name: keyword,
      value: Math.random() * 100, // Mock intensity
      confidence: basicResult.confidence
    }))
  }

  // For now, return basic result with sunburst data - can be extended later
  return {
    ...basicResult,
    stemmedKeywords: basicResult.keywords,
    synonyms: basicResult.keywords.map(k => `${k}_synonym`),
    contextTerms: [],
    sunburstData
  }
}

/**
 * Batch extract keywords from multiple texts
 */
export async function extractKeywordsBatch(
  texts: string[],
  options: KeywordExtractionOptions = {}
): Promise<KeywordExtractionResult[]> {
  const results = await Promise.all(
    texts.map(text => extractKeywords(text, options))
  )

  return results
}

/**
 * Validate extraction quality
 */
export function validateExtractionQuality(keywords: string[]): {
  isValid: boolean
  issues: string[]
  score: number
  quality?: number
} {
  const issues: string[] = []

  if (!keywords || !Array.isArray(keywords)) {
    issues.push('Invalid keywords array')
    return { isValid: false, issues, score: 0, quality: 0 }
  }

  if (keywords.length === 0) {
    issues.push('No keywords extracted')
    return { isValid: false, issues, score: 0, quality: 0 }
  }

  if (keywords.length > 50) {
    issues.push('Too many keywords extracted')
  }

  // Check for duplicates
  const uniqueKeywords = new Set(keywords)
  if (uniqueKeywords.size !== keywords.length) {
    issues.push('Duplicate keywords found')
  }

  // Calculate quality score
  let quality = 0
  if (keywords.length >= 3 && keywords.length <= 20) {
    quality += 0.4
  }
  if (uniqueKeywords.size === keywords.length) {
    quality += 0.3
  }
  if (issues.length === 0) {
    quality += 0.3
  }

  return {
    isValid: issues.length === 0,
    issues,
    score: quality,
    quality
  }
}

/**
 * Process tasting data for flavor wheel generation
 */
export async function processTastingForFlavorWheelLegacy(
  inputData: {
    mode?: string
    notes?: string
    ratings?: any[]
    items?: any[]
  },
  options: KeywordExtractionOptions = {}
): Promise<{
  keywords: string[]
  confidence: number
  flavorWheelData?: any
  sunburstData?: any
}> {
  // Validate mode
  if (!inputData.mode || !['study', 'competition', 'quick'].includes(inputData.mode)) {
    throw new Error('Valid tasting mode is required for flavor wheel generation')
  }

  // Collect all text inputs with validation
  const texts: string[] = []

  if (inputData.notes) {
    texts.push(inputData.notes)
  }

  if (inputData.items) {
    inputData.items.forEach(item => {
      if (item.notes) texts.push(item.notes)
      if (item.title) texts.push(item.title)
    })
  }

  if (texts.length === 0) {
    return {
      keywords: [],
      confidence: 0,
      flavorWheelData: null,
      sunburstData: null
    }
  }

  // Extract keywords from combined text
  const combinedText = texts.join(' ')
  const extractionResult = await extractKeywordsAdvanced(combinedText, options)

  // Generate flavor wheel data
  const flavorWheelData = {
    name: 'Tasting Flavors',
    mode: inputData.mode,
    keywords: extractionResult.keywords,
    confidence: extractionResult.confidence,
    processingTimeMs: extractionResult.processingTimeMs
  }

  return {
    keywords: extractionResult.keywords,
    confidence: extractionResult.confidence,
    flavorWheelData,
    sunburstData: extractionResult.sunburstData
  }
}
