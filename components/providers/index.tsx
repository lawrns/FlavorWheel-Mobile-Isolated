'use client'

import React from 'react'
import { SupabaseProvider } from './supabase-provider'
import { RealtimeProvider } from './realtime-provider'
import { OnboardingProvider } from './onboarding-provider'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { ToastProvider } from '@/hooks/use-toast'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SupabaseProvider>
          <AuthProvider>
            <RealtimeProvider>
              <OnboardingProvider>
                {children}
              </OnboardingProvider>
            </RealtimeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
