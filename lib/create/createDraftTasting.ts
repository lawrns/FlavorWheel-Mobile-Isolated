/**
 * Utility for creating draft tastings
 * This provides a consistent interface for creating tastings across different modes
 */

export interface CreateDraftTastingPayload {
  name: string
  mode: 'study' | 'competition' | 'quick'
  productType: string
  categories: Array<{
    name: string
    parameterType: string
    options?: string[]
    minValue?: number
    maxValue?: number
    containsText?: string
    includeInRanking?: boolean
  }>
  items: Array<{
    name: string
    description?: string
    image?: File
    preLoadedData?: Record<string, any>
  }>
  isBlind?: boolean
  description?: string
}

export interface CreateDraftTastingResult {
  id: string
  nextHref: string
}

/**
 * Creates a draft tasting using the provided payload
 * @param mode The tasting mode ('study' | 'competition' | 'quick')
 * @param payload The tasting data payload
 * @returns Promise resolving to the created tasting ID and next navigation href
 */
export async function createDraftTasting(
  mode: 'study' | 'competition' | 'quick',
  payload: CreateDraftTastingPayload
): Promise<CreateDraftTastingResult> {
  try {
    // Simulate API call - in a real implementation, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate a mock ID for the tasting
    const tastingId = `tasting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Determine the next navigation path based on mode
    let nextHref: string
    switch (mode) {
      case 'study':
        nextHref = '/en/study/confirm' // Would typically be `/en/study/${tastingId}/confirm`
        break
      case 'competition':
        nextHref = '/en/competition/confirm' // Would typically be `/en/competition/${tastingId}/confirm`
        break
      case 'quick':
        nextHref = '/en/quick-tasting/confirm' // Would typically be `/en/quick-tasting/${tastingId}/confirm`
        break
      default:
        nextHref = '/en/landing'
    }

    return {
      id: tastingId,
      nextHref
    }
  } catch (error) {
    console.error(`Failed to create ${mode} tasting:`, error)
    throw new Error(`Failed to create ${mode} tasting`)
  }
}

/**
 * Serializes study mode form data into the standard payload format
 */
export function serializeStudyDraft(formData: any): CreateDraftTastingPayload {
  return {
    name: formData.tasting_name,
    mode: 'study',
    productType: formData.product_type,
    categories: formData.categories.map((cat: any) => ({
      name: cat.category_name,
      parameterType: cat.evaluation_type,
      options: cat.mc_options,
      minValue: cat.scale_meta?.min,
      maxValue: cat.scale_meta?.max,
      containsText: cat.contains_value
    })),
    items: formData.items.map((item: any) => ({
      name: item.item_name,
      description: item.item_description,
      image: item.image,
      preLoadedData: {}
    })),
    isBlind: formData.blind_toggle
  }
}

/**
 * Serializes competition mode form data into the standard payload format
 */
export function serializeCompetitionDraft(formData: any): CreateDraftTastingPayload {
  return {
    name: formData.competition_name,
    mode: 'competition',
    productType: formData.product_type,
    description: formData.description,
    categories: formData.categories.map((cat: any) => ({
      name: cat.category_name,
      parameterType: cat.evaluation_type,
      options: cat.mc_options,
      minValue: cat.scale_meta?.min,
      maxValue: cat.scale_meta?.max,
      containsText: cat.contains_value,
      includeInRanking: cat.include_in_ranking
    })),
    items: formData.items.map((item: any) => ({
      name: item.item_name,
      description: item.item_description,
      image: item.image,
      preLoadedData: item.preloaded_answers || {}
    })),
    isBlind: formData.blind_toggle
  }
}
