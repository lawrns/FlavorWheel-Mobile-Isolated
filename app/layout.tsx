import './globals.css'
import type React from 'react'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { MobileNavigation } from '@/components/ui/mobile-navigation'
import { AuthProvider } from '@/components/auth-provider'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import { RealtimeProvider } from '@/components/providers/realtime-provider'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Flavatix - Discover the Art of Spirits Tasting',
  description: 'Mobile-first tasting experience for discovering authentic flavors',
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''
  const isLandingPage = pathname.includes('/landing')

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#d97706" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flavatix" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <SupabaseProvider>
            <RealtimeProvider>
              <AuthProvider>
                {children}
                {!isLandingPage && (
                  <MobileNavigation
                    activeScreen="home"
                  />
                )}
              </AuthProvider>
            </RealtimeProvider>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
