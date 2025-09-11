'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Star, Camera, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { MobileFlavorSelector } from '@/components/ui/mobile-flavor-selector'
import { useSmartDefaults } from '@/lib/smart-defaults'

interface TastingData {
  productType: string
  productName: string
  selectedFlavors: string[]
  overallRating: number
  notes: string
  image?: string
}

const PRODUCT_TYPES = [
  { value: 'wine', label: 'Wine', emoji: '🍷' },
  { value: 'beer', label: 'Beer', emoji: '🍺' },
  { value: 'spirits', label: 'Spirits', emoji: '🥃' },
  { value: 'coffee', label: 'Coffee', emoji: '☕' },
  { value: 'tea', label: 'Tea', emoji: '🍵' },
  { value: 'other', label: 'Other', emoji: '🥤' },
]

const FLAVOR_CATEGORIES = {
  wine: ['Berry', 'Citrus', 'Oak', 'Vanilla', 'Spice', 'Mineral', 'Floral', 'Herbal'],
  beer: ['Hoppy', 'Malty', 'Citrus', 'Roasted', 'Fruity', 'Spice'],
  spirits: ['Oak', 'Smoke', 'Vanilla', 'Herbal', 'Citrus', 'Caramel'],
  coffee: ['Chocolate', 'Nutty', 'Citrus', 'Floral', 'Caramel', 'Spice'],
  tea: ['Herbal', 'Floral', 'Citrus', 'Sweet', 'Bitter', 'Nutty'],
  other: ['Sweet', 'Sour', 'Bitter', 'Salty', 'Umami', 'Spicy'],
}

