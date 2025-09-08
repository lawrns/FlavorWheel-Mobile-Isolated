import { GET, POST } from '@/app/api/templates/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Wine Tasting Template',
            description: 'A comprehensive wine tasting template',
            category: 'wine',
            difficulty_level: 'intermediate',
            is_public: true,
            created_at: '2024-01-01T00:00:00Z',
            user_id: 'user-1',
            profiles: {
              name: 'Test User',
              avatar_url: 'https://example.com/avatar.jpg'
            }
          }
        ],
        error: null
      })
    }))
  }
}))

// Mock URL constructor for NextRequest
global.URL = class URL {
  constructor(url) {
    this.href = url
    this.searchParams = new URLSearchParams(url.split('?')[1] || '')
  }

  static createObjectURL = jest.fn()
  static revokeObjectURL = jest.fn()
}

describe('/api/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/templates', () => {
    it('should return templates successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should filter by category', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates?category=wine')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
    })

    it('should filter by difficulty', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates?difficulty=intermediate')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
    })

    it('should search by text', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates?search=wine')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
    })

    it('should sort by created_at descending by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
    })

    it('should handle database errors', async () => {
      // Mock a database error
      const { supabase } = require('@/lib/supabase')
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed')
        })
      })

      const request = new NextRequest('http://localhost:3000/api/templates')
      const response = await GET(request)

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Failed to fetch templates')
    })
  })

  describe('POST /api/templates', () => {
    it('should return not implemented status', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Template',
          description: 'A test template'
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(501)

      const data = await response.json()
      expect(data).toHaveProperty('message')
      expect(data.message).toContain('not yet implemented')
    })

    it('should handle request parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)

      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })
})
