/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'kobuclkvlacdwvxmakvq.supabase.co'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_NAME: 'FlavorWheel',
    NEXT_PUBLIC_APP_DESCRIPTION: 'World\'s most user-friendly tasting experience',
  },
}

module.exports = nextConfig
