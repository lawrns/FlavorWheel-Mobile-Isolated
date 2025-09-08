import type React from 'react'
import { SupabaseProvider } from '@/components/providers/supabase-provider'
import { AuthProvider } from '@/components/auth-provider'
import { ToastProvider } from '@/hooks/use-toast'

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <ToastProvider>
        <div>
          {/* Skip Links for Accessibility */}
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-40 focus:top-4"
          >
            Skip to navigation
          </a>

          <main id="main-content" role="main">
            {children}
          </main>
        </div>
      </ToastProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}
