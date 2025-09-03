import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')
const responseTime = new Trend('response_time')

// Test configuration
export const options = {
  stages: [
    // Ramp up to 100 users over 2 minutes
    { duration: '2m', target: 100 },

    // Stay at 100 users for 5 minutes
    { duration: '5m', target: 100 },

    // Ramp up to 500 users over 3 minutes
    { duration: '3m', target: 500 },

    // Stay at 500 users for 5 minutes
    { duration: '5m', target: 500 },

    // Ramp up to 1000 users over 2 minutes
    { duration: '2m', target: 1000 },

    // Stay at 1000 users for 5 minutes
    { duration: '5m', target: 1000 },

    // Ramp down to 0 users over 2 minutes
    { duration: '2m', target: 0 }
  ],

  thresholds: {
    // 95% of requests should be below 500ms
    http_req_duration: ['p(95)<500'],

    // Error rate should be below 1%
    errors: ['rate<0.01'],

    // 99% of requests should succeed
    http_req_failed: ['rate<0.01']
  },

  // Cloud configuration
  ext: {
    loadimpact: {
      projectID: __ENV.K6_PROJECT_ID || 123456,
      name: 'FlavorWheel Load Test'
    }
  }
}

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001'

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'test3@example.com', password: 'password123' },
  { email: 'test4@example.com', password: 'password123' },
  { email: 'test5@example.com', password: 'password123' }
]

const tastingData = {
  name: 'Load Test Tasting',
  description: 'Performance testing tasting session',
  type: 'guided',
  categories: [
    { name: 'Aroma', parameterType: 'subjective_input' },
    { name: 'Flavor', parameterType: 'subjective_input' }
  ],
  items: [
    { name: 'Test Tequila 1' },
    { name: 'Test Tequila 2' },
    { name: 'Test Mezcal 1' }
  ]
}

export default function () {
  // Simulate user behavior patterns
  const userIndex = Math.floor(Math.random() * testUsers.length)
  const user = testUsers[userIndex]

  // Authentication
  const authResponse = http.post(`${BASE_URL}/api/auth/login`, {
    email: user.email,
    password: user.password
  })

  check(authResponse, {
    'login successful': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500
  }) || errorRate.add(1)

  const authToken = authResponse.json()?.token

  // Set authorization header for subsequent requests
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }

  // User behavior simulation
  const behavior = Math.random()

  if (behavior < 0.3) {
    // 30% - Browse tastings
    browseTastings(headers)
  } else if (behavior < 0.5) {
    // 20% - Create tasting
    createTasting(headers)
  } else if (behavior < 0.7) {
    // 20% - View flavor wheel
    viewFlavorWheel(headers)
  } else if (behavior < 0.85) {
    // 15% - Social interactions
    socialInteractions(headers)
  } else {
    // 15% - Analytics and profile
    viewAnalytics(headers)
  }

  // Random sleep between 1-5 seconds to simulate real user behavior
  sleep(Math.random() * 4 + 1)
}

function browseTastings(headers) {
  const response = http.get(`${BASE_URL}/api/tastings`, { headers })

  check(response, {
    'tastings list loads successfully': (r) => r.status === 200,
    'tastings response time < 300ms': (r) => r.timings.duration < 300,
    'tastings has valid structure': (r) => {
      const data = r.json()
      return Array.isArray(data) && data.length >= 0
    }
  }) || errorRate.add(1)

  responseTime.add(response.timings.duration)

  // Simulate viewing individual tasting details
  if (response.status === 200) {
    const tastings = response.json()
    if (tastings.length > 0) {
      const randomTasting = tastings[Math.floor(Math.random() * tastings.length)]
      const detailResponse = http.get(`${BASE_URL}/api/tastings/${randomTasting.id}`, { headers })

      check(detailResponse, {
        'tasting detail loads successfully': (r) => r.status === 200,
        'tasting detail response time < 200ms': (r) => r.timings.duration < 200
      }) || errorRate.add(1)

      responseTime.add(detailResponse.timings.duration)
    }
  }
}

function createTasting(headers) {
  const response = http.post(`${BASE_URL}/api/tastings`, JSON.stringify(tastingData), { headers })

  check(response, {
    'tasting creation successful': (r) => r.status === 201,
    'tasting creation response time < 1000ms': (r) => r.timings.duration < 1000
  }) || errorRate.add(1)

  responseTime.add(response.timings.duration)

  if (response.status === 201) {
    const createdTasting = response.json()

    // Simulate completing the tasting
    sleep(2) // Simulate user thinking time

    const completionData = {
      notes: {
        aroma: 'citrus, floral, agave',
        taste: 'sweet, vanilla, oak'
      },
      ratings: {
        overall: 8
      }
    }

    const completeResponse = http.put(
      `${BASE_URL}/api/tastings/${createdTasting.id}/complete`,
      JSON.stringify(completionData),
      { headers }
    )

    check(completeResponse, {
      'tasting completion successful': (r) => r.status === 200,
      'tasting completion response time < 800ms': (r) => r.timings.duration < 800
    }) || errorRate.add(1)

    responseTime.add(completeResponse.timings.duration)
  }
}

