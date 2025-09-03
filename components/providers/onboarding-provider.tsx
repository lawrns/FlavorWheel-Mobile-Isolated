'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabase } from './supabase-provider'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target?: string // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: () => void
  required?: boolean
}

interface OnboardingContextType {
  currentStep: number
  steps: OnboardingStep[]
  isActive: boolean
  isCompleted: boolean
  startTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  showTooltip: boolean
  currentTooltipStep: OnboardingStep | null
  highlightElement: (selector: string) => void
  clearHighlight: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FlavorWheel',
    description: 'Discover the world of Mexican spirits through expert tasting experiences.',
    position: 'center',
    required: true
  },
  {
    id: 'navigation',
    title: 'Explore the App',
    description: 'Use the navigation to discover tasting sessions, reviews, and connect with the community.',
    target: '#mobile-navigation',
    position: 'top'
  },
  {
    id: 'quick-tasting',
    title: 'Start Your First Tasting',
    description: 'Begin with a quick tasting to experience the art of flavor analysis.',
    target: '[data-nav-item="create"]',
    position: 'top'
  },
  {
    id: 'social-community',
    title: 'Join the Community',
    description: 'Connect with fellow enthusiasts, share reviews, and learn from experts.',
    target: '[data-nav-item="social"]',
    position: 'top'
  },
  {
    id: 'flavor-wheels',
    title: 'Explore Flavor Wheels',
    description: 'Dive deep into flavor analysis with interactive wheel visualizations.',
    target: '[data-nav-item="flavor-wheels"]',
    position: 'top'
  },
  {
    id: 'reviews',
    title: 'Read Expert Reviews',
    description: 'Learn from detailed tasting notes and professional reviews.',
    target: '[data-nav-item="review"]',
    position: 'top'
  },
  {
    id: 'create-account',
    title: 'Save Your Progress',
    description: 'Create an account to save tastings, write reviews, and join the community.',
    position: 'center'
  }
]

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null)

  const { user } = useSupabase()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding-completed')
    if (completed === 'true') {
      setIsCompleted(true)
    } else if (user && !isCompleted) {
      // Auto-start onboarding for new users after a brief delay
      setTimeout(() => startTour(), 2000)
    }
  }, [user, isCompleted])

  useEffect(() => {
    if (isActive && currentStep > 0) {
      const step = ONBOARDING_STEPS[currentStep]
      if (step.target) {
        highlightElement(step.target)
        setShowTooltip(true)
      }
    }
  }, [currentStep, isActive])

  const startTour = () => {
    setCurrentStep(0)
    setIsActive(true)
    setShowTooltip(true)
  }

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      clearHighlight()
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      clearHighlight()
    }
  }

  const skipTour = () => {
    setIsActive(false)
    setShowTooltip(false)
    clearHighlight()
    localStorage.setItem('onboarding-completed', 'true')
    setIsCompleted(true)
  }

  const completeTour = () => {
    setIsActive(false)
    setShowTooltip(false)
    clearHighlight()
    localStorage.setItem('onboarding-completed', 'true')
    setIsCompleted(true)
  }

  const highlightElement = (selector: string) => {
    const element = document.querySelector(selector)
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Add highlight class
      element.classList.add('onboarding-highlight')

      // Add pulsing animation
      element.classList.add('animate-pulse')
    }
  }

  const clearHighlight = () => {
    if (highlightedElement) {
      highlightedElement.classList.remove('onboarding-highlight', 'animate-pulse')
      setHighlightedElement(null)
    }
  }

  const value: OnboardingContextType = {
    currentStep,
    steps: ONBOARDING_STEPS,
    isActive,
    isCompleted,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    showTooltip,
    currentTooltipStep: isActive ? ONBOARDING_STEPS[currentStep] : null,
    highlightElement,
    clearHighlight
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
