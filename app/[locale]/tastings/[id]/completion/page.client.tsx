'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TastingCompletionScreen } from '@/components/tasting-completion-screen'
import { ReviewPrompt } from '@/components/ui/review-prompt'
import { TastingSharing } from '@/components/tasting-sharing'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface TastingData {
  id: string
  name: string
  mode: 'study' | 'competition' | 'quick'
  product_type: string
  categories?: any[]
  items?: any[]
  subjectiveInputs?: string[]
  preLoadedData?: any[]
  quickNotes?: any
  detailedResponses?: any
}

interface TastingCompletionPageClientProps {
  params: {
    locale: string
    id: string
  }
}

export default function TastingCompletionPageClient({ params }: TastingCompletionPageClientProps) {
  const router = useRouter()
  const [tastingData, setTastingData] = useState<TastingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [showSharingDialog, setShowSharingDialog] = useState(false)

  useEffect(() => {
    loadTastingData()
  }, [params.id])

  const loadTastingData = async () => {
    try {
      setLoading(true)

      // Try to get submission data from sessionStorage first
      const submissionData = sessionStorage.getItem('tasting-submission-data')
      console.log('📥 COMPLETION - RAW SESSIONSTORAGE DATA:', submissionData)

      if (submissionData) {
        const parsed = JSON.parse(submissionData)
        console.log('📥 COMPLETION - PARSED SUBMISSION DATA:', parsed)

        if (parsed.tastingId === params.id) {
          console.log('📥 COMPLETION - RESPONSES FROM SUBMISSION:', parsed.responses)
          // Always extract detailed responses for proper rendering
          console.log('📥 COMPLETION - EXTRACTING DETAILED RESPONSES')
          const detailedResponses = extractDetailedResponses(parsed.responses)

          // Use the NLP-formatted data if available, otherwise fall back to extraction
          const tastingData = parsed.nlpInputData ? {
            id: parsed.tastingId,
            name: parsed.tastingData?.name || 'Tasting Session',
            mode: parsed.mode,
            product_type: parsed.productType,
            subjectiveInputs: parsed.nlpInputData.subjectiveInputs || [],
            preLoadedData: parsed.nlpInputData.preLoadedData || [],
            quickNotes: parsed.nlpInputData.quickNotes || undefined,
            detailedResponses: detailedResponses
          } : {
            id: parsed.tastingId,
            name: parsed.tastingData?.name || 'Tasting Session',
            mode: parsed.mode,
            product_type: parsed.productType,
            subjectiveInputs: extractSubjectiveInputs(parsed.responses),
            preLoadedData: extractPreLoadedData(parsed.responses),
            quickNotes: extractQuickNotes(parsed.responses),
            detailedResponses: detailedResponses
          }

          // Ensure subjective inputs are properly extracted for flavor wheel generation
          const subjectiveInputs = extractSubjectiveInputs(parsed.responses)
          console.log('📥 COMPLETION - EXTRACTED SUBJECTIVE INPUTS:', subjectiveInputs)

          const enhancedTastingData = {
            ...tastingData,
            subjectiveInputs: subjectiveInputs,
            // Ensure we have product type for flavor wheel generation
            product_type: tastingData.product_type || parsed.productType || 'coffee'
          }

          console.log('📥 COMPLETION - FINAL ENHANCED TASTING DATA:', enhancedTastingData)
          console.log('📥 COMPLETION - DETAILED RESPONSES:', tastingData.detailedResponses)

          setTastingData(enhancedTastingData)
          setLoading(false)
          return
        }
      }

      // Try to get tasting data from sessionStorage (for direct navigation)
      const storedData = sessionStorage.getItem('tasting-completion-data')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        if (parsed.id === params.id) {
          setTastingData(parsed)
          setLoading(false)
          return
        }
      }

      // If no stored data or ID mismatch, try to fetch from API
      // For now, redirect back if no data
      router.push(`/${params.locale}/create`)
    } catch (error) {
      console.error('Failed to load tasting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractSubjectiveInputs = (responses: any[]) => {
    console.log('🔍 EXTRACT SUBJECTIVE INPUTS - INPUT:', responses)

    const extractedInputs = responses
      .filter(r => (r.parameterType === 'subjective_input' || r.parameterType === 'exact_answer' || r.parameterType === 'contains_x') && r.value && r.value.trim().length > 0)
      .map(r => r.value.trim())

    console.log('🔍 EXTRACT SUBJECTIVE INPUTS - OUTPUT:', extractedInputs)
    return extractedInputs
  }

  const extractPreLoadedData = (responses: any[]) => {
    const groupedResponses = responses.reduce((acc, response) => {
      if (!acc[response.itemId]) {
        acc[response.itemId] = {}
      }

      // Convert sliding scale values to descriptive text
      let processedValue = response.value
      if (response.parameterType === 'sliding_scale' && typeof response.value === 'number') {
        const maxValue = response.maxValue || 10
        const percentage = (response.value / maxValue) * 100
        if (percentage >= 80) processedValue = 'Very High'
        else if (percentage >= 60) processedValue = 'High'
        else if (percentage >= 40) processedValue = 'Medium'
        else if (percentage >= 20) processedValue = 'Low'
        else processedValue = 'Very Low'
      }

      acc[response.itemId][response.categoryId] = {
        [response.parameterType]: processedValue,
        originalValue: response.value, // Keep original for display
        parameterType: response.parameterType
      }
      return acc
    }, {})

    return Object.values(groupedResponses)
  }

  const extractQuickNotes = (responses: any[]) => {
    const quickResponses = responses.filter(r =>
      r.parameterType === 'subjective_input' ||
      r.parameterType === 'sliding_scale' ||
      r.parameterType === 'multiple_choice'
    )

    return {
      aroma: quickResponses.find(r => r.categoryId?.toLowerCase().includes('aroma'))?.value || '',
      flavor: quickResponses.find(r => r.categoryId?.toLowerCase().includes('flavor'))?.value || '',
      other: quickResponses.find(r => r.categoryId?.toLowerCase().includes('other'))?.value || '',
      selectedFlavors: [] // Would need to be extracted from responses if applicable
    }
  }

  const extractDetailedResponses = (responses: any[]) => {
    console.log('🔍 EXTRACT DETAILED RESPONSES - INPUT:', responses)

    // Group responses by item and category for detailed display
    const groupedResponses = responses.reduce((acc, response) => {
      if (!acc[response.itemId]) {
        acc[response.itemId] = {}
      }
      acc[response.itemId][response.categoryId] = {
        value: response.value,
        parameterType: response.parameterType,
        categoryName: response.categoryName || response.categoryId
      }
      return acc
    }, {})

    console.log('🔍 EXTRACT DETAILED RESPONSES - OUTPUT:', groupedResponses)
    return groupedResponses
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading completion data...</p>
        </div>
      </div>
    )
  }

  if (!tastingData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tasting Not Found</h1>
          <p className="text-gray-600 mb-6">The tasting completion data could not be found.</p>
          <button
            onClick={() => router.push(`/${params.locale}/create`)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Create
          </button>
        </div>
      </div>
    )
  }

  const handleSaveTasting = () => {
    // TODO: Implement save functionality
    console.log('Saving tasting results...')
  }

  const handleShareTasting = () => {
    setShowSharingDialog(true)
  }

  const handleWriteReview = () => {
    setShowReviewPrompt(true)
  }

  const handleReviewCreated = () => {
    setShowReviewPrompt(false)
    // Could show a success message or redirect to reviews
  }

  if (showReviewPrompt && tastingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
        <ReviewPrompt
          tastingId={tastingData.id}
          itemId={tastingData.id} // Using tasting ID as item ID for simplicity
          itemName={tastingData.name}
          tastingName={tastingData.name}
          onReviewCreated={handleReviewCreated}
          onClose={() => setShowReviewPrompt(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tasting Complete!</h1>
          <p className="text-muted-foreground">
            Your tasting session has been successfully completed.
          </p>
        </div>

        {/* Completion Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Tasting Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mode:</span>
              <span className="font-medium capitalize">{tastingData?.mode || 'Study'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Type:</span>
              <span className="font-medium capitalize">{tastingData?.product_type || 'General'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Session:</span>
              <span className="font-medium">{tastingData?.name || 'Tasting Session'}</span>
            </div>
          </div>

          {/* Flavor Analysis Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Flavor Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Flavor wheel will be generated here</p>
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <span className="text-xs text-gray-500">Preview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleSaveTasting}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Save Results
          </button>

          <button
            onClick={handleWriteReview}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Write Review
          </button>

          <button
            onClick={handleShareTasting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Share Experience
          </button>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium mb-4">What would you like to do next?</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => router.push(`/${params.locale}/create`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
            >
              <h4 className="font-medium">Create New Tasting</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Start another tasting session
              </p>
            </button>

            <button
              onClick={() => router.push(`/${params.locale}/review`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
            >
              <h4 className="font-medium">Browse Reviews</h4>
              <p className="text-sm text-muted-foreground mt-1">
                See what others are saying
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Sharing Dialog */}
      <Dialog open={showSharingDialog} onOpenChange={setShowSharingDialog}>
        <DialogContent className="max-w-md">
          {tastingData && (
            <TastingSharing
              tastingId={tastingData.id}
              tastingName={tastingData.name}
              locale={params.locale}
              onClose={() => setShowSharingDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
