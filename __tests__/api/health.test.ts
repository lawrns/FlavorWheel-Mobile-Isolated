import { GET } from '@/app/api/health/route'
import { NextRequest } from 'next/server'

describe('/api/health', () => {
  it('should return healthy status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health')
    const response = await GET(request)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('service', 'flavatix')

    // Verify timestamp is valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })

  it('should handle request with query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/health?test=1')
    const response = await GET(request)

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.status).toBe('healthy')
  })
})










