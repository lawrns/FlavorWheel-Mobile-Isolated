// Import required types
import type { MexicanBeverageType } from './mexican-types'

export interface FlavorDescriptorWithMetadata {
  name: string
  description?: string
  intensity?: number | { min: number; max: number }
  characteristics?: string[]
  // Backward-compat single region property used in some seeds
  region?: string
  regions?: string[]
  beverageTypes?: string[]
  mexicanBeverageTypes?: MexicanBeverageType[]
  translations?: Record<string, string>
}

export interface MexicanFlavorDictionary {
  categories: Record<string, FlavorCategory>
  terms?: Array<string | Record<string, any>>
  translations?: Record<string, any>
}

export interface FlavorDictionary {
  [key: string]: FlavorCategory
}

export interface FlavorCategory {
  name: string
  description?: string
  culturalContext?: string
  mexicanBeverageTypes?: MexicanBeverageType[]
  subcategories: Record<string, FlavorSubcategory>
}

export interface FlavorSubcategory {
  name: string
  descriptors: (string | FlavorDescriptorWithMetadata)[]
}

export interface TastingNote {
  id: string
  userId: string
  tastingId: string
  itemId: string
  categoryId: string
  value: string | number
  created_at: string
  updated_at: string
  notes?: string | Record<string, any>
  extractedDescriptors?: string[]
}

export interface Tasting {
  id: string
  name: string
  description?: string
  created_by: string
  status: 'draft' | 'active' | 'completed'
  items: TastingItem[]
  categories: TastingCategory[]
  participants: TastingParticipant[]
  created_at: string
  updated_at: string
  date?: string
  type?: string
  isBlind?: boolean
  tasting_items?: TastingItem[]
  tasting_type?: string
  tasting_participants?: TastingParticipant[]
}

export interface TastingItem {
  id: string
  name: string
  description?: string
  order: number
  details?: string
  producer?: string
  region?: string
  picture_url?: string
}

export interface TastingCategory {
  id: string
  name: string
  parameterType: 'subjective_input' | 'sliding_scale' | 'multiple_choice' | 'exact_answer' | 'contains_x'
  order: number
  minValue?: number
  maxValue?: number
  options?: string[]
  containsText?: string
}

export interface TastingParticipant {
  id: string
  userId: string
  tastingId: string
  joined_at: string
  name?: string
  notes?: string
}

// MexicanBeverageType is now imported directly above
