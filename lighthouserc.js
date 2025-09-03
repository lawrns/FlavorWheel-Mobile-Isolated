module.exports = {
  ci: {
    collect: {
      // Collect Lighthouse reports for these pages
      url: [
        'http://localhost:3001/',
        'http://localhost:3001/create',
        'http://localhost:3001/tastings',
        'http://localhost:3001/flavor-wheels',
        'http://localhost:3001/profile',
        'http://localhost:3001/analytics'
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready - started server on',
      settings: {
        // Lighthouse settings for comprehensive testing
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'pwa'
        ],
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Performance assertions
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],

        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // Performance metrics
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3500 }],

        // Bundle size assertions
        'total-byte-weight': ['error', { maxNumericValue: 2048000 }], // 2MB
        'mainthread-work-breakdown': ['error', { maxNumericValue: 2000 }],

        // Accessibility assertions
        'axe:aria-allowed-role': 'error',
        'axe:aria-hidden-focus': 'error',
        'axe:color-contrast': 'error',
        'axe:duplicate-id': 'error',
        'axe:heading-order': 'error',
        'axe:html-has-lang': 'error',
        'axe:image-alt': 'error',
        'axe:link-name': 'error',
        'axe:list': 'error',
        'axe:listitem': 'error',

        // SEO assertions
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'error',

        // Best practices
        'errors-in-console': 'error',
        'image-aspect-ratio': 'error',
        'image-size-responsive': 'error',
        'preload-fonts': 'error',
        'unsized-images': 'error',
        'valid-source-maps': 'error'
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: './test-results/lighthouse',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%'
    }
  }
}
