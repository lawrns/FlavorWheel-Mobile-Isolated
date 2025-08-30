import './globals.css'
import type React from 'react'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { MobileNavigation } from '@/components/ui/mobile-navigation'

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
          {children}
          <MobileNavigation
            activeScreen="home"
          />
        </ErrorBoundary>
      </body>
    </html>
  )
}
