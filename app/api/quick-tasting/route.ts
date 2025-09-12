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
        { success: false, error: 'Authentication required' },
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

      if (authError || !supabaseUser) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication' },
          { status: 401 }
        )
      }

      user = supabaseUser
    }

    // Parse request body
    const tastingData: QuickTastingData = await request.json()

    // Validate required fields
    if (!tastingData.productType || !tastingData.productName) {
      return NextResponse.json(
        { success: false, error: 'Product type and name are required' },
        { status: 400 }
      )
    }

    if (!tastingData.selectedFlavors || tastingData.selectedFlavors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one flavor must be selected' },
        { status: 400 }
      )
    }

    // Create the tasting record using actual database schema
    const tastingPayload = {
      code: `QT-${Date.now()}`, // Required field
      name: `${tastingData.productName} Quick Tasting`,
      description: `Quick tasting of ${tastingData.productName}`,
      type: 'quick',
      created_by: user.id,
      date: new Date().toISOString(),
      // Store tasting data in the 'notes' jsonb field (which exists)
      notes: {
        productType: tastingData.productType,
        productName: tastingData.productName,
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: tastingData.overallRating,
        notes: tastingData.notes,
        image: tastingData.image,
        completedAt: new Date().toISOString()
      },
      // Store flavors in the 'characteristics' array field (which exists)
      characteristics: tastingData.selectedFlavors,
      completed_at: new Date().toISOString(),
      mode: 'study', // Default value
      review_type: 'quick',
      product_type: tastingData.productType,
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
        rating: tastingData.overallRating,
        notes: tastingData.notes,
        image: tastingData.image
      }
    }

    const { error: itemError } = await supabase
      .from('tasting_items')
      .insert(itemPayload)

    if (itemError) {
      console.error('Error creating tasting item:', itemError)
      // Don't fail the entire operation for item creation error
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
        console.error('Error creating flavor wheel:', wheelError)
        // Don't fail the entire operation for flavor wheel creation error
      }
    }

    // Update smart defaults with this tasting data
    try {
      // This would integrate with the smart defaults system
      // For now, we'll just log it
      console.log('Tasting data for smart defaults:', {
        productType: tastingData.productType,
        selectedFlavors: tastingData.selectedFlavors,
        rating: tastingData.overallRating
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
