/**
 * Unified TypeScript interfaces for Quick Tasting functionality
 * These types ensure consistency across the application
 */

// Product Types
export type ProductType = 'wine' | 'beer' | 'spirits' | 'coffee' | 'tea' | 'other'

export interface ProductTypeOption {
  value: ProductType
  label: string
  emoji: string
}

// Flavor Categories
export interface FlavorCategory {
  id: string
  name: string
  category: 'recommended' | 'general'
  color: string
  intensity?: number
  selected?: boolean
}

// Quick Tasting Data Structure
export interface QuickTastingData {
  productType: ProductType
  productName: string
  selectedFlavors: string[]
  overallRating: number
  notes: string
  image?: string
  // New note-based quick tasting fields
  aroma?: string
  flavor?: string
  other?: string
  // New UI score on a 0–100 scale (mapped to overallRating 1–10 on submit)
  overallScore?: number
}

// Database Tasting Record
export interface TastingRecord {
  id: string
  name: string
  description?: string
  type: 'quick' | 'study' | 'competition' | 'educational' | 'guided'
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  created_by: string
  date: string
  characteristics: Record<string, any>
  tasting_data: QuickTastingData & {
    completedAt: string
  }
  created_at: string
  updated_at: string
}

// Tasting Item (for beverages within a tasting)
export interface TastingItem {
  id: string
  tasting_id: string
  name: string
  type: ProductType
  details: {
    flavors: string[]
    rating: number
    notes: string
    image?: string
  }
  order_index?: number
  photo_url?: string
  created_at: string
  updated_at: string
}

// Flavor Wheel Data
export interface FlavorWheelData {
  id: string
  tasting_id: string
  item_id: string
  user_id: string
  wheel_type: 'aroma' | 'flavor' | 'combined' | 'metaphor'
  wheel_data: {
    flavors: string[]
    rating: number
    notes?: string
  }
  prose_excerpt?: string
  picture_url?: string
  created_at: string
  updated_at: string
}

// API Response Types
export interface QuickTastingResponse {
  success: boolean
  tastingId?: string
  error?: string
  message?: string
}

export interface QuickTastingsListResponse {
  success: boolean
  tastings: TastingRecord[]
  error?: string
}

// Form Validation Types
export interface QuickTastingValidation {
  productType: boolean
  productName: boolean
  selectedFlavors: boolean
  overallRating: boolean
}

export interface ValidationError {
  field: keyof QuickTastingData
  message: string
}

// Smart Defaults Types
export interface SmartDefaultsData {
  recommendedProductType?: ProductType
  recommendedRating?: number
  flavorSuggestions?: string[]
  noteSuggestions?: string[]
}

// Step Configuration
export interface TastingStep {
  id: string
  title: string
  icon: string
  required?: boolean
}

export const TASTING_STEPS: TastingStep[] = [
  { id: 'product', title: 'What are you tasting?', icon: '🥤', required: true },
  { id: 'notes', title: 'Aroma, Flavor & Other notes', icon: '👃', required: true },
  { id: 'overall', title: 'Overall (0–100) & summary', icon: '⭐', required: true },
]

// Product Type Options
export const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  { value: 'wine', label: 'Wine', emoji: '🍷' },
  { value: 'beer', label: 'Beer', emoji: '🍺' },
  { value: 'spirits', label: 'Spirits', emoji: '🥃' },
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'tea', label: 'Tea', emoji: '🍵' },
  { value: 'other', label: 'Other', emoji: '🥤' },
]

// Flavor Categories by Product Type
export const FLAVOR_CATEGORIES: Record<ProductType, string[]> = {
  wine: ['Berry', 'Citrus', 'Oak', 'Vanilla', 'Spice', 'Mineral', 'Floral', 'Herbal'],
  beer: ['Hoppy', 'Malty', 'Citrus', 'Roasted', 'Fruity', 'Spice'],
  spirits: ['Oak', 'Smoke', 'Vanilla', 'Herbal', 'Citrus', 'Caramel'],
  coffee: ['Chocolate', 'Nutty', 'Citrus', 'Floral', 'Caramel', 'Spice'],
  tea: ['Herbal', 'Floral', 'Citrus', 'Sweet', 'Bitter', 'Nutty'],
  other: ['Sweet', 'Sour', 'Bitter', 'Salty', 'Umami', 'Spicy'],
}

// Utility Functions
export function getProductTypeLabel(productType: ProductType): string {
  const option = PRODUCT_TYPE_OPTIONS.find(opt => opt.value === productType)
  return option?.label || productType
}

export function getProductTypeEmoji(productType: ProductType): string {
  const option = PRODUCT_TYPE_OPTIONS.find(opt => opt.value === productType)
  return option?.emoji || '🥤'
}

export function getFlavorCategoriesForProductType(productType: ProductType): string[] {
  return FLAVOR_CATEGORIES[productType] || FLAVOR_CATEGORIES.other
}

export function validateQuickTastingData(data: QuickTastingData): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.productType) {
    errors.push({ field: 'productType', message: 'Product type is required' })
  }

  if (!data.productName || data.productName.trim().length === 0) {
    errors.push({ field: 'productName', message: 'Product name is required' })
  }

  const hasSelectedFlavors = Array.isArray(data.selectedFlavors) && data.selectedFlavors.length > 0
  const hasNoteBased = Boolean(data.aroma?.trim?.() || data.flavor?.trim?.())
  if (!hasSelectedFlavors && !hasNoteBased) {
    errors.push({ field: 'selectedFlavors', message: 'Provide at least one flavor (selected or entered in notes)' })
  }

  if (typeof data.overallScore === 'number') {
    if (data.overallScore < 0 || data.overallScore > 100) {
      errors.push({ field: 'overallRating', message: 'Score must be between 0 and 100' })
    }
  } else {
    if (data.overallRating < 1 || data.overallRating > 10) {
      errors.push({ field: 'overallRating', message: 'Rating must be between 1 and 10' })
    }
  }

  return errors
}
