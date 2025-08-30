/**
 * Create Tasting Service
 * CRUD operations for the Create Tasting flow
 */

import { supabase } from '@/lib/supabase'

// Types for Create Tasting flow
export interface ProductType {
  id: string
  name: string
  display_name: string
  description?: string
  icon_url?: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description?: string
  product_type_id?: string
  difficulty_level: 'beginner' | 'intermediate' | 'professional'
  duration: number
  category?: string
  num_samples: number
  evaluation_criteria: any[]
  scoring_methods: any
  is_public: boolean
  is_featured: boolean
  usage_count: number
  average_rating: number
  rating_count: number
  created_by?: string
  created_at: string
  updated_at: string
  product_type?: ProductType
  template_categories?: TemplateCategory[]
}

export interface TemplateCategory {
  id: string
  template_id: string
  name: string
  parameter_type: 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
  options: any
  rank_option: boolean
  sort_order: number
  created_at: string
}

export interface TastingCategory {
  id: string
  tasting_id: string
  name: string
  parameter_type: 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
  options: any
  rank_option: boolean
  sort_order: number
  created_at: string
}

export interface TastingItem {
  id: string
  tasting_id: string
  name: string
  photo_url?: string
  sort_order: number
  created_at: string
}

export interface ItemAttribute {
  id: string
  tasting_item_id: string
  category_id: string
  correct_value: string
  created_at: string
}

// Client-side category interface (camelCase)
export interface CreateTastingCategory {
  name: string
  parameterType: 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
  options?: any
  rankOption?: boolean
  sortOrder?: number
}

// Client-side item interface (camelCase)
export interface CreateTastingItem {
  name: string
  image?: File | null
  imagePreview?: string
}

export interface CreateTastingData {
  name: string
  description?: string
  mode: 'study' | 'competition' | 'quick'
  is_blind: boolean
  rank_participants?: boolean
  review_type?: 'quick' | 'prose'
  product_type?: string
  product_type_id?: string
  template_id?: string
  categories: CreateTastingCategory[]
  items: (CreateTastingItem & { imageUrl?: string })[]
  item_attributes?: Omit<ItemAttribute, 'id' | 'tasting_item_id' | 'created_at'>[]
  // New fields for keyword extraction and prose notes
  extracted_keywords?: string[]
  prose_notes?: string
}

// Product Types CRUD
export async function getProductTypes(): Promise<ProductType[]> {
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .order('display_name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching product types:', error)
    throw error
  }
}

export async function getProductTypeById(id: string): Promise<ProductType | null> {
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching product type:', error)
    throw error
  }
}

// Templates CRUD
export async function getTemplates(productTypeId?: string): Promise<Template[]> {
  try {
    let query = supabase
      .from('templates')
      .select(`
        *,
        product_type:product_types(*),
        template_categories(*)
      `)
      .eq('is_public', true)
      .order('name')

    if (productTypeId) {
      query = query.eq('product_type_id', productTypeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching templates:', error)
    throw error
  }
}

export async function getTemplateById(id: string): Promise<Template | null> {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        product_type:product_types(*),
        template_categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching template:', error)
    throw error
  }
}

export async function getTemplatesByProductType(productTypeId: string): Promise<Template[]> {
  return getTemplates(productTypeId)
}

// Tasting CRUD
export async function createTasting(tastingData: CreateTastingData): Promise<{ id: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Server-side validation
    if (!tastingData.name || tastingData.name.trim().length < 3) {
      throw new Error('Tasting name must be at least 3 characters long')
    }

    if (!tastingData.items || tastingData.items.length === 0) {
      throw new Error('At least one item is required')
    }

    // Validate each item
    for (let i = 0; i < tastingData.items.length; i++) {
      const item = tastingData.items[i]
      if (!item.name || item.name.trim().length < 2) {
        throw new Error(`Item ${i + 1} name must be at least 2 characters long`)
      }
    }

    // Start a transaction-like operation
    // 1. Create the tasting
    const { data: tasting, error: tastingError } = await supabase
      .from('tastings')
      .insert({
        code: generateTastingCode(),
        name: tastingData.name,
        description: tastingData.description,
        mode: tastingData.mode,
        is_blind: tastingData.is_blind,
        rank_participants: tastingData.rank_participants || false,
        review_type: tastingData.review_type || 'quick',
        product_type: tastingData.product_type,
        product_type_id: tastingData.product_type_id,
        template_id: tastingData.template_id,
        created_by: user.id,
        date: new Date().toISOString(),
        type: 'guided', // Required field from existing schema
        items: [], // Will be populated separately
        participants: [], // Will be populated separately
        characteristics: [],
        // Add extracted keywords and prose notes if provided
        ...(tastingData.extracted_keywords && tastingData.extracted_keywords.length > 0 && {
          extracted_keywords: tastingData.extracted_keywords
        }),
        ...(tastingData.prose_notes && {
          prose_notes: tastingData.prose_notes
        })
      })
      .select()
      .single()

    if (tastingError) throw tastingError

    const tastingId = tasting.id

    // 2. Create tasting categories (optional)
    let createdCategories: any[] = []
    if (tastingData.categories.length > 0) {
      const categories = tastingData.categories.map(cat => ({
        tasting_id: tastingId,
        name: cat.name,
        parameter_type: cat.parameterType || 'subjective_input', // Transform camelCase to snake_case
        options: cat.options || {},
        rank_option: cat.rankOption || false,
        sort_order: cat.sortOrder || 0
      }))

      const { data, error: categoriesError } = await supabase
        .from('tasting_categories')
        .insert(categories)
        .select()

      if (categoriesError) throw categoriesError
      createdCategories = data || []
    }

    // 3. Create tasting items (always when provided)
    let createdItems: any[] = []
    if (tastingData.items.length > 0) {
      // Process items and upload images if present
      const processedItems = []

      for (const item of tastingData.items) {
        let imageUrl = item.imageUrl // Check if imageUrl is already provided

        // If there's a File object, upload it to Supabase storage
        if (item.image && item.image instanceof File) {
          try {
            imageUrl = await uploadItemImage(item.image, user.id)
          } catch (uploadError) {
            console.error('Failed to upload image for item:', item.name, uploadError)
            // Continue without image rather than failing the entire tasting creation
          }
        }

        processedItems.push({
          tasting_id: tastingId,
          name: item.name,
          details: imageUrl ? JSON.stringify({ image_url: imageUrl }) : null,
          picture_url: imageUrl || null, // Store in picture_url field as well
        })
      }

      const { data, error: itemsError } = await supabase
        .from('tasting_items')
        .insert(processedItems)
        .select()

      if (itemsError) throw itemsError
      createdItems = data || []
    }

    // 4. Create item attributes for competition mode (only if categories exist)
    if (
      tastingData.mode === 'competition' &&
      tastingData.item_attributes &&
      createdCategories.length > 0 &&
      createdItems.length > 0
    ) {
      const attributes: any[] = []
      for (const attr of tastingData.item_attributes) {
        const item = createdItems.find(i => i.name === (attr as any).item_name)
        const category = createdCategories.find(c => c.name === (attr as any).category_name)
        if (item && category) {
          attributes.push({
            tasting_item_id: item.id,
            category_id: category.id,
            correct_value: attr.correct_value
          })
        }
      }

      if (attributes.length > 0) {
        const { error: attributesError } = await supabase
          .from('item_attributes')
          .insert(attributes)
        if (attributesError) throw attributesError
      }
    }

    return { id: tastingId }
  } catch (error) {
    console.error('Error creating tasting:', error)
    throw error
  }
}

