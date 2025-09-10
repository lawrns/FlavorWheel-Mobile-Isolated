'use client'

import React, { useState, useEffect } from 'react'
import { Camera, Plus, Target } from 'lucide-react'
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
import { useRouter } from 'next/navigation'
import { UnifiedAppShell } from '@/components/app-shell'

// Hooks will be loaded dynamically to avoid SSR issues

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
const FLAVOR_DEFAULTS = {
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

// Inner component that uses the hooks
function QuickTastingPageInner() {
  const router = useRouter()
  const [toast, setToast] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  // Load hooks dynamically after mount
  useEffect(() => {
    const loadHooks = async () => {
      try {
        const [toastModule, authModule] = await Promise.all([
          import('@/hooks/use-toast'),
          import('@/components/auth-provider')
        ])

        setToast(() => toastModule.useToast().toast)
        setUser(authModule.useAuth().user)
      } catch (error) {
        console.error('Error loading hooks:', error)
      }
    }

    loadHooks()
  }, [])

  // Safe toast function for SSR compatibility
  const safeToast = (options: any) => {
    if (typeof window !== 'undefined' && toast) {
      toast(options)
    }
  }

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
      if (categoryName && FLAVOR_DEFAULTS[categoryName as keyof typeof FLAVOR_DEFAULTS]) {
        const defaultFlavors = FLAVOR_DEFAULTS[categoryName as keyof typeof FLAVOR_DEFAULTS].map((flavorName, index) => ({
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
            safeToast({
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
      safeToast({
        title: "Authentication Required",
        description: "Please sign in to save your tasting.",
        variant: "destructive",
      })
      return
    }

    if (!productType) {
      safeToast({
        title: "Product Type Required",
        description: "Please select what you're tasting.",
        variant: "destructive",
      })
      return
    }

    const validItems = items.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      safeToast({
        title: "Item Required",
        description: "Please add at least one item with a name.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Implement the actual API call for saving the tasting
      // For now, we'll simulate the save operation
      safeToast({
        title: "Tasting Saved!",
        description: "Your quick tasting has been recorded successfully.",
      })

      // Navigate to confirmation page
      router.push('/quick-tasting/confirm')
    } catch (error: any) {
      console.error('Error saving tasting:', error)
      safeToast({
        title: "Error Saving Tasting",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <UnifiedAppShell
      variant="dashboard"
      maxWidth="create"
      backgroundStyle="fx-bg"
      header={
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fx-text-primary hover:text-fx-text-secondary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-semibold text-fx-text-primary">Quick Tasting</h1>
          <div className="w-16"></div>
          {lastSaved && (
            <div className="text-xs text-green-600">Auto-saved</div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between p-4 border-t bg-white">
          <div></div>
          <button
            onClick={handleSubmit}
            disabled={!productType || items.every(item => !item.name.trim()) || isSubmitting}
            className="px-6 py-2 bg-fx-primary text-white rounded-lg hover:bg-fx-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'End Tasting'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Basic Info Section */}
        <Card className="rounded-xl bg-white shadow-soft border border-fx-border p-4 sm:p-5 hover-lift card-enter">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-fx-text font-heading">What are you tasting?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select value={productType} onValueChange={setProductType} data-testid="qt-select-product-type">
              <SelectTrigger className="w-full min-h-[48px] rounded-lg border border-fx-border bg-white px-3 text-sm text-fx-text focus-enhanced form-input">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.groups.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel className="text-xs font-medium text-fx-muted uppercase tracking-wide">
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
          <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-fx-text">What flavors do you detect?</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4" data-testid="qt-flavor-grid">
                {flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => toggleFlavor(flavor.id)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      flavor.selected
                        ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]'
                        : 'bg-white text-fx-text2 border-fx-border hover:bg-[#F4F1EC]'
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
                  className="flex-1 min-h-[48px] rounded-lg border border-[#D6D1C8] bg-white px-3 text-sm"
                />
                <Button
                  onClick={addCustomFlavor}
                  variant="outline"
                  className="min-h-[48px] px-4 rounded-lg border border-[#10b981] text-[#10b981] hover:bg-[#ecfdf5]"
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
        <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-fx-text">Items to Taste</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="border border-fx-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-fx-text">Item {index + 1}</h3>
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
                  <Label htmlFor={`name-${item.id}`} className="text-sm font-medium text-fx-text2 mb-2 block">Name *</Label>
                  <Input
                    id={`name-${item.id}`}
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    placeholder="Enter item name"
                    className="w-full min-h-[48px] rounded-lg border border-[#D6D1C8] bg-white px-3 text-sm"
                    required
                  />
                </div>

                {/* Photo */}
                <div>
                  <Label className="text-sm font-medium text-fx-text2 mb-2 block">Photo (Optional)</Label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      safeToast({
                        title: "Photo Upload",
                        description: "Photo upload feature coming soon!",
                      })
                    }}
                    className="w-full min-h-[48px] justify-start rounded-lg border border-[#D6D1C8] bg-white text-sm"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Add Photo
                  </Button>
                </div>

                {/* Aroma */}
                <div>
                  <Label htmlFor={`aroma-${item.id}`} className="text-sm font-medium text-fx-text2 mb-2 block">Aroma</Label>
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
                    className="w-full min-h-[60px] rounded-lg border border-[#D6D1C8] bg-white px-3 py-3 text-sm"
                  />
                </div>

                {/* Flavor */}
                <div>
                  <Label htmlFor={`flavor-${item.id}`} className="text-sm font-medium text-fx-text2 mb-2 block">Flavor</Label>
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
                    className="w-full min-h-[60px] rounded-lg border border-[#D6D1C8] bg-white px-3 py-3 text-sm"
                  />
                </div>

                {/* Other Notes */}
                <div>
                  <Label htmlFor={`other-${item.id}`} className="text-sm font-medium text-fx-text2 mb-2 block">Other Notes</Label>
                  <Textarea
                    id={`other-${item.id}`}
                    value={item.other}
                    onChange={(e) => updateItem(item.id, 'other', e.target.value)}
                    placeholder="Any other important information?"
                    className="w-full min-h-[60px] rounded-lg border border-[#D6D1C8] bg-white px-3 py-3 text-sm"
                  />
                </div>

                {/* Overall Rating */}
                <div>
                  <Label className="text-sm font-medium text-fx-text2 mb-2 block">Overall Rating: {item.overall}/100</Label>
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
              className="w-full min-h-[48px] rounded-lg border border-[#10b981] text-[#10b981] hover:bg-[#ecfdf5]"
              data-testid="qt-btn-add-item"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        {/* Footer Actions - Fixed bottom */}
        <div className="h-24"></div>
      </div>
    </UnifiedAppShell>
  )
}

// Outer component that handles SSR
export default function QuickTastingPage() {
  return <QuickTastingPageInner />
}
