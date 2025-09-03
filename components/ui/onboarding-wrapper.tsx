'use client'

import React, { useState, useEffect } from 'react'
import { OnboardingTooltip } from './onboarding-tooltip'
import { WelcomeModal } from './welcome-modal'
import { useOnboarding } from '@/components/providers/onboarding-provider'
import { useSupabase } from '@/components/providers/supabase-provider'

interface OnboardingWrapperProps {
  children: React.ReactNode
}

export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const { user } = useSupabase()
  const { isActive, showTooltip, currentTooltipStep } = useOnboarding()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    // Show welcome modal for new users
    if (user && !localStorage.getItem('onboarding-completed') && !isActive) {
      // Delay to ensure everything is loaded
      setTimeout(() => setShowWelcome(true), 1500)
    }
  }, [user, isActive])

  return (
    <>
      {children}

      {/* Welcome Modal for new users */}
      {showWelcome && (
        <WelcomeModal onClose={() => setShowWelcome(false)} />
      )}

      {/* Onboarding Tooltip */}
      {showTooltip && currentTooltipStep && <OnboardingTooltip />}
    </>
  )
}
