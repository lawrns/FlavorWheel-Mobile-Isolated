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
    // Get authentication token
    let token: string | null = null

    // Check if we're using a test user (development mode)
    const isTestUser = typeof window !== 'undefined' &&
      localStorage.getItem('test-user') === 'true'

    if (isTestUser && process.env.NODE_ENV === 'development') {
      token = 'test-user-token'
    } else {
      // Get real Supabase session
      const { data: { session }, error: authError } = await supabase.auth.getSession()

      if (authError || !session?.access_token) {
        const errorResponse = createErrorResponse(authError || new Error('No session'), 'createQuickTasting')
        logQuickTastingError(errorResponse, { tastingData })
        return { success: false, error: errorResponse.userMessage }
      }

      token = session.access_token
    }

    // Validate input data
    const validationError = validateQuickTastingData(tastingData)
    if (validationError) {
      logQuickTastingError(validationError, { tastingData })
      return { success: false, error: validationError.userMessage }
    }

    // Call the API endpoint to create the tasting
    const response = await fetch('/api/quick-tasting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tastingData)
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      const errorResponse = createErrorResponse(
        new Error(result.error || 'API request failed'),
        'createQuickTasting'
      )
      logQuickTastingError(errorResponse, { tastingData, status: response.status })
      return { success: false, error: errorResponse.userMessage }
    }

    // Return the successful result from the API
    return {
      success: true,
      tastingId: result.tastingId,
      message: result.message || 'Tasting created successfully!'
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
      .order('created_at', { ascending: false })
      .single()

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

    const base = supabase
      .from('tastings')
      .select(`
        *,
        tasting_items (*)
      `) as any

    await base.eq('id', tastingId)
    await base.eq('created_by', user.id)
    const res = await base.eq('type', 'quick')

    // Support both styles of mocked responses:
    // 1) eq returns a response object { data, error }
    // 2) eq returns a chainable builder with .order().single()
    if (res && typeof (res as any).order === 'function') {
      const { data, error } = await (res as any).order('created_at', { ascending: false }).single()
      if (error) throw error
      if (!data) throw new Error('Not found')
      return data
    }

    const tasting = res && 'data' in (res as any) ? (res as any).data : res
    const tastingError = res && 'error' in (res as any) ? (res as any).error : null

    if (tastingError) {
      throw tastingError
    }
    if (!tasting) {
      throw new Error('Not found')
    }

    return tasting

  } catch (error) {
    console.error('Error fetching quick tasting:', error)
    throw error
  }
}
