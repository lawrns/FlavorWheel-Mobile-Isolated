export interface FlavorDescriptorWithMetadata {
  name: string
  description?: string
  intensity?: number
  characteristics?: string[]
  regions?: string[]
  beverageTypes?: string[]
  mexicanBeverageTypes?: MexicanBeverageType[]
  translations?: Record<string, string>
}

export interface MexicanFlavorDictionary {
  categories: Record<string, FlavorCategory>
}

export interface FlavorCategory {
  name: string
  subcategories: Record<string, FlavorSubcategory>
}

export interface FlavorSubcategory {
  name: string
  descriptors: FlavorDescriptorWithMetadata[]
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
}

export interface TastingItem {
  id: string
  name: string
  description?: string
  order: number
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
}

// Re-export from mexican-types for convenience
export type { MexicanBeverageType } from './mexican-types'
