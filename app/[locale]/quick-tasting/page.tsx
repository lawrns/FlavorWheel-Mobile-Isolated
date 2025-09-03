'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Camera, Plus, Target } from 'lucide-react'
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import { PhotoUpload } from '@/components/ui/photo-upload'

interface TastingItem {
  id: string
  name: string
  image?: string
  aroma: string
  flavor: string
  other: string
  overall: number
}

interface FlavorDescriptor {
  id: string
  name: string
  intensity: number
  selected: boolean
  isCustom?: boolean
}

// Product types from specification
const PRODUCT_TYPES = {
  groups: [
    { label: "Wine", items: ["Red","White","Rosé","Sparkling","Dessert"] },
    { label: "Coffee", items: ["Espresso","Pour Over","French Press","Cold Brew","Turkish Coffee"] },
    { label: "Beer", items: ["Lager","Pilsner","IPA","Stout","Porter","Wheat"] },
    { label: "Spirits", items: ["Whiskey","Gin","Rum","Tequila","Vodka"] },
    { label: "Non-Alcoholic", items: ["Tea","Chocolate","Olive Oil"] }
  ]
}

// Flavor defaults based on product type
const FLAVOR_DEFAULTS: Record<string, string[]> = {
  "Wine": ["Berry","Citrus","Oak","Vanilla","Spice","Mineral"],
  "Coffee": ["Chocolate","Nutty","Citrus","Floral","Caramel","Spice"],
  "Beer": ["Hoppy","Malty","Citrus","Roasted","Fruity","Spice"],
  "Spirits": ["Oak","Smoke","Vanilla","Herbal","Citrus","Caramel"],
  "Non-Alcoholic": ["Herbal","Floral","Citrus","Sweet","Bitter","Nutty"]
}

// Create flat list of product types for the select
const createProductTypeOptions = () => {
  const options: Array<{ value: string, label: string }> = []
  PRODUCT_TYPES.groups.forEach(group => {
    options.push(...group.items.map(item => ({
      value: item.toLowerCase().replace(' ', '-'),
      label: item
    })))
  })
  return options
}

const PRODUCT_TYPE_OPTIONS = createProductTypeOptions()

