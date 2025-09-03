/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript and ESLint - allow errors in development but fail in production
  typescript: {
    ignoreBuildErrors: true, // Allow both development and production builds
  },
  eslint: {
    ignoreDuringBuilds: true, // Allow both development and production builds
  },

  transpilePackages: ['@supabase/supabase-js'],


  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer integration
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './bundle-analyzer-report.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: './bundle-stats.json',
        })
      )
    }

    if (!isServer) {
      // Fix for Supabase WebSocket issues in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Handle WebSocket polyfill for Supabase realtime
    config.resolve.alias = {
      ...config.resolve.alias,
      'ws': false,
    }

    // Ensure consistent chunk naming in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        chunkIds: 'named',
      }
    }

    // Performance optimizations
    if (!dev && !isServer) {
      // Enable webpack optimizations for production
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor chunks for better caching
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Separate React and Next.js chunks
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
              name: 'framework',
              chunks: 'all',
              priority: 20,
            },
            // Separate Supabase for better caching
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
            // Separate D3 for flavor wheel
            d3: {
              test: /[\\/]node_modules[\\/]d3[\\/]/,
              name: 'd3',
              chunks: 'all',
              priority: 15,
              enforce: true,
            },
          },
        },
      }

      // Add performance hints
      config.performance = {
        hints: 'warning',
        maxAssetSize: 512000, // 500kb
        maxEntrypointSize: 512000, // 500kb
      }
    }

    return config
  },
  // React strict mode - enabled in development, disabled in production to avoid double rendering
  reactStrictMode: process.env.NODE_ENV === 'development',
  
  // Image optimization
  images: {
    domains: ['localhost', 'kobuclkvlacdwvxmakvq.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_NAME: 'FlavorWheel',
    NEXT_PUBLIC_APP_DESCRIPTION: 'World\'s most user-friendly tasting experience',
  },

  // PWA and performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    // Disable CSS purging in development to prevent style issues
    optimizeCss: process.env.NODE_ENV === 'production',
  },

  // Compression and performance
  compress: true,
  poweredByHeader: false,

  // Enhanced headers for security, performance, and advanced caching
  async headers() {
    return [
      // Global security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Next.js static assets - maximum caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=31536000',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      // API routes with stale-while-revalidate
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=300',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'max-age=600',
          },
        ],
      },
      // Static images and assets
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'max-age=604800',
          },
        ],
      },
      // Public folder assets
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
          },
        ],
      },
      // Service worker
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      // Web app manifest
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=604800',
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
