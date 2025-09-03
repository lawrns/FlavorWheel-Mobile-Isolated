import './globals.css'
import type React from 'react'
import { Inter } from 'next/font/google'
// Core Providers and Components - Restored for production
import { ErrorBoundary } from '@/components/error-boundary'
import { Providers } from '@/components/providers'
import { ServiceWorkerProvider } from '@/components/service-worker-provider'
import { IconPreloader } from '@/components/icon-preloader'
import { SkipNavigation } from '@/components/ui/skip-to-content'

export const metadata = {
  title: 'Flavatix - Discover the Art of Spirits Tasting',
  description: 'Mobile-first tasting experience for discovering authentic flavors',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <head>
        {/* PWA and Mobile Optimization Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flavatix" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#d97706" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" sizes="192x192" />
        <link rel="icon" href="/favicon.ico" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href="//kobuclkvlacdwvxmakvq.supabase.co" />
      </head>
      <body className={`${inter.className} touch-manipulation antialiased`}>
        <ErrorBoundary>
          <Providers>
            <ServiceWorkerProvider>
              <IconPreloader>
                <SkipNavigation>
                  <main id="main-content" className="min-h-screen" data-testid="app-ready">
                    {children}
                  </main>
                </SkipNavigation>
              </IconPreloader>
            </ServiceWorkerProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
