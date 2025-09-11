import { useState, useEffect } from 'react'

// Mock data for tasting details
const mockTastingData = {
  id: '1',
  name: 'Sample Tasting',
  description: 'A sample tasting for demonstration',
  items: [
    { id: '1', name: 'Coffee Sample 1' },
    { id: '2', name: 'Coffee Sample 2' },
  ],
  categories: [
    { id: '1', name: 'Aroma', parameterType: 'subjective_input' },
    { id: '2', name: 'Flavor', parameterType: 'subjective_input' },
  ],
  participants: [],
  created_at: new Date().toISOString(),
  status: 'active'
}

export function useTastingDetail(tastingId: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTastingDetail = async () => {
    try {
      setLoading(true)
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Return mock data
      setData(mockTastingData)
      setError(null)
    } catch (err) {
      setError('Failed to load tasting details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tastingId) {
      fetchTastingDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tastingId])

  const refresh = async () => {
    await fetchTastingDetail()
  }

  return { data, loading, error, refresh }
}

export function useTastings() {
  const [tastings, setTastings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchTastings = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setTastings([mockTastingData])
      } catch (err) {
        console.error('Failed to load tastings')
      } finally {
        setLoading(false)
      }
    }

    fetchTastings()
  }, [])

  return { tastings, loading }
}
