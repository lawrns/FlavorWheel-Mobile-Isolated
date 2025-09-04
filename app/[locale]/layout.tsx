import type React from 'react'
import { Providers } from '@/components/providers'
import { OnboardingWrapper } from '@/components/ui/onboarding-wrapper'
import { ToastProvider } from '@/hooks/use-toast'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Providers>
      <ToastProvider>
        <OnboardingWrapper>
          {/* Skip Links for Accessibility */}
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Saltar al contenido principal
          </a>
          <a
            href="#navigation"
            className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-40 focus:top-4"
          >
            Saltar a navegación
          </a>

          <main id="main-content" role="main">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </OnboardingWrapper>
      </ToastProvider>
    </Providers>
  )
}
