'use client'

import React from 'react'
import { SupabaseProvider } from './supabase-provider'
import { RealtimeProvider } from './realtime-provider'
import { OnboardingProvider } from './onboarding-provider'
import { AuthProvider } from '@/components/auth-provider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <RealtimeProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </RealtimeProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}
