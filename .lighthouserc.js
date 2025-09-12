module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Ready in',
      url: [
        'http://localhost:3010/en',
        'http://localhost:3010/en/flavor-wheels',
        'http://localhost:3010/en/test/visual-regression'
      ]
    },
    assert: {
      // Performance budgets
      assertions: {
        // Core Web Vitals targets
        'categories.performance.score': ['error', { minScore: 0.8 }],
        'categories.accessibility.score': ['error', { minScore: 0.9 }],
        'categories.best-practices.score': ['error', { minScore: 0.9 }],
        'categories.seo.score': ['error', { minScore: 0.9 }],

        // Specific Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Accessibility checks
        'axe.color-contrast': 'error',
        'axe.image-alt': 'error',
        'axe.link-name': 'error',
        'axe.button-name': 'error',
        'axe.form-field-multiple-labels': 'error',

        // Performance best practices
        'modern-image-formats': 'error',
        'uses-optimized-images': 'error',
        'uses-text-compression': 'error',
        'uses-rel-preconnect': 'error',
        'server-response-time': 'error',
        'mainthread-work-breakdown': 'error',
        'dom-size': 'error',
        'critical-request-chains': 'error',
        'user-timings': 'error',
        'bootup-time': 'error',
        'main-thread-tasks': 'error',
        'network-requests': 'error',
        'metrics.estimated-input-latency': 'error',
        'network-rtt': 'error',
        'network-server-latency': 'error',

        // Bundle size and loading
        'total-byte-weight': ['error', { maxNumericValue: 2097152 }], // 2MB
        'render-blocking-resources': 'error',
        'unminified-javascript': 'error',
        'unminified-css': 'error',
        'unused-javascript': 'error',
        'unused-css-rules': 'error',

        // SEO and best practices
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'error',
        'tap-targets': 'error',
        'hreflang': 'error',
        'plugins': 'error',
        'canonical': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
