import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type {
  QuickTastingData,
  QuickTastingResponse
} from '@/types/quick-tasting'

// POST /api/quick-tasting - Create a new quick tasting
export async function POST(request: NextRequest) {
  try {
    // Get user from request (server-side auth)
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in to create tastings.',
          code: 'AUTH_MISSING'
        },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Handle test user in development mode
    let user: any
    if (process.env.NODE_ENV === 'development' && token === 'test-user-token') {
      user = {
        id: '00000000-0000-0000-0000-000000000001', // Valid UUID format for test user
        email: 'test@flavorwheel.com'
      }
    } else {
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError) {
        console.error('Auth error:', authError)
        return NextResponse.json(
          {
            success: false,
            error: `Authentication failed: ${authError.message}`,
            code: 'AUTH_ERROR'
          },
          { status: 401 }
        )
      }

      if (!supabaseUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found. Please log in again.',
            code: 'USER_NOT_FOUND'
          },
          { status: 401 }
        )
      }

      user = supabaseUser
    }

    // Validate user ID format
    if (!user.id || typeof user.id !== 'string' || user.id.length !== 36) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID. Please log in again.',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      )
    }

    // Parse request body
    const tastingData: QuickTastingData = await request.json()

    // Compute overall rating if overallScore (0–100) is provided
    const computedOverallRating = typeof (tastingData as any).overallScore === 'number'
      ? Math.max(1, Math.min(10, Math.round(((tastingData as any).overallScore as number) / 10)))
      : tastingData.overallRating

    // Validate required fields
    if (!tastingData.productType || !tastingData.productName) {
      return NextResponse.json(
        { success: false, error: 'Product type and name are required' },
        { status: 400 }
      )
    }

    const hasSelectedFlavors = Array.isArray(tastingData.selectedFlavors) && tastingData.selectedFlavors.length > 0
    const hasNoteBased = Boolean((tastingData as any).aroma?.trim?.() || (tastingData as any).flavor?.trim?.())
    if (!hasSelectedFlavors && !hasNoteBased) {
      return NextResponse.json(
        { success: false, error: 'Provide at least one flavor (selected or entered in notes)' },
        { status: 400 }
      )
    }

    // Create the tasting record using actual database schema
    const tastingPayload = {
      name: `${tastingData.productName} Quick Tasting`,
      description: `Quick tasting of ${tastingData.productName}`,
      type: 'quick',
      created_by: user.id,
      date: new Date().toISOString(),
      // Store consolidated quick tasting data in tasting_data (jsonb)
      tasting_data: {
        productType: tastingData.productType,
        productName: tastingData.productName,
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: computedOverallRating,
        overallScore: (tastingData as any).overallScore ?? undefined,
        aroma: (tastingData as any).aroma ?? '',
        flavor: (tastingData as any).flavor ?? '',
        other: (tastingData as any).other ?? '',
        notes: tastingData.notes,
        image: tastingData.image,
        completedAt: new Date().toISOString()
      },
      // Store flavors in the 'characteristics' array field (which exists)
      characteristics: tastingData.selectedFlavors,
      is_public: false
    }

    const { data: tasting, error: tastingError } = await supabase
      .from('tastings')
      .insert(tastingPayload)
      .select()
      .single()

    if (tastingError) {
      console.error('Error creating tasting:', tastingError)
      return NextResponse.json(
        { success: false, error: 'Failed to create tasting record' },
        { status: 500 }
      )
    }

    // Create a tasting item for the beverage
    const itemPayload = {
      tasting_id: tasting.id,
      name: tastingData.productName,
      type: tastingData.productType,
      details: {
        flavors: tastingData.selectedFlavors,
        rating: computedOverallRating,
        notes: [
          (tastingData as any).aroma,
          (tastingData as any).flavor,
          (tastingData as any).other,
          tastingData.notes,
        ].filter(Boolean).join(' '),
        image: tastingData.image
      }
    }

    const { data: insertedItem, error: itemError } = await supabase
      .from('tasting_items')
      .insert(itemPayload)
      .select()
      .single()

    if (itemError) {
      console.error('Error creating tasting item:', itemError)
      // Don't fail the entire operation for item creation error
    }

    // Create flavor wheel entry if flavors are provided
    // Only attempt this if the flavor_wheels table exists
    if (tastingData.selectedFlavors.length > 0 && insertedItem?.id) {
      try {
        // Check if flavor_wheels table exists first
        const { data: tableCheck } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'flavor_wheels')
          .single()

        if (tableCheck) {
          const flavorWheelPayload = {
            tasting_id: tasting.id,
            item_id: insertedItem.id,
            user_id: user.id,
            wheel_type: 'combined',
            wheel_data: {
              flavors: tastingData.selectedFlavors,
              rating: computedOverallRating,
              notes: [
                (tastingData as any).aroma,
                (tastingData as any).flavor,
                (tastingData as any).other,
                tastingData.notes,
              ].filter(Boolean).join(' ')
            }
          }

          const { error: wheelError } = await supabase
            .from('flavor_wheels')
            .insert(flavorWheelPayload)

          if (wheelError) {
            console.error('Error creating flavor wheel:', wheelError)
            // Don't fail the entire operation for flavor wheel creation error
          }
        } else {
          console.log('flavor_wheels table does not exist, skipping flavor wheel creation')
        }
      } catch (tableCheckError) {
        console.log('Could not check for flavor_wheels table, skipping flavor wheel creation:', tableCheckError)
      }
    }

    // Update smart defaults with this tasting data
    try {
      // This would integrate with the smart defaults system
      // For now, we'll just log it
      console.log('Tasting data for smart defaults:', {
        productType: tastingData.productType,
        selectedFlavors: tastingData.selectedFlavors,
        rating: computedOverallRating
      })
    } catch (smartDefaultsError) {
      console.error('Error updating smart defaults:', smartDefaultsError)
    }

    return NextResponse.json({
      success: true,
      tastingId: tasting.id,
      message: 'Quick tasting created successfully'
    })

  } catch (error) {
    console.error('Unexpected error in quick tasting creation:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/quick-tasting - Get user's quick tastings
export async function GET(request: NextRequest) {
  try {
    // Get user from request (server-side auth)
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      )
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
      console.error('Error fetching tastings:', tastingsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tastings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tastings: tastings || []
    })

  } catch (error) {
    console.error('Unexpected error fetching quick tastings:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
