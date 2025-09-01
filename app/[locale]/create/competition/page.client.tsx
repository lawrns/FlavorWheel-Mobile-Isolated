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
  FileText, Sliders, CheckSquare, Type, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreateShell, CreateHeader, CreateFooterActions } from '@/components/create'

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

  const validateAndFocusFirstError = () => {
    // Check competition name
    if (!formData.competition_name.trim()) {
      const nameInput = document.getElementById('competition_name')
      if (nameInput) {
        nameInput.focus()
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return 'Competition name is required'
    }

    // Check product type
    if (!formData.product_type) {
      const productSelect = document.querySelector('[data-testid="select-product-type"]')
      if (productSelect) {
        productSelect.focus()
        productSelect.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return 'Product type is required'
    }

    // Check category names
    for (let i = 0; i < formData.categories.length; i++) {
      if (!formData.categories[i].category_name.trim()) {
        const categoryInput = document.querySelector(`input[placeholder*="Category ${i + 1}"]`) ||
                             document.querySelector(`input[placeholder*="Aroma"]`)
        if (categoryInput) {
          categoryInput.focus()
          categoryInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return `Category ${i + 1} name is required`
      }
    }

    // Check item names
    for (let i = 0; i < formData.items.length; i++) {
      if (!formData.items[i].item_name.trim()) {
        const itemInput = document.querySelector(`input[placeholder*="Item ${i + 1}"]`)
        if (itemInput) {
          itemInput.focus()
          itemInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return `Item ${i + 1} name is required`
      }
    }

    // Validate preloaded answers for ranking categories
    const rankingCategories = formData.categories.filter(cat => cat.include_in_ranking)
    for (const category of rankingCategories) {
      for (const item of formData.items) {
        const preloadedAnswer = item.preloaded_answers?.[category.id]
        if (!preloadedAnswer) {
          // Find the preloaded answer input for this item and category
          const answerInput = document.querySelector(`[data-category-id="${category.id}"][data-item-id="${item.id}"]`)
          if (answerInput) {
            answerInput.focus()
            answerInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          return `Missing preloaded answer for "${item.item_name}" in category "${category.category_name}"`
        }
      }
    }

    return null
  }

  const handleCreateCompetition = async () => {
    const validationError = validateAndFocusFirstError()
    if (validationError) {
      // Could set a status message here if needed
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create draft tasting using existing logic
      router.push('/en/landing')
    } catch (error) {
      console.error('Failed to create competition:', error)
      // Could set error status message here
    } finally {
      setIsSubmitting(false)
    }
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
    <CreateShell
      header={
        <CreateHeader
          title="Competition"
          onBack={() => router.back()}
          status={lastSaved ? 'saved' : null}
        />
      }
      className="pb-20"
    >

      {/* Main Content */}
      <div className="mx-auto max-w-[768px] px-3 sm:px-4 space-y-6 sm:space-y-8">
        {/* Basic Information */}
        <section id="basic_info">
          <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-fx-text">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="competition_name" className="text-sm font-medium text-fx-text2 mb-2 block">
                  Competition Name *
                </Label>
                <Input
                  id="competition_name"
                  data-testid="input-competition-name"
                  placeholder="e.g., Wine Competition 2024"
                  value={formData.competition_name}
                  onChange={(e) => updateFormData({ competition_name: e.target.value })}
                  className="min-h-[48px] w-full rounded-lg border border-[#D6D1C8] bg-white px-3 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-fx-text2 mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  data-testid="textarea-description"
                  placeholder="Optional description of your competition"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className="min-h-[80px] w-full rounded-lg border border-[#D6D1C8] bg-white px-3 py-3 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="product_type" className="text-sm font-medium text-fx-text2 mb-2 block">
                  Product Type *
                </Label>
                <ProductTypeSelect
                  value={formData.product_type}
                  onChange={(value) => updateFormData({ product_type: value })}
                  data-testid="select-product-type"
                />
              </div>

              <div>
                <Label htmlFor="template" className="text-sm font-medium text-fx-text2 mb-2 block">
                  Templates
                </Label>
                      <Button
                        type="button"
                  id="template_picker"
                  data-testid="button-template-picker"
                        variant="outline"
                  className="min-h-[48px] w-full justify-start rounded-lg border border-[#D6D1C8] bg-white px-3 text-sm"
                  onClick={() => alert('Template picker dialog would open here')}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                  Choose Template
                      </Button>
                <p className="text-xs text-fx-muted mt-1">Optional. Prefills categories.</p>
                          </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blind_toggle" className="text-sm font-medium text-fx-text2">
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
          <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
            <Collapsible defaultOpen={false}>
                      <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-fx-text">Evaluation Categories</CardTitle>
                  <p className="text-sm text-fx-text2">Define categories for evaluation (max 10)</p>
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
                    <Label className="text-sm font-medium text-fx-text2">Quick Add:</Label>
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
                          className="text-xs min-h-[32px] rounded-lg border border-[#D6D1C8] bg-white"
                        >
                          {name} ({type.replace('_', ' ')})
                        </Button>
                      ))}
                      </div>
              </div>

                  {/* Categories Repeater */}
                  <div data-testid="repeater-categories" className="space-y-4">
                  {formData.categories.map((category, index) => (
                    <div key={category.id} className="border border-fx-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-fx-text">
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
                      <Label className="text-sm font-semibold text-fx-text mb-2 block">
                        Category Name *
                      </Label>
                          <Input
                          placeholder="e.g., Aroma / Flavor / Texture"
                          value={category.category_name}
                          onChange={(e) => updateCategory(category.id, { category_name: e.target.value })}
                          className="w-full min-h-[48px] rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                          required
                          />
                        </div>

                        <div>
                        <Label className="text-sm font-semibold text-fx-text mb-2 block">
                          Evaluation Type
                        </Label>
                        <Select
                          value={category.evaluation_type}
                          onValueChange={(value: EvaluationType) => updateCategory(category.id, { evaluation_type: value })}
                        >
                          <SelectTrigger className="w-full min-h-[48px] rounded-lg border-[#D6D1C8] bg-white p-3 text-sm">
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
                        <Label className="text-sm font-semibold text-fx-text">
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
          <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
            <Collapsible defaultOpen={false}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-fx-text">Items to Taste</CardTitle>
                  <p className="text-sm text-fx-text2">Pre-load items and correct answers</p>
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
                  <div key={item.id} className="border border-fx-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold text-fx-text">
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
                      <Label className="text-sm font-semibold text-fx-text mb-2 block">
                        Item Name *
                      </Label>
                          <Input
                        placeholder="Item 1"
                        value={item.item_name}
                        onChange={(e) => updateItem(item.id, { item_name: e.target.value })}
                        className="w-full min-h-[48px] rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
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

        {/* Footer Actions - Non-sticky, integrated into page flow */}
        <section className="mt-8">
          <CreateFooterActions
            primaryLabel="Create Competition"
            onPrimary={handleCreateCompetition}
            secondaryLabel="Cancel"
            onSecondary={() => router.back()}
            disabled={!isFormValid()}
            busy={isSubmitting}
            statusMessage={isSubmitting ? 'Creating competition...' : undefined}
          />
        </section>
      </div>
    </CreateShell>
  )
}
