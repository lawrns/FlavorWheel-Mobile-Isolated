import { useState, useEffect, useCallback } from 'react'

export interface FlavorWheelConfig {
  // Accept both page/service and hook variants for wheel type
  wheelType: 'personal' | 'universal' | 'combined' | 'aroma' | 'flavor' | 'metaphor'
  scope: 'personal' | 'universal' | 'sku' | 'category' | 'gender' | 'place' | 'age_range'
  userId?: string
  useMultilingualExtraction?: boolean
}

export interface FlavorNode {
  name: string
  value?: number
  children?: FlavorNode[]
  intensity?: number
}

export function useFlavorWheel(config?: FlavorWheelConfig) {
  const [data, setData] = useState<FlavorNode[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Mock data for demonstration
  const mockFlavorData: FlavorNode[] = [
    {
      name: 'Fruity',
      value: 85,
      intensity: 0.8,
      children: [
        { name: 'Citrus', value: 45, intensity: 0.9 },
        { name: 'Berry', value: 35, intensity: 0.7 },
        { name: 'Tropical', value: 25, intensity: 0.6 }
      ]
    },
    {
      name: 'Floral',
      value: 65,
      intensity: 0.6,
      children: [
        { name: 'Rose', value: 30, intensity: 0.8 },
        { name: 'Jasmine', value: 25, intensity: 0.7 },
        { name: 'Lavender', value: 20, intensity: 0.5 }
      ]
    },
    {
      name: 'Smoky',
      value: 55,
      intensity: 0.5,
      children: [
        { name: 'Oak', value: 30, intensity: 0.7 },
        { name: 'Cedar', value: 20, intensity: 0.6 },
        { name: 'Peat', value: 15, intensity: 0.4 }
      ]
    }
  ]

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setData(mockFlavorData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flavor data')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  const updateConfig = useCallback((newConfig: FlavorWheelConfig) => {
    // Handle config updates
    console.log('Updating flavor wheel config:', newConfig)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    selectedCategory,
    refreshData,
    updateConfig
  }
}