export function SimplifiedTastingFlow() {
  const router = useRouter()
  const { user } = useAuth()
  const smartDefaults = useSmartDefaults()
  const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en') || 'en'

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tastingData, setTastingData] = useState<TastingData>({
    productType: '',
    productName: '',
    selectedFlavors: [],
    overallRating: 5,
    notes: '',
  })

  // Initialize with smart defaults
  useEffect(() => {
    const recommendedType = smartDefaults.getRecommendedBeverageType()
    const ratingSuggestion = smartDefaults.getRatingSuggestion(recommendedType)

    setTastingData(prev => {
      const next = {
        ...prev,
        productType: recommendedType,
        overallRating: ratingSuggestion,
      }
      return (prev.productType === next.productType && prev.overallRating === next.overallRating) ? prev : next
    })
  }, [])

  // Update smart suggestions when product type changes
  useEffect(() => {
    if (tastingData.productType) {
      const ratingSuggestion = smartDefaults.getRatingSuggestion(tastingData.productType)
      setTastingData(prev => prev.overallRating === ratingSuggestion ? prev : ({
        ...prev,
        overallRating: ratingSuggestion
      }))
    }
  }, [tastingData.productType])

  const steps = [
    { id: 'product', title: 'What are you tasting?', icon: '🥤' },
    { id: 'flavors', title: 'What flavors do you detect?', icon: '👃' },
    { id: 'rating', title: 'Your overall impression', icon: '⭐' },
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleFlavor = (flavor: string) => {
    setTastingData(prev => ({
      ...prev,
      selectedFlavors: prev.selectedFlavors.includes(flavor)
        ? prev.selectedFlavors.filter(f => f !== flavor)
        : [...prev.selectedFlavors, flavor]
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // Save tasting data and update smart defaults
      const tastingPayload = {
        name: `${tastingData.productName} Tasting`,
        productType: tastingData.productType,
        productName: tastingData.productName,
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: tastingData.overallRating,
        notes: tastingData.notes,
        createdAt: new Date().toISOString(),
        userId: user?.id
      }

      // Save to smart defaults for future recommendations
      smartDefaults.saveTasting(tastingPayload)

      // TODO: Implement actual API call to save tasting
      console.log('Submitting tasting data:', tastingPayload)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Redirect to results or dashboard
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      console.error('Error submitting tasting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Product Selection
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="productType" className="text-lg font-medium mb-4 block">
                Choose your beverage type
              </Label>
              <Select
                value={tastingData.productType}
                onValueChange={(value) => setTastingData(prev => ({ ...prev, productType: value }))}
              >
                <SelectTrigger className="w-full h-14 text-lg">
                  <SelectValue placeholder="Select a beverage type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((type) => {
                    const recommendedType = smartDefaults.getRecommendedBeverageType()
                    const isRecommended = type.value === recommendedType

                    return (
                      <SelectItem key={type.value} value={type.value} className="h-12">
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{type.emoji}</span>
                          <span>{type.label}</span>
                          {isRecommended && (
                            <span className="ml-auto text-xs bg-fx-accent/10 text-fx-accent px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Smart recommendation hint */}
              {(() => {
                const recommendedType = smartDefaults.getRecommendedBeverageType()
                const recommendedLabel = PRODUCT_TYPES.find(t => t.value === recommendedType)?.label
                return recommendedType && recommendedType !== tastingData.productType ? (
                  <div className="mt-3 p-3 bg-fx-accent/5 rounded-lg border border-fx-accent/20">
                    <p className="text-sm text-fx-accent">
                      💡 <strong>Based on your history:</strong> You might enjoy tasting {recommendedLabel?.toLowerCase()}!
                    </p>
                  </div>
                ) : null
              })()}
            </div>

            {tastingData.productType && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Label htmlFor="productName" className="text-lg font-medium">
                  What specific {PRODUCT_TYPES.find(t => t.value === tastingData.productType)?.label.toLowerCase()} is it?
                </Label>
                <Input
                  id="productName"
                  value={tastingData.productName}
                  onChange={(e) => setTastingData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder={`e.g., "Premium Cabernet Sauvignon"`}
                  className="h-14 text-lg"
                />
              </motion.div>
            )}

            <div className="bg-fx-bg-subtle p-4 rounded-lg">
              <p className="text-sm text-fx-text-secondary">
                💡 <strong>Pro tip:</strong> Start with your favorite beverage type to get comfortable with the process.
              </p>
            </div>
          </motion.div>
        )

      case 1: // Flavor Selection
        const availableFlavors = tastingData.productType
          ? FLAVOR_CATEGORIES[tastingData.productType as keyof typeof FLAVOR_CATEGORIES] || FLAVOR_CATEGORIES.other
          : []

        // Get smart flavor suggestions
        const smartSuggestions = smartDefaults.getFlavorSuggestions(
          tastingData.productType,
          tastingData.selectedFlavors
        )

        // Combine available flavors with smart suggestions
        const allFlavorOptions = [...new Set([...availableFlavors, ...smartSuggestions])]

        // Convert flavor names to objects for the mobile selector
        const flavorObjects = allFlavorOptions.map((flavorName, index) => ({
          id: `flavor-${index}`,
          name: flavorName,
          category: smartSuggestions.includes(flavorName) ? 'recommended' : 'general',
          color: smartSuggestions.includes(flavorName) ? '#10B981' : '#8B4513'
        }))

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <MobileFlavorSelector
              flavors={flavorObjects}
              selectedFlavors={tastingData.selectedFlavors}
              onFlavorToggle={(flavorId) => {
                const flavorName = flavorObjects.find(f => f.id === flavorId)?.name
                if (flavorName) {
                  toggleFlavor(flavorName)
                }
              }}
              maxSelection={6}
              title={`Flavors in your ${tastingData.productName || 'beverage'}`}
              subtitle="Select all flavors you can detect - trust your palate!"
            />

            {smartSuggestions.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  💡 <strong>Smart suggestions:</strong> Based on your tasting history and this beverage type,
                  you might also detect: {smartSuggestions.slice(0, 3).join(', ')}
                </p>
              </div>
            )}

            <div className="bg-fx-bg-subtle p-4 rounded-lg">
              <p className="text-sm text-fx-text-secondary">
                💡 <strong>Pro tip:</strong> Take small sips and let the flavors develop on your palate.
                Start with the most prominent flavors you notice.
              </p>
            </div>
          </motion.div>
        )

      case 2: // Rating & Notes
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-lg font-medium mb-4 block">
                Overall Rating
              </Label>
              <div className="space-y-4">
                <Slider
                  value={[tastingData.overallRating]}
                  onValueChange={(value) => setTastingData(prev => ({ ...prev, overallRating: value[0] }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fx-text-secondary">1 - Poor</span>
                  <span className="text-2xl font-bold text-fx-accent">
                    {tastingData.overallRating}/10
                  </span>
                  <span className="text-sm text-fx-text-secondary">10 - Excellent</span>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-lg font-medium mb-2 block">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={tastingData.notes}
                onChange={(e) => setTastingData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any specific observations, pairing suggestions, or memorable characteristics?"
                className="min-h-[100px] text-base"
              />

              {/* Smart note suggestions */}
              {tastingData.productType && (
                <div className="mt-4">
                  <p className="text-sm text-fx-text-secondary mb-2">
                    💡 <strong>Quick notes:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {smartDefaults.getNoteSuggestions(tastingData.productType, tastingData.selectedFlavors).map((note, index) => (
                      <button
                        key={index}
                        onClick={() => setTastingData(prev => ({
                          ...prev,
                          notes: prev.notes ? `${prev.notes}\n• ${note}` : `• ${note}`
                        }))}
                        className="text-xs bg-fx-bg-subtle hover:bg-fx-accent/10 text-fx-text-secondary hover:text-fx-accent px-3 py-1 rounded-full border border-fx-border-default hover:border-fx-accent transition-colors"
                      >
                        + {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-fx-bg-subtle to-fx-accent/5">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Your Tasting Summary:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Product:</strong> {tastingData.productName || 'Not specified'}</p>
                  <p><strong>Flavors:</strong> {tastingData.selectedFlavors.join(', ') || 'None selected'}</p>
                  <p><strong>Rating:</strong> {tastingData.overallRating}/10</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                🎉 <strong>Great job!</strong> You&apos;re about to complete your first simplified tasting.
                Your feedback helps improve our AI recommendations for everyone.
              </p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return tastingData.productType && tastingData.productName.trim()
      case 1:
        return tastingData.selectedFlavors.length > 0
      case 2:
        return true // Always allow completion on final step
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fx-bg to-fx-bg-subtle">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-fx-text-secondary hover:text-fx-text-primary"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-fx-text-primary">Quick Tasting</h1>
            <div className="w-16"></div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-fx-text-primary">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm text-fx-text-secondary">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-fx-accent border-fx-accent text-white'
                    : 'border-fx-border-default text-fx-text-secondary'
                }`}>
                  {index < currentStep ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    index < currentStep ? 'bg-fx-accent' : 'bg-fx-border-default'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-fx-text-primary mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-fx-text-secondary">
            {currentStep === 0 && "Let's start with the basics"}
            {currentStep === 1 && "Trust your palate - select what you taste"}
            {currentStep === 2 && "Share your overall impression"}
          </p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {renderStepContent()}
          </div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 bg-fx-accent hover:bg-fx-accent-hover"
            >
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  Complete Tasting
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
