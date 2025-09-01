'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import ProductTypeSelect from '@/components/ProductTypeSelect'
import {
  Plus, Minus, Camera, Upload, ChevronDown, X, Sparkles,
  FileText, Sliders, CheckSquare, Type, Search, ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types matching the specification
type EvaluationType = 'subjective_input' | 'multiple_choice' | 'sliding_scale' | 'exact_answer' | 'contains_x'

interface Category {
  id: string
  category_name: string
  evaluation_type: EvaluationType
  mc_options?: string[]
  scale_meta?: { min: number; max: number; step: number }
  contains_value?: string
  category_notes_placeholder?: string
  include_in_ranking: boolean
}

interface Item {
  id: string
  item_name: string
  item_description?: string
  item_image?: string
  preloaded_answers?: {
    [categoryId: string]: any
  }
}

interface FormData {
  competition_name: string
  description: string
  product_type: string
  template: string
  blind_toggle: boolean
  categories: Category[]
  items: Item[]
}





// Evaluation type options
const EVALUATION_TYPE_OPTIONS = [
  { value: 'subjective_input', label: 'Subjective Input', icon: FileText },
  { value: 'sliding_scale', label: 'Sliding Scale', icon: Sliders },
  { value: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
  { value: 'exact_answer', label: 'Exact Answer', icon: Type },
  { value: 'contains_x', label: 'Contains X', icon: Search }
]

export default function CreateCompetitionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    competition_name: '',
      description: '',
    product_type: '',
    template: '',
    blind_toggle: false,
    categories: [{
      id: '1',
      category_name: '',
      evaluation_type: 'subjective_input',
      include_in_ranking: true
    }],
    items: [{
      id: '1',
      item_name: '',
      item_description: ''
    }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [categoriesExpanded, setCategoriesExpanded] = useState(true)

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
        evaluation_type: 'subjective_input',
        include_in_ranking: true
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

  const clearDraft = () => {
    setFormData({
      competition_name: '',
      description: '',
      product_type: '',
      template: '',
      blind_toggle: false,
      categories: [{
        id: '1',
        category_name: '',
        evaluation_type: 'subjective_input',
        include_in_ranking: true
      }],
      items: [{
        id: '1',
        item_name: '',
        item_description: ''
      }]
    })
    setLastSaved(null)
  }

  const handleCreateCompetition = async () => {
    // Validation
    if (!formData.competition_name.trim()) {
      alert('Competition name is required')
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

    // Validate preloaded answers for ranking categories
    const rankingCategories = formData.categories.filter(cat => cat.include_in_ranking)
    for (const category of rankingCategories) {
      for (const item of formData.items) {
        const preloadedAnswer = item.preloaded_answers?.[category.id]
        if (!preloadedAnswer) {
          alert(`Missing preloaded answer for "${item.item_name}" in category "${category.category_name}"`)
          return
        }
      }
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert('Competition Mode Tasting created successfully!')
    router.push('/en/landing')

    setIsSubmitting(false)
  }

  const addPrefillCategory = (name: string, type: EvaluationType) => {
    if (formData.categories.length < 10) {
      const newCategory: Category = {
        id: Date.now().toString(),
        category_name: name,
        evaluation_type: type,
        include_in_ranking: true
      }
      updateFormData({
        categories: [...formData.categories, newCategory]
      })
    }
  }

  const renderPreloadedAnswerField = (category: Category, item: Item) => {
    const currentValue = item.preloaded_answers?.[category.id] || ''

    switch (category.evaluation_type) {
      case 'multiple_choice':
        return (
          <Select
            value={currentValue}
            onValueChange={(value) => {
              const newAnswers = { ...item.preloaded_answers, [category.id]: value }
              updateItem(item.id, { preloaded_answers: newAnswers })
            }}
          >
            <SelectTrigger className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[44px]">
              <SelectValue placeholder="Select correct answer" />
            </SelectTrigger>
            <SelectContent>
              {category.mc_options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'exact_answer':
        return (
          <Input
            placeholder="Enter the correct answer"
            value={currentValue}
            onChange={(e) => {
              const newAnswers = { ...item.preloaded_answers, [category.id]: e.target.value }
              updateItem(item.id, { preloaded_answers: newAnswers })
            }}
            className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[44px]"
          />
        )

      case 'sliding_scale':
        return (
          <Input
            type="number"
            placeholder={`Expected value (${category.scale_meta?.min || 0}-${category.scale_meta?.max || 100})`}
            value={currentValue}
            onChange={(e) => {
              const newAnswers = { ...item.preloaded_answers, [category.id]: e.target.value }
              updateItem(item.id, { preloaded_answers: newAnswers })
            }}
            min={category.scale_meta?.min || 0}
            max={category.scale_meta?.max || 100}
            className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[44px]"
          />
        )

      case 'contains_x':
        return (
          <Input
            placeholder={`Text must contain: ${category.contains_value || 'specific term'}`}
            value={currentValue}
            onChange={(e) => {
              const newAnswers = { ...item.preloaded_answers, [category.id]: e.target.value }
              updateItem(item.id, { preloaded_answers: newAnswers })
            }}
            className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[44px]"
          />
        )

      case 'subjective_input':
        return (
          <Textarea
            placeholder="Expected subjective response or key points"
            value={currentValue}
            onChange={(e) => {
              const newAnswers = { ...item.preloaded_answers, [category.id]: e.target.value }
              updateItem(item.id, { preloaded_answers: newAnswers })
            }}
            className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm min-h-[88px]"
          />
        )

      default:
        return null
    }
  }

  const isFormValid = () => {
    const hasName = formData.competition_name.trim()
    const hasProductType = formData.product_type
    const hasValidCategories = formData.categories.every(cat => cat.category_name.trim())
    const hasValidItems = formData.items.every(item => item.item_name.trim())

    // Check if ranking categories have preloaded answers
    const rankingCategories = formData.categories.filter(cat => cat.include_in_ranking)
    const hasRankingAnswers = rankingCategories.every(category =>
      formData.items.every(item => item.preloaded_answers?.[category.id])
    )

    return hasName && hasProductType && hasValidCategories && hasValidItems && hasRankingAnswers
  }
  return (
    <div className="min-h-screen bg-[#FAF7F0]">
        {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-[#E6E1D9]">
        <div className="px-3 sm:px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-[#f9fafb] transition-colors"
            aria-label="Back"
            data-testid="btn_back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Competition
            </h1>
            <p className="text-sm text-[#5A5A56]">Structured competition with scoring and ranking</p>
          </div>

          <div className="text-xs text-[#737373]" data-testid="auto_save_indicator">
            {lastSaved && `Auto-saved ${lastSaved}`}
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[768px] px-3 sm:px-4 space-y-6 sm:space-y-8 pb-24">
        {/* Basic Information */}
        <section id="basic_info">
          <Card className="rounded-[16px] bg-white shadow-md p-4 sm:p-5">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1B1B18]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="competition_name" className="text-sm font-medium text-[#525252] mb-2 block">
                  Competition Name *
                </Label>
                <Input
                  id="competition_name"
                  data-testid="input-competition-name"
                  placeholder="e.g., Wine Competition 2024"
                  value={formData.competition_name}
                  onChange={(e) => updateFormData({ competition_name: e.target.value })}
                  className="h-12 w-full rounded-md border border-[#E6E1D9] px-3 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-[#525252] mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  data-testid="textarea-description"
                  placeholder="Optional description of your competition"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className="min-h-[80px] w-full rounded-md border border-[#E6E1D9] px-3 py-3 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="product_type" className="text-sm font-medium text-[#525252] mb-2 block">
                  Product Type *
                </Label>
                <ProductTypeSelect
                  value={formData.product_type}
                  onChange={(value) => updateFormData({ product_type: value })}
                  data-testid="select-product-type"
                />
              </div>

              <div>
                <Label htmlFor="template" className="text-sm font-medium text-[#525252] mb-2 block">
                  Templates
                </Label>
                      <Button
                        type="button"
                  id="template_picker"
                  data-testid="button-template-picker"
                        variant="outline"
                  className="h-12 w-full justify-start rounded-md border border-[#E6E1D9] px-3 text-sm"
                  onClick={() => alert('Template picker dialog would open here')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                  Choose Template
                      </Button>
                <p className="text-xs text-[#5A5A56] mt-1">Optional. Prefills categories.</p>
                          </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blind_toggle" className="text-sm font-medium text-[#525252]">
                  Blind Tasting
                </Label>
                <Switch
                  id="blind_toggle"
                  data-testid="switch-blind-tasting"
                  checked={formData.blind_toggle}
                  onCheckedChange={(checked) => updateFormData({ blind_toggle: checked })}
                  className="h-6 w-11"
                />
                                </div>
                              </CardContent>
                            </Card>
        </section>

        {/* Evaluation Categories */}
        <section id="evaluation_categories">
          <Card className="rounded-[16px] bg-white shadow-md p-4 sm:p-5">
            <Collapsible defaultOpen={false}>
                      <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-[#1B1B18]">Evaluation Categories</CardTitle>
                  <p className="text-sm text-[#5A5A56]">Define categories for evaluation (max 10)</p>
                </div>
                <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                    className="p-2"
                    aria-label="Toggle categories section"
                        >
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="mt-4 space-y-4">
                  {/* Prefill Options */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#525252]">Quick Add:</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Variety', type: 'multiple_choice' as const },
                        { name: 'Region', type: 'exact_answer' as const },
                        { name: 'Aroma', type: 'subjective_input' as const }
                      ].map(({ name, type }) => (
                        <Button
                          key={name}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPrefillCategory(name, type)}
                          className="text-xs h-8"
                        >
                          {name} ({type.replace('_', ' ')})
                        </Button>
                      ))}
                      </div>
              </div>

                  {/* Categories Repeater */}
                  <div data-testid="repeater-categories" className="space-y-4">
                  {formData.categories.map((category, index) => (
                    <div key={category.id} className="border border-[#E6E1D9] rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-[#1B1B18]">
                          Category {index + 1}
                        </Label>
                        {formData.categories.length > 1 && (
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
                            {EVALUATION_TYPE_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="h-4 w-4" />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
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

                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-[#1B1B18]">
                          Include in ranking
                        </Label>
                          <Switch
                          checked={category.include_in_ranking}
                          onCheckedChange={(checked) => updateCategory(category.id, { include_in_ranking: checked })}
                          />
                        </div>

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

                  {formData.categories.length < 10 && (
                <Button
                  type="button"
                  onClick={addCategory}
                      data-testid="button-add-category"
                      variant="outline"
                      className="w-full h-12 rounded-xl border border-[#E6E1D9] font-semibold"
                      disabled={formData.categories.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
                  )}
              </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </section>

          {/* Items to Taste */}
        <section id="items_to_taste">
          <Card className="rounded-[16px] bg-white shadow-md p-4 sm:p-5">
            <Collapsible defaultOpen={false}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-[#1B1B18]">Items to Taste</CardTitle>
                  <p className="text-sm text-[#5A5A56]">Pre-load items and correct answers</p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    aria-label="Toggle items section"
                  >
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="mt-4 space-y-4">
                  <div data-testid="repeater-items" className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="border border-[#E6E1D9] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-[#1B1B18]">
                        Item {index + 1}
                      </Label>
                      {formData.items.length > 1 && (
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

                    {/* Pre-loaded Answers */}
                    <div className="border-t border-[#E6E1D9] pt-4">
                      <Label className="text-sm font-semibold text-[#1B1B18] mb-3 block">
                        Pre-loaded Data
                      </Label>
                          <div className="space-y-3">
                        {formData.categories.filter(cat => cat.include_in_ranking).map((category) => (
                          <div key={category.id} className="p-3 bg-[#F4F1EC] rounded-lg">
                            <Label className="text-sm font-medium text-[#1B1B18] mb-2 block">
                              {category.category_name}
                            </Label>
                            {renderPreloadedAnswerField(category, item)}
                                  </div>
                        ))}
                              </div>
                          </div>
                        </div>
                ))}
              </div>

                <Button
                  type="button"
                  onClick={addItem}
                    data-testid="button-add-item"
                    variant="outline"
                    className="w-full h-12 rounded-xl border border-[#E6E1D9] font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </section>
      </main>

      {/* Footer Actions */}
      <section id="footer_actions">
        <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-[#E6E1D9] p-4 pb-safe">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              data-testid="button-cancel"
              className="flex-1 h-12 rounded-xl font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={clearDraft}
              data-testid="button-clear-draft"
              variant="outline"
              className="flex-1 h-12 rounded-xl border-[#E6E1D9] font-semibold"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Draft
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              onClick={handleCreateCompetition}
              data-testid="button-create-competition"
              className="flex-1 h-12 rounded-xl font-semibold bg-[#2E7D32] text-white hover:bg-[#256a29]"
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Creating...' : 'Create Competition'}
            </Button>
          </div>
      </div>
      </section>
    </div>
  )
}