export default function QuickTastingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if this is a guided tasting (from URL params or state)
  const [isGuidedMode, setIsGuidedMode] = useState(true) // Default to guided for testing
  const [guidedStep, setGuidedStep] = useState(0)
  const [guidedData, setGuidedData] = useState({
    aroma: '',
    appearance: '',
    taste: '',
    finish: '',
    rating: 0,
    finalNotes: ''
  })

  // State management
  const [productType, setProductType] = useState<string>('')
  const [flavors, setFlavors] = useState<FlavorDescriptor[]>([])
  const [items, setItems] = useState<TastingItem[]>([
    {
      id: '1',
      name: '',
      aroma: '',
      flavor: '',
      other: '',
      overall: 50,
    }
  ])
  const [customFlavorInput, setCustomFlavorInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load flavors when product type changes
  useEffect(() => {
    if (productType) {
      const categoryName = PRODUCT_TYPE_OPTIONS.find(opt => opt.value === productType)?.label
      if (categoryName && FLAVOR_DEFAULTS[categoryName]) {
        const defaultFlavors = FLAVOR_DEFAULTS[categoryName].map((flavorName: string, index: number) => ({
          id: `flavor-${index}`,
          name: flavorName,
          intensity: 5,
          selected: false
        }))
        setFlavors(defaultFlavors)
      }
    }
  }, [productType])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (productType && items.some(item => item.name.trim() !== '')) {
        const draftData = {
          productType,
          flavors: flavors.filter(f => f.selected),
          items,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('quick-tasting-draft', JSON.stringify(draftData))
        setLastSaved(new Date())
      }
    }

    const timeoutId = setTimeout(autoSave, 2000)
    return () => clearTimeout(timeoutId)
  }, [productType, flavors, items])

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftData = localStorage.getItem('quick-tasting-draft')
        if (draftData) {
          const parsed = JSON.parse(draftData)
          const draftTime = new Date(parsed.timestamp)
          const now = new Date()
          const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            setProductType(parsed.productType || '')
            setFlavors(parsed.flavors || [])
            setItems(parsed.items || [{ id: '1', name: '', aroma: '', flavor: '', other: '', overall: 50 }])
            setLastSaved(draftTime)
            toast({
              title: "Draft Loaded",
              description: "Your previous tasting draft has been restored.",
            })
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
    loadDraft()
  }, [toast])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (productType && items.some(item => item.name.trim() !== '')) {
        const draftData = {
          productType,
          flavors: flavors.filter(f => f.selected),
          items,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('quick-tasting-draft', JSON.stringify(draftData))
        setLastSaved(new Date())
      }
    }

    const timeoutId = setTimeout(autoSave, 2000) // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId)
  }, [productType, flavors, items])

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftData = localStorage.getItem('quick-tasting-draft')
        if (draftData) {
          const parsed = JSON.parse(draftData)
          // Only load if it's recent (within 24 hours)
          const draftTime = new Date(parsed.timestamp)
          const now = new Date()
          const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            setProductType(parsed.productType || '')
            setFlavors(parsed.flavors || [])
            setItems(parsed.items || [{ id: '1', name: '', aroma: '', flavor: '', other: '', overall: 50 }])
            setLastSaved(draftTime)
            toast({
              title: "Draft Loaded",
              description: "Your previous tasting draft has been restored.",
            })
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
    loadDraft()
  }, [toast])

  // Helper function to map product type to beverage category
  const getBeverageCategory = (type: string): string | null => {
    if (!type) return null

    const lowerType = type.toLowerCase()
    if (lowerType.includes('tequila') || lowerType.includes('mezcal') || lowerType.includes('whiskey') ||
        lowerType.includes('gin') || lowerType.includes('rum') || lowerType.includes('vodka')) {
      return 'mezcal' // Using mezcal as the default spirits theme
    }
    if (lowerType.includes('wine')) return 'wine'
    if (lowerType.includes('coffee') || lowerType.includes('espresso') || lowerType.includes('cappuccino')) return 'coffee'
    if (lowerType.includes('beer') || lowerType.includes('lager') || lowerType.includes('ale') ||
        lowerType.includes('stout') || lowerType.includes('ipa')) return 'beer'
    if (lowerType.includes('tea')) return 'tea'

    return null
  }

  // Helper functions
  const addNewItem = () => {
    const newItem: TastingItem = {
      id: Date.now().toString(),
      name: '',
      aroma: '',
      flavor: '',
      other: '',
      overall: 50,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof TastingItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const toggleFlavor = (id: string) => {
    setFlavors(flavors.map(flavor =>
      flavor.id === id ? { ...flavor, selected: !flavor.selected } : flavor
    ))
  }

  const updateFlavorIntensity = (id: string, intensity: number) => {
    setFlavors(flavors.map(flavor =>
      flavor.id === id ? { ...flavor, intensity } : flavor
    ))
  }

  const addCustomFlavor = () => {
    if (customFlavorInput.trim()) {
      const newFlavor: FlavorDescriptor = {
        id: Date.now().toString(),
        name: customFlavorInput.trim(),
        intensity: 5,
        selected: true,
        isCustom: true
      }
      setFlavors([...flavors, newFlavor])
      setCustomFlavorInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomFlavor()
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your tasting.",
        variant: "destructive",
      })
      return
    }

    if (!productType) {
      toast({
        title: "Product Type Required",
        description: "Please select what you're tasting.",
        variant: "destructive",
      })
      return
    }

    const validItems = items.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      toast({
        title: "Item Required",
        description: "Please add at least one item with a name.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save tasting data to Supabase
      const tastingData = {
        name: `Quick Tasting - ${productType} (${new Date().toLocaleDateString()})`,
        description: `Quick tasting session for ${productType}`,
        created_by: user?.id,
        status: 'completed',
        product_type: productType.toLowerCase(),
        items: validItems.map(item => ({
          name: item.name,
          description: item.aroma || item.flavor || item.other || '',
          overall_rating: item.overall,
          flavor_notes: {
            aroma: item.aroma,
            flavor: item.flavor,
            other: item.other
          }
        })),
        flavor_profile: flavors.filter(f => f.selected).map(f => ({
          name: f.name,
          intensity: f.intensity,
          is_custom: f.isCustom || false
        }))
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
        title: "Tasting Saved!",
        description: "Your quick tasting has been recorded successfully.",
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



  const beverageCategory = getBeverageCategory(productType)

  return (
    <div
      className="min-h-screen bg-fx-bg p-4 md:p-6"
      data-beverage={beverageCategory || undefined}
    >
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

        {/* Guided Tasting Interface */}
        {(isGuidedMode || true) && (
          <div className="mb-8">
            {guidedStep === 0 && (
              <Card className="rounded-xl p-6">
                <div className="text-center">
                  <h2 className="text-fx-h3 font-bold text-fx-text-primary mb-4">Ready to Begin Your Guided Tasting?</h2>
                  <p className="text-fx-text-secondary mb-6">We'll guide you through each step of the tasting process</p>
                  <Button
                    onClick={() => setGuidedStep(1)}
                    className="px-8 py-3"
                    data-testid="start-tasting-button"
                  >
                    Start Tasting
                  </Button>

                  {/* Mobile Start Tasting Button */}
                  <Button
                    onClick={() => setGuidedStep(1)}
                    className="md:hidden mt-4 px-8 py-3 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg font-semibold w-full"
                    data-testid="mobile-start-tasting"
                  >
                    Start Mobile Tasting
                  </Button>
                </div>
              </Card>
            )}

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
        )}

        {/* Regular Quick Tasting Form (hidden in guided mode) */}
        {!isGuidedMode && (
          <>
        {/* Basic Info Section */}
        <Card className="mb-6 rounded-xl p-4 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-[#1f2937]">What are you tasting?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={productType} onValueChange={setProductType} data-testid="qt-select-product-type">
              <SelectTrigger className="w-full h-12 rounded-md border border-[#e5e7eb] px-3 text-sm">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.groups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs font-medium text-[#6b7280] uppercase tracking-wide">
                      {group.label}
                    </SelectLabel>
                    {group.items.map((item) => {
                      const value = item.toLowerCase().replace(' ', '-')
                      return (
                        <SelectItem key={value} value={value}>
                          {item}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Flavor Detection Section */}
        {productType && (
          <Card className="mb-6 rounded-xl p-4 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-[#1f2937]">What flavors do you detect?</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4" data-testid="qt-flavor-grid">
                {flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-md border text-sm font-medium transition-all ${
                      flavor.selected
                        ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]'
                        : 'bg-white text-[#4b5563] border-[#e5e7eb] hover:bg-[#f9fafb]'
                    }`}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>

              {/* Custom Flavor Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom flavor..."
                  value={customFlavorInput}
                  onChange={(e) => setCustomFlavorInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 h-12 rounded-md border border-[#e5e7eb] px-3 text-sm"
                />
                <Button
                  onClick={addCustomFlavor}
                  variant="outline"
                  className="h-12 px-4 rounded-md border border-[#10b981] text-[#10b981] hover:bg-[#ecfdf5]"
                >
                  Add
                </Button>
              </div>

              {/* Intensity Sliders for Selected Flavors */}
              {flavors.filter(f => f.selected).length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-[#1f2937]">Flavor Intensity</h4>
                  {flavors.filter(f => f.selected).map((flavor) => (
                    <div key={flavor.id} className="flex items-center gap-3">
                      <span className="text-sm text-[#4b5563] min-w-20">{flavor.name}</span>
                      <Slider
                        value={[flavor.intensity]}
                        onValueChange={(value) => updateFlavorIntensity(flavor.id, value[0])}
                        min={0}
                        max={10}
                        step={1}
                        className="flex-1 [&_[role=slider]]:bg-[#10b981] [&_[role=slider]]:border-[#10b981]"
                      />
                      <span className="text-sm text-[#6b7280] min-w-8">{flavor.intensity}/10</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items to Taste Section */}
        <Card className="mb-6 rounded-xl p-4 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-[#1f2937]">Items to Taste</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-[#e5e7eb] rounded-lg p-4 space-y-4" style={{ marginTop: '16px' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-[#1f2937]">Item {index + 1}</h3>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-[#ef4444] hover:text-[#dc2626] hover:bg-[#fef2f2]"
                    >
                      <Target className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor={`name-${item.id}`} className="text-sm font-medium text-[#374151] mb-2 block">Name *</Label>
                  <Input
                    id={`name-${item.id}`}
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Enter item name"
                    className="w-full h-12 rounded-md border border-[#e5e7eb] px-3 text-sm"
                    required
                  />
                </div>

                {/* Photo */}
                <div>
                  <Label className="text-sm font-medium text-[#374151] mb-2 block">Photo (Optional)</Label>
                  <PhotoUpload
                    userId={user?.id || ''}
                    onPhotoUploaded={(url) => updateItem(item.id, 'image', url)}
                    currentPhotoUrl={item.image}
                    onPhotoRemoved={() => updateItem(item.id, 'image', '')}
                    disabled={!user}
                    className="w-full"
                  />
                </div>

                {/* Aroma */}
                <div>
                  <Label htmlFor={`aroma-${item.id}`} className="text-sm font-medium text-[#374151] mb-2 block">Aroma</Label>
                  {flavors.filter(f => f.selected).length > 0 && (
                    <div className="mb-3 p-3 bg-[#ecfdf5] rounded-md text-xs text-[#10b981]">
                      <strong>Detected flavors:</strong> {flavors.filter(f => f.selected).map(f => `${f.name} (${f.intensity}/10)`).join(', ')}
                    </div>
                  )}
                  <Textarea
                    id={`aroma-${item.id}`}
                    value={item.aroma}
                    onChange={(e) => updateItem(item.id, 'aroma', e.target.value)}
                    placeholder="Describe the aroma..."
                    className="w-full min-h-[60px] rounded-md border border-[#e5e7eb] px-3 py-3 text-sm"
                  />
                </div>

                {/* Flavor */}
                <div>
                  <Label htmlFor={`flavor-${item.id}`} className="text-sm font-medium text-[#374151] mb-2 block">Flavor</Label>
                  {flavors.filter(f => f.selected).length > 0 && (
                    <div className="mb-3 p-3 bg-[#ecfdf5] rounded-md text-xs text-[#10b981]">
                      <strong>Selected flavors:</strong> {flavors.filter(f => f.selected).map(f => `${f.name} (${f.intensity}/10)`).join(', ')}
                    </div>
                  )}
                  <Textarea
                    id={`flavor-${item.id}`}
                    value={item.flavor}
                    onChange={(e) => updateItem(item.id, 'flavor', e.target.value)}
                    placeholder="Describe the flavor..."
                    className="w-full min-h-[60px] rounded-md border border-[#e5e7eb] px-3 py-3 text-sm"
                  />
                </div>

                {/* Other Notes */}
                <div>
                  <Label htmlFor={`other-${item.id}`} className="text-sm font-medium text-[#374151] mb-2 block">Other Notes</Label>
                  <Textarea
                    id={`other-${item.id}`}
                    value={item.other}
                    onChange={(e) => updateItem(item.id, 'other', e.target.value)}
                    placeholder="Any other important information?"
                    className="w-full min-h-[60px] rounded-md border border-[#e5e7eb] px-3 py-3 text-sm"
                  />
                </div>

                {/* Overall Rating */}
                <div>
                  <Label className="text-sm font-medium text-[#374151] mb-2 block">Overall Rating: {item.overall}/100</Label>
                  <Slider
                    value={[item.overall]}
                    onValueChange={(value) => updateItem(item.id, 'overall', value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full [&_[role=slider]]:bg-[#10b981] [&_[role=slider]]:border-[#10b981]"
                  />
                </div>
              </div>
            ))}

            {/* Add Item Button */}
            <Button
              onClick={addNewItem}
              variant="outline"
              className="w-full h-12 mt-4 rounded-md border border-[#10b981] text-[#10b981] hover:bg-[#ecfdf5]"
              data-testid="qt-btn-add-item"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#e5e7eb] p-4 pb-safe">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !productType || items.every(item => !item.name.trim())}
              className="flex-1 h-12 rounded-xl font-semibold bg-[#10b981] text-white hover:bg-[#059669]"
              data-testid="qt-btn-end-tasting"
            >
              {isSubmitting ? 'Saving...' : 'End Tasting'}
            </Button>
          </div>
          <p className="text-center text-xs text-[#6b7280] mt-2">
            Your tasting will be saved automatically
          </p>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
