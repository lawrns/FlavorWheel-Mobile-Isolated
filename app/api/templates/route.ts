import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('templates')
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .limit(limit)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty_level', difficulty)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    if (sortOrder === 'desc') {
      query = query.order(sortBy, { ascending: false })
    } else {
      query = query.order(sortBy, { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Error in templates API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement template creation
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Template creation not yet implemented',
      template: await request.json()
    }, { status: 501 })
  } catch (error) {
    // Log error for debugging (in production, consider using a proper logging service)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

