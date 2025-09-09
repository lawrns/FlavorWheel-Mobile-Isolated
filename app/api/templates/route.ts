import { NextRequest, NextResponse } from 'next/server'
import { supabaseClient } from '../../../lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    // Return mock template data for development
    return NextResponse.json({
      data: [
        {
          id: 'mock-template-1',
          name: 'Basic Wine Tasting Template',
          description: 'A comprehensive template for wine tasting',
          category: 'wine',
          difficulty_level: 'beginner',
          is_public: true,
          created_at: new Date().toISOString(),
          user_id: 'mock-user',
          profiles: {
            name: 'FlavorWheel Team',
            avatar_url: null
          }
        },
        {
          id: 'mock-template-2',
          name: 'Advanced Spirits Analysis',
          description: 'Detailed template for spirits evaluation',
          category: 'spirits',
          difficulty_level: 'advanced',
          is_public: true,
          created_at: new Date().toISOString(),
          user_id: 'mock-user',
          profiles: {
            name: 'Expert Reviewer',
            avatar_url: null
          }
        }
      ]
    })
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

