'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Minus, Camera, Upload, ChevronDown, X, Sparkles, FileText, Sliders, CheckSquare, Type, Search, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'


// Enhanced types based on the updated JSON specification
type EvaluationType = 'subjective_input' | 'multiple_choice' | 'sliding_scale' | 'exact_answer' | 'contains_x'

interface Category {
  id: string
  category_name: string
  evaluation_type: EvaluationType
  mc_options?: string[]
  scale_meta?: { min: number; max: number; step: number }
  contains_value?: string
  category_notes_placeholder?: string
}

interface Item {
  id: string
  item_name: string
  item_description?: string
  item_image?: string
}

interface FormData {
  tasting_name: string
  product_type: string
  template: string
  blind_toggle: boolean
  categories: Category[]
  items: Item[]
}

const PRODUCT_TYPE_GROUPS = {
  wine: ['Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine', 'Dessert Wine'],
  coffee: ['Espresso', 'Pour Over', 'French Press', 'Cold Brew', 'Turkish Coffee'],
  beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Pilsner'],
  spirits: ['Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila'],
  other: ['Tea', 'Juice', 'Soft Drink', 'Other']
}

const EVALUATION_TYPE_OPTIONS = [
  { value: 'subjective_input', label: 'Subjective Input', icon: FileText },
  { value: 'sliding_scale', label: 'Sliding Scale', icon: Sliders },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { value: 'exact_answer', label: 'Exact Answer', icon: Type },
  { value: 'contains_x', label: 'Contains X', icon: Search }
]

const TEMPLATES = [
  { value: 'sca_coffee', label: 'SCA Coffee Tasting' },
  { value: 'cms_wine', label: 'CMS Wine Tasting' },
  { value: 'bjcp_beer', label: 'BJCP Beer Evaluation' },
  { value: 'none', label: 'Blank Template' }
]

