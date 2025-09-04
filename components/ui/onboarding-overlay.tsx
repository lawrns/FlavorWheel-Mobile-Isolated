'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from './button'

interface OnboardingStep {
  title: string
  description: string
  content: React.ReactNode
  action?: string
}

interface OnboardingOverlayProps {
  isVisible: boolean
  onComplete: () => void
  onDismiss: () => void
}

export function OnboardingOverlay({ isVisible, onComplete, onDismiss }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: OnboardingStep[] = [
    {
      title: "Welcome to FlavorWheel! 🎉",
      description: "Your journey to becoming a tasting expert starts here",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-lg text-muted-foreground">
            Discover the art of spirits tasting with our AI-powered platform.
            We'll guide you through creating your first tasting experience.
          </p>
        </div>
      ),
      action: "Let's get started!"
    },
    {
      title: "Choose Your Tasting Mode",
      description: "Select the perfect experience for your tasting journey",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-1">📚 Study Mode</h4>
              <p className="text-sm text-purple-700">Perfect for learning with AI insights</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-1">🏆 Competition Mode</h4>
              <p className="text-sm text-yellow-700">Structured evaluation with rankings</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">⚡ Quick Tasting</h4>
              <p className="text-sm text-blue-700">Fast and simple evaluation</p>
            </div>
          </div>
        </div>
      ),
      action: "I understand"
    },
    {
      title: "Ready to Create Your First Tasting?",
      description: "Let's set up your tasting experience together",
      content: (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <ChevronRight className="h-6 w-6 text-white" />
          </div>
          <p className="text-muted-foreground">
            We'll help you create your first tasting session step by step.
            Don't worry - you can always go back and make changes!
          </p>
        </div>
      ),
      action: "Create My First Tasting"
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex-1" />
            <button
              onClick={onDismiss}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Close onboarding"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 pt-2">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>

            <div className="min-h-[200px] flex items-center justify-center">
              {steps[currentStep].content}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onDismiss}
              className="flex-1"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {steps[currentStep].action || 'Continue'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('flavorwheel-onboarding-seen')
    if (!seen) {
      setShowOnboarding(true)
    } else {
      setHasSeenOnboarding(true)
    }
  }, [])

  const completeOnboarding = () => {
    setShowOnboarding(false)
    setHasSeenOnboarding(true)
    localStorage.setItem('flavorwheel-onboarding-seen', 'true')
  }

  const dismissOnboarding = () => {
    setShowOnboarding(false)
    setHasSeenOnboarding(true)
    localStorage.setItem('flavorwheel-onboarding-seen', 'true')
  }

  const resetOnboarding = () => {
    setShowOnboarding(true)
    setHasSeenOnboarding(false)
    localStorage.removeItem('flavorwheel-onboarding-seen')
  }

  return {
    hasSeenOnboarding,
    showOnboarding,
    completeOnboarding,
    dismissOnboarding,
    resetOnboarding
  }
}
