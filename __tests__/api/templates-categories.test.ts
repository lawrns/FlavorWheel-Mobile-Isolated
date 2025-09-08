import { GET } from '@/app/api/templates/categories/route'
import { NextRequest } from 'next/server'

describe('/api/templates/categories', () => {
  describe('GET /api/templates/categories', () => {
    it('should return predefined categories', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.length).toBeGreaterThan(0)
    })

    it('should contain expected category structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories')
      const response = await GET(request)

      const data = await response.json()
      const categories = data.data

      // Check that each category has the expected properties
      categories.forEach((category: any) => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('icon')
        expect(category).toHaveProperty('color')
        expect(category).toHaveProperty('count')

        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.description).toBe('string')
        expect(typeof category.icon).toBe('string')
        expect(typeof category.color).toBe('string')
        expect(typeof category.count).toBe('number')
      })
    })

    it('should include all expected beverage categories', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories')
      const response = await GET(request)

      const data = await response.json()
      const categories = data.data
      const categoryIds = categories.map((cat: any) => cat.id)

      const expectedCategories = [
        'wine',
        'spirits',
        'beer',
        'coffee',
        'competition',
        'educational'
      ]

      expectedCategories.forEach(expectedId => {
        expect(categoryIds).toContain(expectedId)
      })
    })

    it('should have appropriate counts for each category', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories')
      const response = await GET(request)

      const data = await response.json()
      const categories = data.data

      categories.forEach((category: any) => {
        expect(category.count).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have valid color formats', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories')
      const response = await GET(request)

      const data = await response.json()
      const categories = data.data

      categories.forEach((category: any) => {
        // Check if color is a valid hex color
        expect(category.color).toMatch(/^#[0-9A-F]{6}$/i)
      })
    })

    it('should handle request with query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/categories?test=1')
      const response = await GET(request)

      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data).toHaveProperty('data')
    })
  })
})










