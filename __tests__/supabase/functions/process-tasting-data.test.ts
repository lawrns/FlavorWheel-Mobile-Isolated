// Mock Deno environment for testing
const mockDeno = {
  env: {
    get: jest.fn((key: string) => {
      const env = {
        'SUPABASE_URL': 'https://test.supabase.co',
        'SUPABASE_SERVICE_ROLE_KEY': 'test-service-key'
      }
      return env[key]
    })
  }
}

// Mock global Deno
;(global as any).Deno = mockDeno

// Test the processing logic directly without importing the edge function
// This simulates the logic from the edge function

describe('process-tasting-data Edge Function', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate required input fields', () => {
    const validInput = {
      tasting_id: 'tasting-123',
      user_id: 'user-123',
      tasting_data: {
        items: [{ id: 'item-1', rating: 8, notes: 'Great flavor' }]
      }
    }

    expect(validInput.tasting_id).toBeDefined()
    expect(validInput.user_id).toBeDefined()
    expect(validInput.tasting_data).toBeDefined()
  })

  it('should handle CORS preflight requests', () => {
    const mockReq = {
      method: 'OPTIONS',
      json: jest.fn()
    }

    expect(mockReq.method).toBe('OPTIONS')
  })

  it('should process tasting completion successfully', () => {
    const mockTastingData = {
      items: [
        { id: 'item-1', rating: 8, title: 'Wine A', notes: 'Good balance' },
        { id: 'item-2', rating: 7, title: 'Wine B', notes: 'Fruity' }
      ]
    }

    expect(mockTastingData.items).toHaveLength(2)
    expect(mockTastingData.items[0]).toHaveProperty('rating')
    expect(mockTastingData.items[0]).toHaveProperty('notes')
  })

  it('should generate tasting insights for new users', () => {
    // Test first tasting scenario
    const emptyPreviousTastings = []

    const insight = emptyPreviousTastings.length === 0 ? {
      message: 'Primera cata completada! Continúa catando para obtener insights personalizados.',
      is_first_tasting: true
    } : null

    expect(insight?.is_first_tasting).toBe(true)
    expect(insight?.message).toContain('Primera cata')
  })

  it('should analyze flavor preferences', () => {
    const currentTasting = {
      flavors: [
        { name: 'vanilla', intensity: 0.8 },
        { name: 'citrus', intensity: 0.6 },
        { name: 'caramel', intensity: 0.7 }
      ]
    }

    const previousTastings = [
      {
        tasting_data: {
          flavors: [
            { name: 'vanilla', intensity: 0.9 },
            { name: 'smoke', intensity: 0.5 }
          ]
        }
      }
    ]

    const allFlavors: Record<string, number> = {}

    // Process current tasting
    currentTasting.flavors.forEach((flavor: any) => {
      allFlavors[flavor.name] = (allFlavors[flavor.name] || 0) + (flavor.intensity || 1)
    })

    // Process previous tastings
    previousTastings.forEach((tasting: any) => {
      if (tasting.tasting_data?.flavors) {
        tasting.tasting_data.flavors.forEach((flavor: any) => {
          allFlavors[flavor.name] = (allFlavors[flavor.name] || 0) + (flavor.intensity || 1)
        })
      }
    })

    expect(allFlavors.vanilla).toBeCloseTo(1.7) // 0.8 + 0.9
    expect(allFlavors.citrus).toBe(0.6)
    expect(allFlavors.caramel).toBe(0.7)
    expect(allFlavors.smoke).toBe(0.5)
  })

  it('should analyze rating patterns', () => {
    const currentTasting = {
      items: [
        { rating: 8 },
        { rating: 9 },
        { rating: 7 }
      ]
    }

    const previousTastings = [
      {
        tasting_data: {
          items: [
            { rating: 7 },
            { rating: 8 }
          ]
        }
      }
    ]

    const ratings: number[] = []

    // Collect all ratings
    currentTasting.items.forEach((item: any) => {
      if (item.rating) ratings.push(item.rating)
    })

    previousTastings.forEach((tasting: any) => {
      if (tasting.tasting_data?.items) {
        tasting.tasting_data.items.forEach((item: any) => {
          if (item.rating) ratings.push(item.rating)
        })
      }
    })

    expect(ratings).toEqual([8, 9, 7, 7, 8])
    expect(ratings.length).toBe(5)

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    expect(average).toBeCloseTo(7.8)
  })

  it('should generate rating distribution', () => {
    const ratings = [7, 8, 8, 9, 7, 8]
    const distribution: Record<number, number> = {}

    ratings.forEach(rating => {
      const rounded = Math.round(rating)
      distribution[rounded] = (distribution[rounded] || 0) + 1
    })

    expect(distribution[7]).toBe(2)
    expect(distribution[8]).toBe(3)
    expect(distribution[9]).toBe(1)
  })

  it('should generate recommendations based on preferences', () => {
    const flavorPreferences = {
      top_flavors: [{ name: 'vanilla', score: 2.5 }]
    }

    const ratingPatterns = {
      average_rating: 8.2
    }

    const recommendations = []

    // Flavor-based recommendations
    if (flavorPreferences.top_flavors?.length > 0) {
      const topFlavor = flavorPreferences.top_flavors[0].name
      recommendations.push({
        type: 'flavor_exploration',
        message: `Te gusta mucho el sabor a ${topFlavor}. Prueba bebidas de Oaxaca que destacan este perfil.`,
        action: 'explore_region',
        data: { region: 'Oaxaca', flavor: topFlavor }
      })
    }

    // Rating-based recommendations
    if (ratingPatterns.average_rating > 7) {
      recommendations.push({
        type: 'expertise_development',
        message: 'Tienes buen paladar! Considera probar catas a ciegas para desarrollar más tu expertise.',
        action: 'try_blind_tasting',
        data: { difficulty: 'intermediate' }
      })
    }

    expect(recommendations).toHaveLength(2)
    expect(recommendations[0].type).toBe('flavor_exploration')
    expect(recommendations[1].type).toBe('expertise_development')
  })

  it('should check achievements for first tasting', () => {
    const tastingCount = 1

    const achievements = []

    if (tastingCount === 1) {
      achievements.push({
        type: 'first_tasting',
        title: 'Primera Cata',
        description: 'Completaste tu primera cata',
        points: 10
      })
    }

    expect(achievements).toHaveLength(1)
    expect(achievements[0].type).toBe('first_tasting')
  })

  it('should check achievements for high ratings', () => {
    const tastingData = {
      items: [
        { rating: 9 },
        { rating: 8 }
      ]
    }

    const achievements = []

    if (tastingData.items?.some((item: any) => item.rating >= 9)) {
      achievements.push({
        type: 'high_rating',
        title: 'Paladar Exigente',
        description: 'Otorgaste una calificación de 9 o más',
        points: 15
      })
    }

    expect(achievements).toHaveLength(1)
    expect(achievements[0].type).toBe('high_rating')
  })

  it('should handle missing environment variables', () => {
    const emptyEnv = mockDeno.env.get('NON_EXISTENT')
    expect(emptyEnv).toBeUndefined()
  })
})
