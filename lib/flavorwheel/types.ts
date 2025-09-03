// FlavorWheel type definitions
export interface FlavorNode {
  id?: string
  name: string
  weight?: number
  value?: number
  intensity?: number
  confidence?: number
  color?: string
  category?: string
  children?: FlavorNode[]
  meta?: {
    path: string[]
    hiddenChildren?: FlavorNode[]
  }
  matchType?: 'exact' | 'fuzzy' | 'jaro-winkler' | 'levenshtein' | 'semantic'
  similarity?: number
  modifiers?: Array<{
    modifier: string
    intensity_value: number
    modifier_type: 'intensifier' | 'hedge' | 'negation'
  }>
}

// Sunburst chart specific types
export interface SunburstNode {
  id?: string
  name: string
  weight?: number
  value?: number
  intensity?: number
  confidence?: number
  color?: string
  category?: string
  children?: SunburstNode[]
  x0?: number
  x1?: number
  y0?: number
  y1?: number
}

export interface SunburstData {
  name: string
  value?: number
  color?: string
  children?: SunburstNode[]
}

// Flavor extraction types
export interface ExtractedTerm {
  variant: string
  canonical: string
  keyword_id: string
  category: string
  subcategory?: string
  weight: number
  span: { start: number; end: number }
  matchType: 'exact' | 'fuzzy'
  similarity?: number
}

export interface FlavorExtractionResult {
  success: boolean
  wheelData: FlavorNode
  extractedTerms: ExtractedTerm[]
  statistics: {
    totalTerms: number
    uniqueCategories: number
    averageConfidence: number
  }
  processingTimeMs: number
}
