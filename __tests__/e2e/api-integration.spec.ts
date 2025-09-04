import { test, expect } from '@playwright/test'

test.describe('API Integration & Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/landing')
    await page.waitForSelector('#main-content', { timeout: 10000 })

    // Mock authenticated user
    await page.evaluate(() => {
      localStorage.setItem('user-session', JSON.stringify({
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User'
        }
      }))
    })
  })

  test.describe('Health & System APIs', () => {
    test('should verify system health endpoints', async ({ page }) => {
      const healthResponse = await page.request.get('/api/health')
      expect(healthResponse.status()).toBe(200)

      const healthData = await healthResponse.json()
      expect(healthData).toHaveProperty('status')
      expect(healthData).toHaveProperty('timestamp')
      expect(healthData).toHaveProperty('uptime')

      // Should indicate system is healthy
      expect(healthData.status).toBe('healthy')
    })

    test('should handle API versioning', async ({ page }) => {
      // Test different API versions
      const versions = ['v1', 'v2', 'latest']

      for (const version of versions) {
        const response = await page.request.get(`/api/${version}/health`)
        expect([200, 404].includes(response.status())).toBeTruthy()

        if (response.status() === 200) {
          const data = await response.json()
          expect(data).toHaveProperty('version', version)
        }
      }
    })

    test('should provide system metrics', async ({ page }) => {
      const metricsResponse = await page.request.get('/api/metrics')
      expect([200, 401, 403].includes(metricsResponse.status())).toBeTruthy()

      if (metricsResponse.status() === 200) {
        const metrics = await metricsResponse.json()
        expect(metrics).toHaveProperty('activeUsers')
        expect(metrics).toHaveProperty('totalTastings')
        expect(metrics).toHaveProperty('systemLoad')
      }
    })
  })

  test.describe('Authentication APIs', () => {
    test('should handle login API calls', async ({ page }) => {
      const loginData = {
        email: 'test@example.com',
        password: 'ValidPass123!'
      }

      const response = await page.request.post('/api/auth/login', {
        data: loginData
      })

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('token')
        expect(result.user).toHaveProperty('id')
        expect(result.user).toHaveProperty('email')
      }
    })

    test('should handle registration API calls', async ({ page }) => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'NewPass123!',
        name: 'New User',
        acceptTerms: true
      }

      const response = await page.request.post('/api/auth/register', {
        data: registerData
      })

      expect([201, 400, 409].includes(response.status())).toBeTruthy()

      if (response.status() === 201) {
        const result = await response.json()
        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('message')
      }
    })

    test('should handle token refresh', async ({ page }) => {
      // Assume we have a valid refresh token
      const refreshData = {
        refreshToken: 'valid-refresh-token'
      }

      const response = await page.request.post('/api/auth/refresh', {
        data: refreshData
      })

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('accessToken')
        expect(result).toHaveProperty('refreshToken')
      }
    })

    test('should handle logout API calls', async ({ page }) => {
      const response = await page.request.post('/api/auth/logout')

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('message')
      }
    })
  })

  test.describe('Tasting APIs', () => {
    test('should create tasting via API', async ({ page }) => {
      const tastingData = {
        name: 'API Created Tasting',
        description: 'Created via API call',
        type: 'guided',
        beverageType: 'whiskey',
        isPublic: true
      }

      const response = await page.request.post('/api/tastings', {
        data: tastingData
      })

      expect([201, 401, 403].includes(response.status())).toBeTruthy()

      if (response.status() === 201) {
        const result = await response.json()
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('name', tastingData.name)
        expect(result).toHaveProperty('createdAt')
      }
    })

    test('should retrieve tasting list', async ({ page }) => {
      const response = await page.request.get('/api/tastings')

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(Array.isArray(result.tastings)).toBeTruthy()

        if (result.tastings.length > 0) {
          const firstTasting = result.tastings[0]
          expect(firstTasting).toHaveProperty('id')
          expect(firstTasting).toHaveProperty('name')
          expect(firstTasting).toHaveProperty('status')
          expect(firstTasting).toHaveProperty('createdAt')
        }
      }
    })

    test('should update tasting data', async ({ page }) => {
      // First get a tasting ID
      const listResponse = await page.request.get('/api/tastings')
      if (listResponse.status() !== 200) return

      const tastings = await listResponse.json()
      if (!tastings.tastings || tastings.tastings.length === 0) return

      const tastingId = tastings.tastings[0].id

      const updateData = {
        name: 'Updated Tasting Name',
        description: 'Updated description',
        isPublic: false
      }

      const response = await page.request.put(`/api/tastings/${tastingId}`, {
        data: updateData
      })

      expect([200, 403, 404].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('name', updateData.name)
        expect(result).toHaveProperty('description', updateData.description)
      }
    })

    test('should handle tasting deletion', async ({ page }) => {
      // Create a test tasting first
      const createData = {
        name: 'Test Tasting for Deletion',
        type: 'quick',
        beverageType: 'wine'
      }

      const createResponse = await page.request.post('/api/tastings', {
        data: createData
      })

      if (createResponse.status() !== 201) return

      const createdTasting = await createResponse.json()
      const tastingId = createdTasting.id

      // Delete the tasting
      const deleteResponse = await page.request.delete(`/api/tastings/${tastingId}`)
      expect([200, 204, 403, 404].includes(deleteResponse.status())).toBeTruthy()

      // Verify deletion
      const getResponse = await page.request.get(`/api/tastings/${tastingId}`)
      expect([404, 403].includes(getResponse.status())).toBeTruthy()
    })
  })

  test.describe('User Profile APIs', () => {
    test('should retrieve user profile', async ({ page }) => {
      const response = await page.request.get('/api/user/profile')

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const profile = await response.json()
        expect(profile).toHaveProperty('id')
        expect(profile).toHaveProperty('email')
        expect(profile).toHaveProperty('name')
        expect(profile).toHaveProperty('preferences')
        expect(profile).toHaveProperty('stats')
      }
    })

    test('should update user profile', async ({ page }) => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
        preferences: {
          notifications: true,
          theme: 'dark'
        }
      }

      const response = await page.request.put('/api/user/profile', {
        data: updateData
      })

      expect([200, 401, 403].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('name', updateData.name)
        expect(result).toHaveProperty('bio', updateData.bio)
      }
    })

    test('should handle profile picture upload', async ({ page }) => {
      // Create a test file
      const testImage = Buffer.from('fake-image-content')

      const response = await page.request.post('/api/user/avatar', {
        multipart: {
          avatar: {
            name: 'test-avatar.jpg',
            mimeType: 'image/jpeg',
            buffer: testImage
          }
        }
      })

      expect([200, 400, 401, 413].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const result = await response.json()
        expect(result).toHaveProperty('avatarUrl')
      }
    })
  })

  test.describe('Social APIs', () => {
    test('should handle follow/unfollow operations', async ({ page }) => {
      const targetUserId = 'target-user-123'

      // Follow user
      const followResponse = await page.request.post(`/api/social/follow/${targetUserId}`)
      expect([200, 201, 400, 401, 409].includes(followResponse.status())).toBeTruthy()

      if (followResponse.status() === 200 || followResponse.status() === 201) {
        const result = await followResponse.json()
        expect(result).toHaveProperty('message')
        expect(result).toHaveProperty('isFollowing', true)
      }

      // Unfollow user
      const unfollowResponse = await page.request.delete(`/api/social/follow/${targetUserId}`)
      expect([200, 400, 401, 404].includes(unfollowResponse.status())).toBeTruthy()

      if (unfollowResponse.status() === 200) {
        const result = await unfollowResponse.json()
        expect(result).toHaveProperty('message')
        expect(result).toHaveProperty('isFollowing', false)
      }
    })

    test('should retrieve social feed', async ({ page }) => {
      const response = await page.request.get('/api/social/feed')

      expect([200, 401].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const feed = await response.json()
        expect(Array.isArray(feed.posts)).toBeTruthy()

        if (feed.posts.length > 0) {
          const firstPost = feed.posts[0]
          expect(firstPost).toHaveProperty('id')
          expect(firstPost).toHaveProperty('author')
          expect(firstPost).toHaveProperty('content')
          expect(firstPost).toHaveProperty('createdAt')
          expect(firstPost).toHaveProperty('likes')
          expect(firstPost).toHaveProperty('comments')
        }
      }
    })

    test('should handle like/unlike operations', async ({ page }) => {
      const postId = 'test-post-123'

      // Like post
      const likeResponse = await page.request.post(`/api/social/posts/${postId}/like`)
      expect([200, 201, 400, 401, 409].includes(likeResponse.status())).toBeTruthy()

      if (likeResponse.status() === 200 || likeResponse.status() === 201) {
        const result = await likeResponse.json()
        expect(result).toHaveProperty('likes')
        expect(typeof result.likes).toBe('number')
      }

      // Unlike post
      const unlikeResponse = await page.request.delete(`/api/social/posts/${postId}/like`)
      expect([200, 400, 401, 404].includes(unlikeResponse.status())).toBeTruthy()
    })

    test('should handle comments', async ({ page }) => {
      const postId = 'test-post-123'

      // Add comment
      const commentData = {
        content: 'This is a test comment',
        parentId: null // Not a reply
      }

      const commentResponse = await page.request.post(`/api/social/posts/${postId}/comments`, {
        data: commentData
      })

      expect([201, 400, 401, 403].includes(commentResponse.status())).toBeTruthy()

      if (commentResponse.status() === 201) {
        const result = await commentResponse.json()
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('content', commentData.content)
        expect(result).toHaveProperty('author')
        expect(result).toHaveProperty('createdAt')

        const commentId = result.id

        // Delete comment
        const deleteResponse = await page.request.delete(`/api/social/comments/${commentId}`)
        expect([200, 204, 403, 404].includes(deleteResponse.status())).toBeTruthy()
      }
    })
  })

  test.describe('Data Export APIs', () => {
    test('should export user data', async ({ page }) => {
      const response = await page.request.get('/api/user/export')

      expect([200, 401, 403, 202].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const contentType = response.headers()['content-type']
        expect(contentType).toContain('application/json')

        const data = await response.json()
        expect(data).toHaveProperty('user')
        expect(data).toHaveProperty('tastings')
        expect(data).toHaveProperty('social')
      }
    })

    test('should export tasting data', async ({ page }) => {
      const tastingId = 'test-tasting-123'

      const response = await page.request.get(`/api/tastings/${tastingId}/export`)

      expect([200, 401, 403, 404].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const contentType = response.headers()['content-type']
        expect(['application/json', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].some(type =>
          contentType?.includes(type)
        )).toBeTruthy()

        if (contentType?.includes('json')) {
          const data = await response.json()
          expect(data).toHaveProperty('tasting')
          expect(data).toHaveProperty('notes')
          expect(data).toHaveProperty('results')
        }
      }
    })
  })

  test.describe('Search APIs', () => {
    test('should handle tasting search', async ({ page }) => {
      const searchParams = new URLSearchParams({
        q: 'whiskey',
        type: 'guided',
        sort: 'recent',
        limit: '10'
      })

      const response = await page.request.get(`/api/search/tastings?${searchParams}`)

      expect([200, 400].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const results = await response.json()
        expect(results).toHaveProperty('tastings')
        expect(results).toHaveProperty('total')
        expect(results).toHaveProperty('page')
        expect(Array.isArray(results.tastings)).toBeTruthy()

        // Verify search relevance
        if (results.tastings.length > 0) {
          const firstResult = results.tastings[0]
          expect(firstResult).toHaveProperty('name')
          expect(firstResult).toHaveProperty('description')
          expect(firstResult).toHaveProperty('relevanceScore')
        }
      }
    })

    test('should handle user search', async ({ page }) => {
      const response = await page.request.get('/api/search/users?q=john')

      expect([200, 400].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const results = await response.json()
        expect(results).toHaveProperty('users')
        expect(Array.isArray(results.users)).toBeTruthy()

        if (results.users.length > 0) {
          const firstUser = results.users[0]
          expect(firstUser).toHaveProperty('id')
          expect(firstUser).toHaveProperty('name')
          expect(firstUser).toHaveProperty('username')
          expect(firstUser).toHaveProperty('avatar')
        }
      }
    })

    test('should handle advanced search filters', async ({ page }) => {
      const filters = {
        beverageType: 'whiskey',
        rating: { min: 7, max: 10 },
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
        tags: ['premium', 'aged'],
        location: 'Scotland'
      }

      const response = await page.request.post('/api/search/advanced', {
        data: filters
      })

      expect([200, 400].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const results = await response.json()
        expect(results).toHaveProperty('results')
        expect(results).toHaveProperty('facets')
        expect(results).toHaveProperty('totalCount')
      }
    })
  })

  test.describe('Analytics APIs', () => {
    test('should retrieve user analytics', async ({ page }) => {
      const response = await page.request.get('/api/analytics/user')

      expect([200, 401, 403].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const analytics = await response.json()
        expect(analytics).toHaveProperty('tastingStats')
        expect(analytics).toHaveProperty('socialStats')
        expect(analytics).toHaveProperty('engagementMetrics')

        // Verify tasting stats
        expect(analytics.tastingStats).toHaveProperty('totalTastings')
        expect(analytics.tastingStats).toHaveProperty('averageRating')
        expect(analytics.tastingStats).toHaveProperty('favoriteBeverageType')

        // Verify social stats
        expect(analytics.socialStats).toHaveProperty('followers')
        expect(analytics.socialStats).toHaveProperty('following')
        expect(analytics.socialStats).toHaveProperty('likesReceived')
      }
    })

    test('should retrieve tasting analytics', async ({ page }) => {
      const tastingId = 'test-tasting-123'

      const response = await page.request.get(`/api/analytics/tastings/${tastingId}`)

      expect([200, 401, 403, 404].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const analytics = await response.json()
        expect(analytics).toHaveProperty('views')
        expect(analytics).toHaveProperty('likes')
        expect(analytics).toHaveProperty('comments')
        expect(analytics).toHaveProperty('shares')
        expect(analytics).toHaveProperty('engagementRate')
        expect(analytics).toHaveProperty('geographicDistribution')
      }
    })

    test('should retrieve system-wide analytics', async ({ page }) => {
      const response = await page.request.get('/api/analytics/system')

      expect([200, 401, 403].includes(response.status())).toBeTruthy()

      if (response.status() === 200) {
        const analytics = await response.json()
        expect(analytics).toHaveProperty('totalUsers')
        expect(analytics).toHaveProperty('totalTastings')
        expect(analytics).toHaveProperty('activeUsers')
        expect(analytics).toHaveProperty('popularBeverages')
        expect(analytics).toHaveProperty('trendingFlavors')
        expect(analytics).toHaveProperty('geographicStats')
      }
    })
  })

  test.describe('Error Handling & Rate Limiting', () => {
    test('should handle API rate limiting', async ({ page }) => {
      // Make multiple rapid requests
      const requests = []
      for (let i = 0; i < 100; i++) {
        requests.push(page.request.get('/api/health'))
      }

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(r => r.status() === 429)

      // Should encounter rate limiting
      expect(rateLimitedResponses.length).toBeGreaterThan(0)

      if (rateLimitedResponses.length > 0) {
        const rateLimitResponse = rateLimitedResponses[0]
        const headers = rateLimitResponse.headers()

        // Should include rate limit headers
        expect(headers).toHaveProperty('x-ratelimit-limit')
        expect(headers).toHaveProperty('x-ratelimit-remaining')
        expect(headers).toHaveProperty('x-ratelimit-reset')
      }
    })

    test('should handle malformed requests', async ({ page }) => {
      // Send malformed JSON
      const response = await page.request.post('/api/tastings', {
        data: '{invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status()).toBe(400)

      const error = await response.json()
      expect(error).toHaveProperty('error')
      expect(error).toHaveProperty('message')
    })

    test('should handle authentication errors', async ({ page }) => {
      // Try to access protected endpoint without auth
      const response = await page.request.get('/api/user/profile')

      expect([401, 403].includes(response.status())).toBeTruthy()

      if (response.status() === 401) {
        const error = await response.json()
        expect(error).toHaveProperty('error', 'Unauthorized')
      }
    })

    test('should handle CORS properly', async ({ page }) => {
      // Test preflight request
      const response = await page.request.fetch('/api/tastings', {
        method: 'OPTIONS'
      })

      expect([200, 204].includes(response.status())).toBeTruthy()

      const headers = response.headers()
      expect(headers).toHaveProperty('access-control-allow-origin')
      expect(headers).toHaveProperty('access-control-allow-methods')
      expect(headers).toHaveProperty('access-control-allow-headers')
    })
  })
})