function viewFlavorWheel(headers) {
  // Get user's tastings first
  const tastingsResponse = http.get(`${BASE_URL}/api/tastings?limit=10`, { headers })

  if (tastingsResponse.status === 200) {
    const tastings = tastingsResponse.json()

    if (tastings.length > 0) {
      // Generate flavor wheel for a random tasting
      const randomTasting = tastings[Math.floor(Math.random() * tastings.length)]

      const wheelResponse = http.get(
        `${BASE_URL}/api/tastings/${randomTasting.id}/flavor-wheel`,
        { headers }
      )

      check(wheelResponse, {
        'flavor wheel generation successful': (r) => r.status === 200,
        'flavor wheel response time < 1500ms': (r) => r.timings.duration < 1500,
        'flavor wheel has valid data': (r) => {
          const data = r.json()
          return data && typeof data === 'object'
        }
      }) || errorRate.add(1)

      responseTime.add(wheelResponse.timings.duration)
    }
  }
}

function socialInteractions(headers) {
  // Get social feed
  const feedResponse = http.get(`${BASE_URL}/api/social/feed`, { headers })

  check(feedResponse, {
    'social feed loads successfully': (r) => r.status === 200,
    'social feed response time < 400ms': (r) => r.timings.duration < 400
  }) || errorRate.add(1)

  responseTime.add(feedResponse.timings.duration)

  // Simulate liking a post (if feed has content)
  if (feedResponse.status === 200) {
    const feed = feedResponse.json()
    if (feed.length > 0) {
      const randomPost = feed[Math.floor(Math.random() * feed.length)]

      const likeResponse = http.post(
        `${BASE_URL}/api/social/posts/${randomPost.id}/like`,
        {},
        { headers }
      )

      check(likeResponse, {
        'like action successful': (r) => r.status === 200 || r.status === 201,
        'like response time < 300ms': (r) => r.timings.duration < 300
      }) || errorRate.add(1)

      responseTime.add(likeResponse.timings.duration)
    }
  }
}

function viewAnalytics(headers) {
  const analyticsResponse = http.get(`${BASE_URL}/api/analytics/user`, { headers })

  check(analyticsResponse, {
    'analytics load successfully': (r) => r.status === 200,
    'analytics response time < 600ms': (r) => r.timings.duration < 600,
    'analytics has valid metrics': (r) => {
      const data = r.json()
      return data && typeof data === 'object' &&
             typeof data.totalTastings === 'number'
    }
  }) || errorRate.add(1)

  responseTime.add(analyticsResponse.timings.duration)
}

// Setup function - runs before the test starts
export function setup() {
  console.log('🚀 Starting FlavorWheel load test...')

  // Create test users if they don't exist
  const setupResponse = http.post(`${BASE_URL}/api/test/setup-users`, {
    users: testUsers
  })

  if (setupResponse.status !== 200) {
    console.warn('⚠️  Test users setup may have failed')
  }

  return { users: testUsers }
}

// Teardown function - runs after the test completes
export function teardown(data) {
  console.log('✅ Load test completed')

  // Cleanup test data
  const cleanupResponse = http.post(`${BASE_URL}/api/test/cleanup`, {
    users: data.users
  })

  if (cleanupResponse.status !== 200) {
    console.warn('⚠️  Test cleanup may have failed')
  }
}

// Handle summary - custom summary export
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'test-results/load/summary.json': JSON.stringify(data, null, 2),
    'test-results/load/report.html': htmlReport(data),
  }
}

function textSummary(data, options) {
  return `
📊 FlavorWheel Load Test Summary
================================

Test Duration: ${data.metrics.duration.values.avg}ms
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%

Response Times:
- Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
- 95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
- 99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms

Error Rate: ${(data.metrics.errors?.values.rate || 0) * 100}%

Virtual Users: ${data.metrics.vus.values.max}

📈 Key Metrics:
- Tastings API: ${data.metrics.http_req_duration.values.avg}ms avg response
- Flavor Wheel Generation: ${data.metrics.http_req_duration.values.avg}ms avg response
- Authentication: ${data.metrics.http_req_duration.values.avg}ms avg response
`
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>FlavorWheel Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { border-left: 5px solid #28a745; }
        .warning { border-left: 5px solid #ffc107; }
        .error { border-left: 5px solid #dc3545; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 FlavorWheel Load Test Report</h1>

    <div class="metric success">
        <h2>Test Overview</h2>
        <p><strong>Duration:</strong> ${Math.round(data.metrics.duration.values.avg / 1000)}s</p>
        <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}</p>
        <p><strong>Virtual Users:</strong> ${data.metrics.vus.values.max}</p>
    </div>

    <div class="metric ${data.metrics.http_req_failed.values.rate < 0.01 ? 'success' : 'error'}">
        <h2>Performance Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
            <tr>
                <td>Average Response Time</td>
                <td>${Math.round(data.metrics.http_req_duration.values.avg)}ms</td>
                <td>&lt; 500ms</td>
                <td>${data.metrics.http_req_duration.values.avg < 500 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms</td>
                <td>&lt; 500ms</td>
                <td>${data.metrics.http_req_duration.values['p(95)'] < 500 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>Error Rate</td>
                <td>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</td>
                <td>&lt; 1%</td>
                <td>${data.metrics.http_req_failed.values.rate < 0.01 ? '✅' : '❌'}</td>
            </tr>
        </table>
    </div>

    <div class="metric">
        <h2>Response Time Distribution</h2>
        <canvas id="responseTimeChart" width="800" height="400"></canvas>
    </div>

    <script>
        // Simple chart visualization
        const canvas = document.getElementById('responseTimeChart');
        const ctx = canvas.getContext('2d');

        // Draw simple bar chart
        const metrics = ${JSON.stringify(data.metrics)};
        // Chart drawing logic would go here
    </script>
</body>
</html>
`
}
