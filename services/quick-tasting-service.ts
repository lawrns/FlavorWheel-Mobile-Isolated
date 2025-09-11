/**
 * Quick Tasting Service
 * Client-side operations for Quick Tasting flow
 */

import { supabase } from '@/lib/supabase'
import type {
  QuickTastingData,
  QuickTastingResponse,
  TastingRecord
} from '@/types/quick-tasting'
import {
  createErrorResponse,
  validateQuickTastingData,
  logQuickTastingError
} from '@/lib/error-handling/quick-tasting-errors'

// Create a new quick tasting
export async function createQuickTasting(tastingData: QuickTastingData): Promise<QuickTastingResponse> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      const errorResponse = createErrorResponse(authError || new Error('No user'), 'createQuickTasting')
      logQuickTastingError(errorResponse, { tastingData })
      return { success: false, error: errorResponse.userMessage }
    }

    // Validate input data
    const validationError = validateQuickTastingData(tastingData)
    if (validationError) {
      logQuickTastingError(validationError, { tastingData })
      return { success: false, error: validationError.userMessage }
    }

    // Create the tasting record
    const tastingPayload = {
      name: `${tastingData.productName} Quick Tasting`,
      description: `Quick tasting of ${tastingData.productName}`,
      type: 'quick',
      status: 'completed', // Quick tastings are completed immediately
      created_by: user.id,
      date: new Date().toISOString(),
      tasting_data: {
        productType: tastingData.productType,
        productName: tastingData.productName,
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: tastingData.overallRating,
        notes: tastingData.notes,
        image: tastingData.image,
        completedAt: new Date().toISOString()
      },
      characteristics: {
        product_type: tastingData.productType,
        flavors: tastingData.selectedFlavors,
        rating: tastingData.overallRating
      }
    }

    const { data: tasting, error: tastingError } = await supabase
      .from('tastings')
      .insert(tastingPayload)
      .select()
      .single()

    if (tastingError) {
      const errorResponse = createErrorResponse(tastingError, 'createQuickTasting')
      logQuickTastingError(errorResponse, { tastingData, tastingPayload })
      return { success: false, error: errorResponse.userMessage }
    }

    // Create a tasting item for the beverage
    const itemPayload = {
      tasting_id: tasting.id,
      name: tastingData.productName,
      type: tastingData.productType,
      details: {
        flavors: tastingData.selectedFlavors,
        rating: tastingData.overallRating,
        notes: tastingData.notes,
        image: tastingData.image
      }
    }

    const { error: itemError } = await supabase
      .from('tasting_items')
      .insert(itemPayload)

    if (itemError) {
      console.warn('Warning: Error creating tasting item:', itemError)
      // Log the error but don't fail the entire operation for item creation error
      const errorResponse = createErrorResponse(itemError, 'createTastingItem')
      logQuickTastingError(errorResponse, { tastingData, tastingId: tasting.id })
    }

    // Create flavor wheel entry if flavors are provided
    if (tastingData.selectedFlavors.length > 0) {
      const flavorWheelPayload = {
        tasting_id: tasting.id,
        item_id: tasting.id, // Using tasting.id as item_id for now
        user_id: user.id,
        wheel_type: 'combined',
        wheel_data: {
          flavors: tastingData.selectedFlavors,
          rating: tastingData.overallRating,
          notes: tastingData.notes
        }
      }

      const { error: wheelError } = await supabase
        .from('flavor_wheels')
        .insert(flavorWheelPayload)

      if (wheelError) {
        console.warn('Warning: Error creating flavor wheel:', wheelError)
        // Log the error but don't fail the entire operation for flavor wheel creation error
        const errorResponse = createErrorResponse(wheelError, 'createFlavorWheel')
        logQuickTastingError(errorResponse, { tastingData, tastingId: tasting.id })
      }
    }

    return {
      success: true,
      tastingId: tasting.id
    }

  } catch (error) {
    const errorResponse = createErrorResponse(error, 'createQuickTasting')
    logQuickTastingError(errorResponse, { tastingData })
    return { success: false, error: errorResponse.userMessage }
  }
}

// Get user's quick tastings
export async function getUserQuickTastings() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data: tastings, error: tastingsError } = await supabase
      .from('tastings')
      .select(`
        *,
        tasting_items (*)
      `)
      .eq('created_by', user.id)
      .eq('type', 'quick')
      .order('created_at', { ascending: false })

    if (tastingsError) {
      throw tastingsError
    }

    return tastings || []

  } catch (error) {
    console.error('Error fetching user quick tastings:', error)
    throw error
  }
}

// Get a specific quick tasting by ID
export async function getQuickTastingById(tastingId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const { data: tasting, error: tastingError } = await supabase
      .from('tastings')
      .select(`
        *,
        tasting_items (*)
      `)
      .eq('id', tastingId)
      .eq('created_by', user.id)
      .eq('type', 'quick')
      .single()

    if (tastingError) {
      throw tastingError
    }

    return tasting

  } catch (error) {
    console.error('Error fetching quick tasting:', error)
    throw error
  }
}