// Helper functions
// Helper function to upload image to Supabase storage
async function uploadItemImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('tasting-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Image upload error:', {
      error,
      fileName,
      fileSize: file.size,
      fileType: file.type,
      timestamp: new Date().toISOString()
    })
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('tasting-photos')
    .getPublicUrl(fileName)

  return publicUrl
}

async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

function generateTastingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Tasting Categories CRUD
export async function createTastingCategories(
  tastingId: string,
  categories: Omit<TastingCategory, 'id' | 'tasting_id' | 'created_at'>[]
): Promise<TastingCategory[]> {
  try {
    const categoriesToInsert = categories.map(cat => ({
      ...cat,
      tasting_id: tastingId
    }))

    const { data, error } = await supabase
      .from('tasting_categories')
      .insert(categoriesToInsert)
      .select()

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error creating tasting categories:', error)
    throw error
  }
}

export async function getTastingCategories(tastingId: string): Promise<TastingCategory[]> {
  try {
    const { data, error } = await supabase
      .from('tasting_categories')
      .select('*')
      .eq('tasting_id', tastingId)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching tasting categories:', error)
    throw error
  }
}

// Tasting Items CRUD
export async function createTastingItems(
  tastingId: string,
  items: Omit<TastingItem, 'id' | 'tasting_id' | 'created_at'>[]
): Promise<TastingItem[]> {
  try {
    const itemsToInsert = items.map(item => ({
      ...item,
      tasting_id: tastingId
    }))

    const { data, error } = await supabase
      .from('tasting_items')
      .insert(itemsToInsert)
      .select()

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error creating tasting items:', error)
    throw error
  }
}

export async function getTastingItems(tastingId: string): Promise<TastingItem[]> {
  try {
    const { data, error } = await supabase
      .from('tasting_items')
      .select('*')
      .eq('tasting_id', tastingId)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching tasting items:', error)
    throw error
  }
}

// Item Attributes CRUD (for competition mode)
export async function createItemAttributes(
  attributes: Omit<ItemAttribute, 'id' | 'created_at'>[]
): Promise<ItemAttribute[]> {
  try {
    const { data, error } = await supabase
      .from('item_attributes')
      .insert(attributes)
      .select()

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error creating item attributes:', error)
    throw error
  }
}

export async function getItemAttributes(tastingItemId: string): Promise<ItemAttribute[]> {
  try {
    const { data, error } = await supabase
      .from('item_attributes')
      .select('*')
      .eq('tasting_item_id', tastingItemId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching item attributes:', error)
    throw error
  }
}

// User Reviews CRUD
export async function createUserReview(review: {
  tasting_id: string
  item_id: string
  category_id: string
  response_value: string
  response_data?: any
}): Promise<void> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('user_reviews')
      .upsert({
        ...review,
        user_id: user.id
      })

    if (error) throw error
  } catch (error) {
    console.error('Error creating user review:', error)
    throw error
  }
}

export async function getUserReviews(tastingId: string, userId?: string): Promise<any[]> {
  try {
    const user = userId ? { id: userId } : await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_reviews')
      .select('*')
      .eq('tasting_id', tastingId)
      .eq('user_id', user.id)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    throw error
  }
}