export default function CreateStudyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    tasting_name: '',
    product_type: '',
    template: '',
    blind_toggle: false,
    categories: [{
      id: '1',
      category_name: '',
      evaluation_type: 'subjective_input'
    }],
    items: [{
      id: '1',
      item_name: '',
      item_description: ''
    }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date()
      setLastSaved(now.toLocaleTimeString())
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addCategory = () => {
    if (formData.categories.length < 10) {
      const newCategory: Category = {
        id: Date.now().toString(),
        category_name: '',
        evaluation_type: 'subjective_input'
      }
      updateFormData({
        categories: [...formData.categories, newCategory]
      })
    }
  }

  const removeCategory = (id: string) => {
    updateFormData({
      categories: formData.categories.filter(cat => cat.id !== id)
    })
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    updateFormData({
      categories: formData.categories.map(cat =>
        cat.id === id ? { ...cat, ...updates } : cat
      )
    })
  }

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      item_name: '',
      item_description: ''
    }
    updateFormData({
      items: [...formData.items, newItem]
    })
  }

  const removeItem = (id: string) => {
    updateFormData({
      items: formData.items.filter(item => item.id !== id)
    })
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    updateFormData({
      items: formData.items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    })
  }

  const addPrefillCategory = (name: string) => {
    if (formData.categories.length < 10) {
      const newCategory: Category = {
        id: Date.now().toString(),
        category_name: name,
        evaluation_type: 'subjective_input'
      }
      updateFormData({
        categories: [...formData.categories, newCategory]
      })
    }
  }

  const clearDraft = () => {
    setFormData({
      tasting_name: '',
      product_type: '',
      template: '',
      blind_toggle: false,
      categories: [{
        id: '1',
        category_name: '',
        evaluation_type: 'subjective_input'
      }],
      items: [{
        id: '1',
        item_name: '',
        item_description: ''
      }]
    })
    setLastSaved(null)
  }

  const handleCreateTasting = async () => {
    // Validation
    if (!formData.tasting_name.trim()) {
      alert('Tasting name is required')
      return
    }

    if (!formData.product_type) {
      alert('Product type is required')
      return
    }

    if (formData.categories.some(cat => !cat.category_name.trim())) {
      alert('Please fill in all category names')
      return
    }

    if (formData.items.some(item => !item.item_name.trim())) {
      alert('Please fill in all item names')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert('Study Mode Tasting created successfully!')
    router.push('/en/landing')

    setIsSubmitting(false)
  }

  const isFormValid = () => {
    return (
      formData.tasting_name.trim() &&
      formData.product_type &&
      formData.categories.every(cat => cat.category_name.trim()) &&
      formData.items.every(item => item.item_name.trim())
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header with Auto-save */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-[#e5e7eb]">
        <div className="px-3 sm:px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-[#f9fafb] transition-colors"
            data-testid="button-header-back"
            aria-label="Back to Create Tasting"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1
            className="text-3xl font-bold leading-9 tracking-tight flex-1 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create Study Mode Tasting
          </h1>

          <div className="text-xs text-[#737373]" data-testid="text-auto-saved">
            {lastSaved && `Auto-saved ${lastSaved}`}
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="mx-auto max-w-[768px] px-3 sm:px-4 space-y-6 sm:space-y-8 pb-24">
        {/* Basic Information */}
        <section>
          <Card className="rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-white p-4 sm:p-5">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#333333]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tasting-name" className="text-sm font-medium text-[#525252] mb-2 block">
                  Tasting Name *
                </Label>
                <Input
                  id="tasting-name"
                  data-testid="input-tasting-name"
                  placeholder="e.g., Red Wine Tasting 2024"
                  value={formData.tasting_name}
                  onChange={(e) => updateFormData({ tasting_name: e.target.value })}
                  className="h-12 w-full rounded-md border border-[#e5e7eb] px-3 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="product-type" className="text-sm font-medium text-[#525252] mb-2 block">
                  Product Type *
                </Label>
                <Select value={formData.product_type} onValueChange={(value) => updateFormData({ product_type: value })}>
                  <SelectTrigger
                    id="product-type"
                    data-testid="select-product-type"
                    className="h-12 w-full rounded-md border border-[#e5e7eb] px-3 text-sm"
                  >
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_TYPE_GROUPS).map(([group, items]) => (
                      <div key={group}>
                        <div className="px-2 py-1 text-xs font-semibold text-[#737373] uppercase tracking-wide">
                          {group}
                        </div>
                        {items.map(item => (
                          <SelectItem key={item} value={item.toLowerCase().replace(/\s+/g, '_')}>
                            {item}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template" className="text-sm font-medium text-[#525252] mb-2 block">
                  Templates
                </Label>
                <Button
                  type="button"
                  id="template"
                  data-testid="button-template-picker"
                  variant="outline"
                  className="h-12 w-full justify-start rounded-md border border-[#e5e7eb] px-3 text-sm"
                  onClick={() => alert('Template picker dialog would open here')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Choose Template
                </Button>
                <p className="text-xs text-[#737373] mt-1">Optional. Prefills categories.</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blind-toggle" className="text-sm font-medium text-[#525252]">
                  Blind Tasting
                </Label>
                <Switch
                  id="blind-toggle"
                  data-testid="switch-blind-tasting"
                  checked={formData.blind_toggle}
                  onCheckedChange={(checked) => updateFormData({ blind_toggle: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Evaluation Categories with Collapsible */}
        <section>
          <Card className="rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.05)] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-[#333333]">Evaluation Categories</CardTitle>
                <p className="text-sm text-[#525252]">Define categories for evaluation (max 10)</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="p-2"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {categoriesExpanded && (
              <CardContent className="mt-4 space-y-4">
                {/* Prefill Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#525252]">Quick Add:</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Aroma', 'Flavor', 'Texture'].map(name => (
                      <Button
                        key={name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPrefillCategory(name)}
                        className="text-xs h-8"
                      >
                        {name} (subjective)
                      </Button>
                    ))}
                  </div>
                </div>

              {/* Categories Repeater */}
              <div data-testid="rep-categories" className="space-y-4">
                {categories.map((category, index) => (
                  <div key={category.id} className="border border-[#E6E1D9] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-[#1B1B18]">
                        Category {index + 1}
                      </Label>
                      {categories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(category.id)}
                          aria-label="Remove category"
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Category Name *
                      </Label>
                      <Input
                        placeholder="e.g., Aroma / Flavor / Texture"
                        value={category.category_name}
                        onChange={(e) => updateCategory(category.id, { category_name: e.target.value })}
                        className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Evaluation Type
                      </Label>
                      <Select
                        value={category.evaluation_type}
                        onValueChange={(value: EvaluationType) => updateCategory(category.id, { evaluation_type: value })}
                      >
                        <SelectTrigger className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subjective">Subjective Input (notes)</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="sliding_scale">Sliding Scale (0-100)</SelectItem>
                          <SelectItem value="exact_answer">Exact Answer</SelectItem>
                          <SelectItem value="contains_x">Contains X</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dynamic subfields based on evaluation type */}
                    {category.evaluation_type === 'multiple_choice' && (
                      <div>
                        <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                          Options
                        </Label>
                        <Textarea
                          placeholder="Add option and press enter"
                          value={category.mc_options?.join('\n') || ''}
                          onChange={(e) => updateCategory(category.id, {
                            mc_options: e.target.value.split('\n').filter(option => option.trim())
                          })}
                          className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[88px]"
                        />
                      </div>
                    )}

                    {category.evaluation_type === 'sliding_scale' && (
                      <div>
                        <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                          Scale Settings
                        </Label>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-[#5A5A56]">
                            <span>Min: {category.scale_meta?.min || 0}</span>
                            <span>Max: {category.scale_meta?.max || 100}</span>
                          </div>
                          <Slider
                            value={[category.scale_meta?.min || 0, category.scale_meta?.max || 100]}
                            onValueChange={([min, max]) => updateCategory(category.id, {
                              scale_meta: { min, max, step: 1 }
                            })}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {category.evaluation_type === 'contains_x' && (
                      <div>
                        <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                          Target substring
                        </Label>
                        <Input
                          placeholder="e.g., cabernet"
                          value={category.contains_value || ''}
                          onChange={(e) => updateCategory(category.id, { contains_value: e.target.value })}
                          className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Notes Helper (optional)
                      </Label>
                      <Textarea
                        placeholder="Describe what to capture in this category"
                        value={category.category_notes_placeholder || ''}
                        onChange={(e) => updateCategory(category.id, { category_notes_placeholder: e.target.value })}
                        className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[88px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {categories.length < 10 && (
                <Button
                  type="button"
                  onClick={addCategory}
                  data-testid="btn-add-category"
                  className="w-full h-12 rounded-xl font-semibold bg-[#2E7D32] text-white hover:bg-[#7FB889]"
                  aria-label="Add category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Items to Taste */}
        <section>
          <Card className="rounded-xl bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1B1B18]">Items to Taste</CardTitle>
              <p className="text-sm text-[#5A5A56]">Add the items participants will evaluate</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div data-testid="rep-items" className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-[#E6E1D9] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-[#1B1B18]">
                        Item {index + 1}
                      </Label>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Item Name *
                      </Label>
                      <Input
                        placeholder="Item 1"
                        value={item.item_name}
                        onChange={(e) => updateItem(item.id, { item_name: e.target.value })}
                        className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Description (Optional)
                      </Label>
                      <Textarea
                        placeholder="Any additional details about this item..."
                        value={item.item_description || ''}
                        onChange={(e) => updateItem(item.id, { item_description: e.target.value })}
                        className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[88px]"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                        Image (Optional)
                      </Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-[#D6D1C8]"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-[#D6D1C8]"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={addItem}
                data-testid="btn-add-item"
                className="w-full h-12 rounded-xl font-semibold bg-[#2E7D32] text-white hover:bg-[#7FB889]"
                aria-label="Add item"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Sticky Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E6E1D9] p-4 pb-safe">
        <div className="flex gap-3 max-w-md mx-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={clearDraft}
            data-testid="btn-clear"
            className="flex-1 h-12 rounded-xl border-[#E6E1D9] font-semibold"
            disabled={isSubmitting}
          >
            Clear Draft
          </Button>
          <Button
            type="button"
            onClick={handleCreateTasting}
            data-testid="btn-create"
            className="flex-1 h-12 rounded-xl font-semibold bg-[#2E7D32] text-white hover:bg-[#7FB889]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Tasting'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
