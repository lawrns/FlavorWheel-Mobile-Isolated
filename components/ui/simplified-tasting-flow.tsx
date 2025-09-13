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
import { useSmartDefaults } from '@/lib/smart-defaults'
import { createQuickTasting } from '@/services/quick-tasting-service'
import { useToast } from '@/hooks/use-toast'

import type {
  QuickTastingData,
  ProductType,
  TastingStep
} from '@/types/quick-tasting'
import { PRODUCT_TYPE_OPTIONS, TASTING_STEPS } from '@/types/quick-tasting'

// Product types and flavor categories are now imported from unified types

export function SimplifiedTastingFlow() {
  const router = useRouter()
  const { user } = useAuth()
  const smartDefaults = useSmartDefaults()
  const { toast } = useToast()
  const locale = (typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en') || 'en'

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tastingData, setTastingData] = useState<QuickTastingData>({
    productType: 'other',
    productName: '',
    selectedFlavors: [],
    overallRating: 5,
    overallScore: 50,
    aroma: '',
    flavor: '',
    other: '',
    notes: '',
  })

  // Initialize with smart defaults
  useEffect(() => {
    const recommendedType = smartDefaults.getRecommendedBeverageType() as ProductType
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

  const steps = TASTING_STEPS

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

  const getProductPlaceholder = (productType: ProductType): string => {
    const placeholders = {
      wine: 'Premium Cabernet Sauvignon',
      beer: 'Craft IPA',
      spirits: 'Single Malt Whiskey',
      coffee: 'Ethiopian Single Origin',
      tea: 'Earl Grey Premium',
      other: 'Your favorite beverage'
    }
    return `e.g., "${placeholders[productType] || placeholders.other}"`
  }

  const handleSubmit = async (navigateAfter: boolean = true) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your tasting.",
        variant: "destructive",
      })
      router.push('/login')
      return
    }

    // Validate required fields
    if (!tastingData.productType || !tastingData.productName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both product type and name.",
        variant: "destructive",
      })
      return
    }

    const hasSelectedFlavors = Array.isArray(tastingData.selectedFlavors) && tastingData.selectedFlavors.length > 0
    const hasNoteBased = Boolean(tastingData.aroma?.trim() || tastingData.flavor?.trim())
    if (!hasSelectedFlavors && !hasNoteBased) {
      toast({
        title: "Add Notes",
        description: "Please provide aroma or flavor notes (or selected flavors).",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare tasting data for API
      const mappedRating = typeof tastingData.overallScore === 'number'
        ? Math.max(1, Math.min(10, Math.round((tastingData.overallScore as number) / 10)))
        : tastingData.overallRating
      const tastingPayload = {
        productType: tastingData.productType,
        productName: tastingData.productName.trim(),
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: mappedRating,
        overallScore: tastingData.overallScore,
        aroma: tastingData.aroma,
        flavor: tastingData.flavor,
        other: tastingData.other,
        notes: tastingData.notes.trim(),
        image: tastingData.image
      }

      // Show loading toast
      toast({
        title: "Saving your tasting...",
        description: "Please wait while we process your tasting notes.",
        variant: "default",
      })

      // Save tasting data via API with retry logic
      let result: any
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          result = await createQuickTasting(tastingPayload)
          break // Success, exit retry loop
        } catch (error: any) {
          if (retryCount < maxRetries && (error.code === 'NETWORK_ERROR' || error.message?.includes('network'))) {
            retryCount++
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)) // Exponential backoff
            continue
          }
          throw error // Re-throw if not retryable or max retries reached
        }
      }

      // Ensure result is defined
      if (!result) {
        throw new Error('Failed to get response from server')
      }

      if (!result.success) {
        // Handle specific error codes from API (check if code property exists)
        const errorCode = (result as any).code
        if (errorCode === 'AUTH_MISSING') {
          toast({
            title: "Session Expired",
            description: "Please sign in again to continue.",
            variant: "destructive",
          })
          router.push('/login')
          return
        } else if (errorCode === 'AUTH_ERROR') {
          toast({
            title: "Authentication Failed",
            description: "There was a problem with your sign-in. Please try signing in again.",
            variant: "destructive",
          })
          router.push('/login')
          return
        } else if (errorCode === 'INVALID_USER_ID') {
          toast({
            title: "Account Issue",
            description: "There seems to be an issue with your account. Please contact support.",
            variant: "destructive",
          })
          return
        }

        throw new Error(result.error || 'Failed to save tasting')
      }

      // Save to smart defaults for future recommendations
      smartDefaults.saveTasting({
        name: `${tastingData.productName} Tasting`,
        productType: tastingData.productType,
        productName: tastingData.productName,
        selectedFlavors: tastingData.selectedFlavors,
        overallRating: tastingData.overallRating,
        notes: tastingData.notes,
        createdAt: new Date().toISOString(),
        userId: user?.id
      })

      // Show success message
      toast({
        title: "Tasting Saved Successfully! 🎉",
        description: "Your quick tasting has been recorded and will help improve recommendations.",
        variant: "default",
      })

      // Navigate only when requested (End Tasting)
      if (navigateAfter) {
        router.push(`/${locale}/flavor-wheels`)
      }

    } catch (error: any) {
      console.error('Error submitting tasting:', error)

      // Handle different types of errors
      let errorTitle = "Failed to Save Tasting"
      let errorDescription = "Something went wrong. Please try again."

      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorTitle = "Connection Problem"
        errorDescription = "Please check your internet connection and try again."
      } else if (error.message?.includes('timeout')) {
        errorTitle = "Request Timed Out"
        errorDescription = "The request took too long. Please try again."
      } else if (error.code === 'AUTH_MISSING') {
        errorTitle = "Authentication Required"
        errorDescription = "Please sign in to save your tasting."
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
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
                  onValueChange={(value) => setTastingData(prev => ({ ...prev, productType: value as ProductType }))}
                >
                  <SelectTrigger className="w-full h-14 text-lg" data-testid="select-product-type-qt">
                    <SelectValue placeholder="Select a beverage type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPE_OPTIONS.map((type) => {
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
                const recommendedLabel = PRODUCT_TYPE_OPTIONS.find(t => t.value === recommendedType)?.label
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
                  What specific {PRODUCT_TYPE_OPTIONS.find(t => t.value === tastingData.productType)?.label.toLowerCase()} is it?
                </Label>
                <Input
                  id="productName"
                  value={tastingData.productName}
                  onChange={(e) => setTastingData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder={getProductPlaceholder(tastingData.productType)}
                  className="h-14 text-lg"
                  data-testid="input-product-name"
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

      case 1: // Notes (Aroma, Flavor, Other)
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-lg font-medium mb-2 block">Aroma</Label>
              <Textarea
                value={tastingData.aroma || ''}
                onChange={(e) => setTastingData(prev => ({ ...prev, aroma: e.target.value }))}
                placeholder="Describe the aroma (e.g., citrus, floral, herbal)"
                className="min-h-[88px] text-base"
                data-testid="textarea-aroma"
              />
            </div>
            <div>
              <Label className="text-lg font-medium mb-2 block">Flavor</Label>
              <Textarea
                value={tastingData.flavor || ''}
                onChange={(e) => setTastingData(prev => ({ ...prev, flavor: e.target.value }))}
                placeholder="Describe the flavor/palate (e.g., sweet, smoky, vanilla)"
                className="min-h-[88px] text-base"
                data-testid="textarea-flavor"
              />
            </div>
            <div>
              <Label className="text-lg font-medium mb-2 block">Other Notes</Label>
              <Textarea
                value={tastingData.other || ''}
                onChange={(e) => setTastingData(prev => ({ ...prev, other: e.target.value }))}
                placeholder="Finish, texture, structure, or any other notes"
                className="min-h-[88px] text-base"
                data-testid="textarea-other"
              />
            </div>
          </motion.div>
        )

      case 2: // Overall (0–100) & Summary
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <Label className="text-lg font-medium mb-4 block">Overall Score (0–100)</Label>
              <div className="space-y-4">
                <Slider
                  value={[tastingData.overallScore || 50]}
                  onValueChange={(value) => setTastingData(prev => ({ ...prev, overallScore: value[0] }))}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-fx-text-secondary">0 - Poor</span>
                  <span className="text-2xl font-bold text-fx-accent">{tastingData.overallScore}</span>
                  <span className="text-sm text-fx-text-secondary">100 - Excellent</span>
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
                data-testid="textarea-notes"
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
                  <p><strong>Aroma:</strong> {tastingData.aroma || '—'}</p>
                  <p><strong>Flavor:</strong> {tastingData.flavor || '—'}</p>
                  <p><strong>Other:</strong> {tastingData.other || '—'}</p>
                  <p><strong>Score:</strong> {tastingData.overallScore ?? 50}/100</p>
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
        return Boolean(tastingData.aroma?.trim() || tastingData.flavor?.trim())
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
              data-testid="btn-next-step"
            >
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  await handleSubmit(false)
                  // Reset fields for quick multi-add
                  setTastingData(prev => ({
                    ...prev,
                    productName: '',
                    aroma: '',
                    flavor: '',
                    other: '',
                    notes: '',
                    overallScore: 50,
                    selectedFlavors: [],
                  }))
                  setCurrentStep(0)
                }}
                disabled={isSubmitting}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Saving…' : 'Add Item'}
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                data-testid="complete-tasting-button"
                className="px-8 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    End Tasting
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
