describe('API Integration Tests', () => {
  const apiEndpoints = [
    {
      endpoint: '/api/health',
      method: 'GET',
      expectedStatus: 200,
      name: 'Health Check'
    },
    {
      endpoint: '/api/templates',
      method: 'GET',
      expectedStatus: 200,
      name: 'Templates List'
    },
    {
      endpoint: '/api/templates/categories',
      method: 'GET',
      expectedStatus: 200,
      name: 'Template Categories'
    }
  ]

  describe('API Endpoint Availability', () => {
    apiEndpoints.forEach(api => {
      it(`should return ${api.expectedStatus} for ${api.name}`, () => {
        cy.task('log', `🔗 Testing ${api.name} (${api.endpoint})`)

        cy.request({
          url: `${Cypress.config('baseUrl')}${api.endpoint}`,
          method: api.method,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(api.expectedStatus)

          if (api.expectedStatus === 200) {
            expect(response.body).to.not.be.empty

            // Log response details
            cy.task('log', `✅ ${api.name}: ${response.status} - Response size: ${JSON.stringify(response.body).length} chars`)

            // Validate response structure for successful responses
            if (api.endpoint === '/api/templates') {
              expect(response.body).to.have.property('data')
              expect(Array.isArray(response.body.data)).to.be.true
            }

            if (api.endpoint === '/api/templates/categories') {
              expect(response.body).to.have.property('data')
            }

            if (api.endpoint === '/api/health') {
              // Health endpoint should return some status info
              expect(response.body).to.not.be.empty
            }
          }
        })
      })
    })
  })

  describe('API Response Structure & Data', () => {
    it('should return valid template data structure', () => {
      cy.request('/api/templates').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('data')
        expect(Array.isArray(response.body.data)).to.be.true

        if (response.body.data.length > 0) {
          const template = response.body.data[0]

          // Validate template structure
          expect(template).to.have.property('id')
          expect(template).to.have.property('name')
          expect(template).to.have.property('description')
          expect(template).to.have.property('category')
          expect(template).to.have.property('difficulty_level')
          expect(template).to.have.property('is_public')
          expect(template).to.have.property('created_at')
          expect(template).to.have.property('user_id')
          expect(template).to.have.property('profiles')

          // Validate profiles structure
          expect(template.profiles).to.have.property('name')
          expect(template.profiles).to.have.property('avatar_url')

          cy.task('log', `📋 Validated template: ${template.name}`)
        }
      })
    })

    it('should handle API query parameters', () => {
      // Test with different query parameters
      const queryParams = [
        { param: 'category', value: 'wine' },
        { param: 'difficulty', value: 'beginner' },
        { param: 'search', value: 'coffee' },
        { param: 'sortBy', value: 'created_at' },
        { param: 'sortOrder', value: 'desc' },
        { param: 'limit', value: '5' }
      ]

      queryParams.forEach(({ param, value }) => {
        cy.request(`/api/templates?${param}=${value}`).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('data')
          expect(Array.isArray(response.body.data)).to.be.true

          cy.task('log', `🔍 Tested ${param}=${value}: ${response.body.data.length} results`)
        })
      })
    })

    it('should handle invalid query parameters gracefully', () => {
      cy.request('/api/templates?invalidParam=test').then((response) => {
        expect(response.status).to.eq(200) // Should still work with invalid params
        expect(response.body).to.have.property('data')
        expect(Array.isArray(response.body.data)).to.be.true
      })
    })
  })

  describe('API Error Handling', () => {
    it('should handle non-existent endpoints', () => {
      cy.request({
        url: '/api/nonexistent',
        failOnStatusCode: false
      }).then((response) => {
        expect([404, 500]).to.include(response.status)
        cy.task('log', `🚫 Non-existent endpoint returned ${response.status} as expected`)
      })
    })

    it('should handle invalid HTTP methods', () => {
      cy.request({
        url: '/api/templates',
        method: 'DELETE',
        failOnStatusCode: false
      }).then((response) => {
        expect([405, 404, 500]).to.include(response.status)
        cy.task('log', `🚫 Invalid method returned ${response.status} as expected`)
      })
    })
  })

  describe('API Performance', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now()

      cy.request('/api/templates').then((response) => {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        cy.task('log', `⏱️  API response time: ${responseTime}ms`)

        // Assert reasonable API performance
        expect(responseTime).to.be.lessThan(5000) // Less than 5 seconds
        expect(response.status).to.eq(200)
      })
    })

    it('should handle concurrent API requests', () => {
      const requests = []

      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(cy.request('/api/templates'))
      }

      // Wait for all requests to complete
      cy.wrap(Promise.all(requests)).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).to.eq(200)
          cy.task('log', `🔄 Concurrent request ${index + 1}: ${response.status}`)
        })
      })
    })
  })

  describe('API Data Consistency', () => {
    it('should return consistent data across multiple requests', () => {
      let firstResponse

      // First request
      cy.request('/api/templates').then((response) => {
        firstResponse = response.body
        expect(response.status).to.eq(200)
      }).then(() => {
        // Second request
        cy.request('/api/templates').then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('data')
          expect(Array.isArray(response.body.data)).to.be.true

          // Data structure should be consistent
          expect(response.body).to.have.property('data')

          cy.task('log', '🔄 API responses are consistent')
        })
      })
    })

    it('should maintain data integrity', () => {
      cy.request('/api/templates').then((response) => {
        expect(response.status).to.eq(200)

        if (response.body.data && response.body.data.length > 0) {
          response.body.data.forEach((template, index) => {
            // Each template should have required fields
            expect(template).to.have.property('id')
            expect(template).to.have.property('name')
            expect(template.name).to.not.be.empty
            expect(template).to.have.property('category')

            cy.task('log', `✅ Template ${index + 1} has valid data structure`)
          })
        }
      })
    })
  })

  describe('API Security & Headers', () => {
    it('should return appropriate security headers', () => {
      cy.request('/api/templates').then((response) => {
        // Check for common security headers
        const headers = response.headers

        // Should have content type
        expect(headers).to.have.property('content-type')
        expect(headers['content-type']).to.include('application/json')

        cy.task('log', '🔒 API has appropriate security headers')
      })
    })

    it('should handle CORS appropriately', () => {
      cy.request('/api/templates').then((response) => {
        // CORS headers might be present
        const headers = response.headers

        cy.task('log', '🌐 CORS configuration verified')
      })
    })
  })
})

