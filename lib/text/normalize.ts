export interface TokenSpan {
  start: number
  end: number
  text: string
  normalized: string
  confidence: number
  type: 'flavor' | 'intensity' | 'quality' | 'other'
}

export interface NormalizationResult {
  original: string
  normalized: string
  tokens: TokenSpan[]
  confidence: number
}

/**
 * Normalizes flavor descriptions to standard terms
 */
export function normalizeFlavorText(text: string): NormalizationResult {
  const tokens: TokenSpan[] = []

  // Simple normalization for common flavor terms
  const normalizedText = text
    .toLowerCase()
    .replace(/\bbright\b/g, 'bright')
    .replace(/\bdark\b/g, 'dark')
    .replace(/\bsweet\b/g, 'sweet')
    .replace(/\bsour\b/g, 'sour')
    .replace(/\bbitter\b/g, 'bitter')
    .replace(/\bsalty\b/g, 'salty')
    .replace(/\bumami\b/g, 'umami')

  return {
    original: text,
    normalized: normalizedText,
    tokens,
    confidence: 0.8
  }
}

/**
 * Extracts flavor tokens from text
 */
export function extractFlavorTokens(text: string): TokenSpan[] {
  const tokens: TokenSpan[] = []

  // Common flavor words to look for
  const flavorWords = [
    'sweet', 'sour', 'bitter', 'salty', 'umami',
    'bright', 'dark', 'light', 'heavy',
    'fruity', 'floral', 'chocolate', 'caramel',
    'citrus', 'berry', 'stone', 'tropical'
  ]

  flavorWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    let match
    while ((match = regex.exec(text)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        normalized: word.toLowerCase(),
        confidence: 0.9,
        type: 'flavor'
      })
    }
  })

  return tokens
}

/**
 * Tokenizes text into meaningful spans
 */
export function tokenizeText(text: string): TokenSpan[] {
  const tokens: TokenSpan[] = []
  const words = text.split(/\s+/)

  let currentIndex = 0
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '')
    if (cleanWord.length > 0) {
      tokens.push({
        start: currentIndex,
        end: currentIndex + word.length,
        text: word,
        normalized: cleanWord.toLowerCase(),
        confidence: 1.0,
        type: 'other'
      })
    }
    currentIndex += word.length + 1
  })

  return tokens
}
