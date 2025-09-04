import './globals.css'
import type React from 'react'
import { Inter } from 'next/font/google'

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
