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
  webpack: (config, { isServer }) => {
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

  // Headers for security
  async headers() {
    return [
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
        ],
      },
    ]
  },
}

module.exports = nextConfig
