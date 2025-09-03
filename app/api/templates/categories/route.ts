import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // For now, return predefined categories since the template system is still being built
    const categories = [
      {
        id: 'wine',
        name: 'Wine Tasting',
        description: 'Professional wine evaluation templates',
        icon: '🍷',
        color: '#8B4513',
        count: 12
      },
      {
        id: 'spirits',
        name: 'Spirits & Liquors',
        description: 'Templates for whiskey, gin, tequila, and other spirits',
        icon: '🥃',
        color: '#DAA520',
        count: 8
      },
      {
        id: 'beer',
        name: 'Beer Evaluation',
        description: 'Craft beer and brewing analysis templates',
        icon: '🍺',
        color: '#FFD700',
        count: 6
      },
      {
        id: 'coffee',
        name: 'Coffee Tasting',
        description: 'Professional coffee cupping templates',
        icon: '☕',
        color: '#8B4513',
        count: 5
      },
      {
        id: 'competition',
        name: 'Competition Judging',
        description: 'Structured evaluation for tasting competitions',
        icon: '🏆',
        color: '#FFD700',
        count: 4
      },
      {
        id: 'educational',
        name: 'Educational Sessions',
        description: 'Learning-focused tasting experiences',
        icon: '🎓',
        color: '#4B0082',
        count: 7
      }
    ]

    return NextResponse.json({ data: categories })
  } catch (error) {
    console.error('Error fetching template categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
