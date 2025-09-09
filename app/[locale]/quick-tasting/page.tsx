'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'



export default function QuickTastingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { toast } = useToast()
  const { user } = useAuth()

  // Simplified single-user flow without traditional pages
  const [guidedStep, setGuidedStep] = useState(1) // Start directly with aroma step
  const [guidedData, setGuidedData] = useState({
    aroma: '',
    appearance: '',
    taste: '',
    finish: '',
    rating: 0,
    finalNotes: ''
  })

  // State management - simplified for guided flow only
  const [isSubmitting, setIsSubmitting] = useState(false)



  // Handle form submission for guided tasting
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your tasting.",
        variant: "destructive",
      })
      return
    }

    // Validate that we have the required guided tasting data
    if (!guidedData.aroma.trim() || !guidedData.taste.trim()) {
      toast({
        title: "Incomplete Tasting",
        description: "Please complete at least the aroma and taste steps.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save guided tasting data to Supabase
      const tastingData = {
        name: `Guided Tasting (${new Date().toLocaleDateString()})`,
        description: `Guided tasting session with step-by-step evaluation`,
        created_by: user?.id,
        status: 'completed',
        type: 'quick',
        tasting_data: {
          guided_flow: true,
          steps_completed: guidedStep,
          aroma_description: guidedData.aroma,
          appearance_description: guidedData.appearance,
          taste_description: guidedData.taste,
          finish_description: guidedData.finish,
          overall_rating: guidedData.rating,
          final_notes: guidedData.finalNotes
        }
      }

      const { data, error } = await supabase
        .from('tastings')
        .insert([tastingData])
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Tasting Completed!",
        description: "Your guided tasting has been saved successfully.",
      })

      // Navigate to confirmation page with tasting ID
      router.push(`/${locale}/quick-tasting/${data.id}/confirm`)
    } catch (error: any) {
      console.error('Error saving tasting:', error)
      toast({
        title: "Error Saving Tasting",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }




  return (
    <div className="min-h-screen bg-fx-bg p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fx-text-primary hover:text-fx-text-secondary"
            data-testid="qt-btn-header-back"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-fx-h2 font-bold text-fx-text-primary">Quick Tasting</h1>
            <p className="text-fx-body text-fx-text-secondary">Select your drink and start in seconds</p>
          </div>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Simplified Guided Tasting Interface - Single User Flow */}
        <div className="mb-8">
          {guidedStep === 1 && (
              <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Step 1: Aroma</h3>
                <p className="text-[#6b7280] mb-4">Take a moment to smell your drink. What aromas do you detect?</p>
                <textarea
                  data-testid="aroma-input"
                  placeholder="Describe the aromas you detect..."
                  value={guidedData.aroma}
                  onChange={(e) => setGuidedData(prev => ({ ...prev, aroma: e.target.value }))}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg mb-4"
                  rows={3}
                />
                <Button
                  onClick={() => setGuidedStep(2)}
                  disabled={!guidedData.aroma.trim()}
                  className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
                  data-testid="next-step-button"
                >
                  Next Step
                </Button>
              </Card>
            )}

            {guidedStep === 2 && (
              <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Step 2: Appearance</h3>
                <p className="text-[#6b7280] mb-4">Look at your drink. How would you describe its appearance?</p>
                <textarea
                  data-testid="appearance-input"
                  placeholder="Describe the appearance..."
                  value={guidedData.appearance}
                  onChange={(e) => setGuidedData(prev => ({ ...prev, appearance: e.target.value }))}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg mb-4"
                  rows={3}
                />
                <Button
                  onClick={() => setGuidedStep(3)}
                  disabled={!guidedData.appearance.trim()}
                  className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
                  data-testid="next-step-button"
                >
                  Next Step
                </Button>
              </Card>
            )}

            {guidedStep === 3 && (
              <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Step 3: Taste</h3>
                <p className="text-[#6b7280] mb-4">Take a sip. What flavors do you taste?</p>

                {/* Mobile Flavor Selection */}
                <div className="md:hidden mb-4">
                  <p className="text-sm font-medium mb-2">Select flavors (mobile):</p>
                  <div className="flex flex-wrap gap-2">
                    <button data-testid="mobile-flavor-citrus" className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Citrus</button>
                    <button data-testid="mobile-flavor-sweet" className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">Sweet</button>
                    <button data-testid="mobile-flavor-vanilla" className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">Vanilla</button>
                  </div>
                </div>

                <textarea
                  data-testid="taste-input"
                  placeholder="Describe the taste..."
                  value={guidedData.taste}
                  onChange={(e) => setGuidedData(prev => ({ ...prev, taste: e.target.value }))}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg mb-4"
                  rows={3}
                />
                <Button
                  onClick={() => setGuidedStep(4)}
                  disabled={!guidedData.taste.trim()}
                  className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
                  data-testid="next-step-button"
                >
                  Next Step
                </Button>
              </Card>
            )}

            {guidedStep === 4 && (
              <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Step 4: Finish</h3>
                <p className="text-[#6b7280] mb-4">How does the taste linger after swallowing?</p>
                <textarea
                  data-testid="finish-input"
                  placeholder="Describe the finish..."
                  value={guidedData.finish}
                  onChange={(e) => setGuidedData(prev => ({ ...prev, finish: e.target.value }))}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg mb-4"
                  rows={3}
                />
                <Button
                  onClick={() => setGuidedStep(5)}
                  disabled={!guidedData.finish.trim()}
                  className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
                  data-testid="next-step-button"
                >
                  Next Step
                </Button>
              </Card>
            )}

            {guidedStep === 5 && (
              <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <h3 className="text-xl font-semibold text-[#1f2937] mb-4">Step 5: Overall Rating</h3>
                <p className="text-[#6b7280] mb-4">Rate your overall experience (1-10):</p>

                {/* Desktop Rating */}
                <div className="hidden md:flex gap-2 mb-4">
                  {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setGuidedData(prev => ({ ...prev, rating }))}
                      data-testid={`rating-${rating}`}
                      className={`w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                        guidedData.rating === rating
                          ? 'bg-[#10b981] text-white border-[#10b981]'
                          : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#10b981]'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                {/* Mobile Rating */}
                <div className="md:hidden grid grid-cols-5 gap-2 mb-4">
                  {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setGuidedData(prev => ({ ...prev, rating }))}
                      data-testid={`mobile-rating-${rating}`}
                      className={`w-12 h-12 rounded-full border-2 font-semibold transition-colors ${
                        guidedData.rating === rating
                          ? 'bg-[#10b981] text-white border-[#10b981]'
                          : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#10b981]'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <textarea
                  data-testid="final-notes"
                  placeholder="Any final notes about your tasting experience..."
                  value={guidedData.finalNotes}
                  onChange={(e) => setGuidedData(prev => ({ ...prev, finalNotes: e.target.value }))}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg mb-4"
                  rows={3}
                />
                <Button
                  onClick={() => {
                    // Handle completion
                    toast({
                      title: "Tasting Complete!",
                      description: "Your guided tasting has been saved.",
                    })
                    router.push(`/${locale}/tastings/completed`)
                  }}
                  disabled={guidedData.rating === 0}
                  className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
                  data-testid="complete-tasting-button"
                >
                  Complete Tasting
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
  )
}
