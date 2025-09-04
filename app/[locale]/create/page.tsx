'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ModeSelection, TastingForm } from '@/components/create'
import { OnboardingOverlay, useOnboarding } from '@/components/ui/onboarding-overlay'

type TastingMode = 'study' | 'competition' | 'quick' | 'mode-selection' | null

interface TastingFormData {
  name: string
  description: string
  type: string
  items: Array<{
    name: string
    type: string
  }>
}

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<TastingMode>('mode-selection')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const { showOnboarding, completeOnboarding, dismissOnboarding } = useOnboarding()
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TastingFormData>({
    name: '',
    description: '',
    type: '',
    items: [{ name: '', type: '' }]
  })
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'

  const handleModeSelect = (mode: TastingMode) => {
    if (mode === 'study') {
      router.push(`/${locale}/create/study`)
    } else if (mode === 'competition') {
      router.push(`/${locale}/create/competition`)
    } else if (mode === 'quick') {
      router.push(`/${locale}/quick-tasting`)
    } else {
      setSelectedMode(mode)
    }
  }

  const handleBackToModes = () => {
    setSelectedMode('mode-selection')
  }

  const updateFormData = (updates: Partial<TastingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateItem = (index: number, updates: Partial<{ name: string; type: string }>) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], ...updates }
    updateFormData({ items: newItems })
  }

  const addItem = () => {
    updateFormData({
      items: [...formData.items, { name: '', type: '' }]
    })
  }

  const handleCreateTasting = async () => {
    // Clear previous validation errors
    setValidationErrors({})

    // Validate form
    const errors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      errors.name = 'Tasting name is required'
    } else if (formData.name.length > 100) {
      errors.name = 'Tasting name is too long (max 100 characters)'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setNetworkError(null)

    try {
      // Simulate API call for tasting creation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate network error for testing
          if (Math.random() < 0.1) { // 10% chance of error for testing
            reject(new Error('Network error'))
          } else {
            resolve(true)
          }
        }, 2000)
      })

      // Show success message briefly, then navigate
      setTimeout(() => {
        // Navigate to the appropriate tasting page based on type
        if (formData.type === 'guided') {
          router.push(`/${locale}/quick-tasting`)
        } else {
          router.push(`/${locale}/tastings/new-tasting-id`)
        }
      }, 1000)
    } catch (error) {
      console.error('Error creating tasting:', error)

      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to create tasting. Please try again.'

      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.'
        } else if (error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please log in and try again.'
        }
      }

      setNetworkError(errorMessage)
      setIsSubmitting(false)
    }
  }


  // Show mode selection only if explicitly requested
  if (selectedMode === 'mode-selection') {
    return (
      <>
        <ModeSelection onModeSelect={handleModeSelect} locale={locale} />
        <OnboardingOverlay
          isVisible={showOnboarding}
          onComplete={completeOnboarding}
          onDismiss={dismissOnboarding}
        />
      </>
    )
  }

  // Show the tasting form
  return (
    <TastingForm
      formData={formData}
      onBackToModes={handleBackToModes}
      onUpdateFormData={updateFormData}
      onUpdateItem={updateItem}
      onAddItem={addItem}
      onCreateTasting={handleCreateTasting}
      isSubmitting={isSubmitting}
      validationErrors={validationErrors}
      networkError={networkError}
      locale={locale}
    />
  )
}
