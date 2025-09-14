'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Camera, Upload, ChevronDown, X, Sparkles, FileText, Sliders, CheckSquare, Type, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductTypeSelect from '@/components/ProductTypeSelect'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { AppShell } from '@/components/app-shell'


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
  tasting_photo?: string
}



// Evaluation type options
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

  // Enhanced screen states for tasting flow
  const [currentScreen, setCurrentScreen] = useState<'create' | 'confirm' | 'input' | 'complete'>('create')
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [inviteEmails, setInviteEmails] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [isAddAsYouGoMode, setIsAddAsYouGoMode] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  // Template definitions
  const templates = [
    {
      id: 'wine-basic',
      name: 'Basic Wine Tasting',
      description: 'Essential categories for wine evaluation',
      categories: [
        { category_name: 'Appearance', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Aroma', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Flavor', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Body', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Light', 'Medium', 'Full'] },
        { category_name: 'Acidity', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Low', 'Medium', 'High'] },
        { category_name: 'Tannins', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Low', 'Medium', 'High'] },
        { category_name: 'Overall Rating', evaluation_type: 'sliding_scale' as EvaluationType, scale_meta: { min: 1, max: 10, step: 1 } }
      ]
    },
    {
      id: 'beer-comprehensive',
      name: 'Comprehensive Beer Tasting',
      description: 'Detailed evaluation for beer analysis',
      categories: [
        { category_name: 'Appearance', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Aroma', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Head Retention', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Poor', 'Fair', 'Good', 'Excellent'] },
        { category_name: 'Flavor Profile', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Bitterness', evaluation_type: 'sliding_scale' as EvaluationType, scale_meta: { min: 1, max: 10, step: 1 } },
        { category_name: 'Sweetness', evaluation_type: 'sliding_scale' as EvaluationType, scale_meta: { min: 1, max: 10, step: 1 } },
        { category_name: 'Body', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Thin', 'Medium', 'Full'] },
        { category_name: 'Overall Rating', evaluation_type: 'sliding_scale' as EvaluationType, scale_meta: { min: 1, max: 10, step: 1 } }
      ]
    },
    {
      id: 'coffee-simple',
      name: 'Simple Coffee Tasting',
      description: 'Basic categories for coffee evaluation',
      categories: [
        { category_name: 'Aroma', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Body', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Light', 'Medium', 'Heavy'] },
        { category_name: 'Acidity', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Low', 'Medium', 'High'] },
        { category_name: 'Sweetness', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Dry', 'Balanced', 'Sweet'] },
        { category_name: 'Bitterness', evaluation_type: 'multiple_choice' as EvaluationType, mc_options: ['Low', 'Medium', 'High'] },
        { category_name: 'Aftertaste', evaluation_type: 'subjective_input' as EvaluationType },
        { category_name: 'Overall Rating', evaluation_type: 'sliding_scale' as EvaluationType, scale_meta: { min: 1, max: 10, step: 1 } }
      ]
    }
  ]

  // Template selection handler
  const selectTemplate = (templateId: string) => {
    const selectedTemplate = templates.find(t => t.id === templateId)
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        categories: selectedTemplate.categories.map((cat, index) => ({
          id: (index + 1).toString(),
          category_name: cat.category_name,
          evaluation_type: cat.evaluation_type,
          mc_options: cat.mc_options,
          scale_meta: cat.scale_meta,
          contains_value: (cat as any).contains_value || '',
          category_notes_placeholder: (cat as any).category_notes_placeholder || ''
        }))
      }))
      setShowTemplatePicker(false)
    }
  }

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

  const validateAndFocusFirstError = () => {
    // Check tasting name
    if (!formData.tasting_name.trim()) {
      const nameInput = document.getElementById('tasting-name')
      if (nameInput) {
        nameInput.focus()
        nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return 'Tasting name is required'
    }

    // Check product type
    if (!formData.product_type) {
      const productSelect = document.querySelector('[data-testid="select-product-type"]')
      if (productSelect) {
        (productSelect as HTMLElement).focus()
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
          (categoryInput as HTMLInputElement).focus()
          categoryInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        return `Category ${i + 1} name is required`
      }
    }

    // Check item names (only if not in add-as-you-go mode)
    if (!isAddAsYouGoMode) {
      for (let i = 0; i < formData.items.length; i++) {
        if (!formData.items[i].item_name.trim()) {
          const itemInput = document.querySelector(`input[placeholder*="Item ${i + 1}"]`)
          if (itemInput) {
            (itemInput as HTMLInputElement).focus()
            itemInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          return `Item ${i + 1} name is required`
        }
      }
    }

    return null
  }

  const handleCreateTasting = async () => {
    const validationError = validateAndFocusFirstError()
    if (validationError) {
      // Could set a status message here if needed
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to confirmation screen
      setCurrentScreen('confirm')
    } catch (error) {
      console.error('Failed to create tasting:', error)
      // Could set error status message here
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const hasBasicInfo = formData.tasting_name.trim() && formData.product_type
    const hasValidCategories = formData.categories.every(cat => cat.category_name.trim())

    // Items are optional in add-as-you-go mode
    const hasValidItems = isAddAsYouGoMode || formData.items.every(item => item.item_name.trim())

    return hasBasicInfo && hasValidCategories && hasValidItems
  }

  return (
    <AppShell
      showNavigation
      showMobileNav
      maxWidth="create"
      backgroundStyle="fx-bg"
      contentContainer
      header={
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-card-text-primary hover:text-card-text-secondary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-semibold text-card-text-primary">Study Session</h1>
          <div className="w-16"></div>
          {lastSaved && (
            <div className="text-xs text-green-600">Auto-saved</div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between p-4 border-t bg-white">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-card-text-secondary hover:text-card-text-primary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTasting}
            disabled={!isFormValid() || isSubmitting}
            className="px-6 py-2 bg-fx-primary text-white rounded-lg hover:bg-fx-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Study'}
          </button>
        </div>
      }
    >

      {/* Enhanced Main Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <section>
          <Card variant="elevated" className="rounded-xl bg-white shadow-fx border border-card-border p-4 sm:p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-fx-text font-heading">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tasting-name" className="text-sm font-medium text-fx-text2 mb-2 block">
                  Tasting Name *
                </Label>
                <Input
                  id="tasting-name"
                  data-testid="input-tasting-name"
                  placeholder="e.g., Red Wine Tasting 2024"
                  value={formData.tasting_name}
                  onChange={(e) => updateFormData({ tasting_name: e.target.value })}
                  className="min-h-[48px] w-full rounded-lg border border-card-border bg-white px-3 text-sm text-fx-text placeholder:text-fx-muted focus-enhanced form-input"
                  required
                />
              </div>

              <div>
                <Label htmlFor="product-type" className="text-sm font-medium text-fx-text2 mb-2 block">
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
                  id="template"
                  data-testid="button-template-picker"
                  variant="outline"
                  className="min-h-[48px] w-full justify-start rounded-lg border border-card-border bg-white px-3 text-sm text-fx-text hover:bg-fx-bg focus-enhanced hover-lift"
                  onClick={() => setShowTemplatePicker(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Choose Template
                </Button>
                <p className="text-xs text-fx-muted mt-1">Optional. Prefills categories.</p>
              </div>

              {/* Template Picker Dialog */}
              <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Choose a Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-card-text-secondary">
                      Select a template to automatically add evaluation categories to your tasting session.
                    </p>
                    <div className="grid gap-4">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => selectTemplate(template.id)}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              {template.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-card-text-secondary mb-3">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {template.categories.slice(0, 4).map((category, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium"
                                >
                                  {category.category_name}
                                </span>
                              ))}
                              {template.categories.length > 4 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium">
                                  +{template.categories.length - 4} more
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setShowTemplatePicker(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center justify-between">
                <Label htmlFor="blind-toggle" className="text-sm font-medium text-fx-text2">
                  Blind Tasting
                </Label>
                <Switch
                  id="blind-toggle"
                  data-testid="switch-blind-tasting"
                  checked={formData.blind_toggle}
                  onCheckedChange={(checked) => updateFormData({ blind_toggle: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="add-as-you-go-toggle" className="text-sm font-medium text-fx-text2">
                    Add Items As You Go
                  </Label>
                  <p className="text-xs text-fx-muted mt-1">Allow participants to add tasting items during the session</p>
                </div>
                <Switch
                  id="add-as-you-go-toggle"
                  data-testid="switch-add-as-you-go"
                  checked={isAddAsYouGoMode}
                  onCheckedChange={setIsAddAsYouGoMode}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tasting Photo */}
        <section>
          <Card variant="elevated" className="rounded-xl bg-white shadow-fx border border-card-border p-4 sm:p-5">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-fx-text font-heading">Tasting Photo</CardTitle>
              <p className="text-sm text-fx-text2 mt-1">Add a photo for your tasting session</p>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotoUploaded={(url) => updateFormData({ tasting_photo: url })}
                onPhotoRemoved={() => updateFormData({ tasting_photo: undefined })}
                currentPhotoUrl={formData.tasting_photo}
                userId="mock-user-id" // Replace with actual user ID from auth
                folder="tastings"
                maxPhotos={1}
                className="w-full"
              />
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Evaluation Categories with Collapsible */}
        <section>
          <Card variant="elevated" className="rounded-xl bg-white shadow-soft border border-card-border p-4 sm:p-5 hover-lift card-enter">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-fx-text font-heading">Evaluation Categories</CardTitle>
                <p className="text-sm text-fx-text2 mt-1">Define categories for evaluation (max 10)</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="p-2 rounded-lg hover:bg-fx-bg focus-enhanced"
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {categoriesExpanded && (
              <CardContent className="mt-4 space-y-4">
                {/* Prefill Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-fx-text2">Quick Add:</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Aroma', 'Flavor', 'Texture'].map(name => (
                      <Button
                        key={name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPrefillCategory(name)}
                        className="text-xs min-h-[32px] rounded-lg border border-[#D6D1C8] bg-white"
                      >
                        {name} (subjective)
                      </Button>
                    ))}
                  </div>
                </div>

              {/* Categories Repeater */}
              <div data-testid="rep-categories" className="space-y-4">
                {formData.categories.map((category, index) => (
                  <div key={category.id} className="border border-card-border rounded-lg p-4 space-y-3">
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
                        <Label className="text-sm font-semibold text-fx-text mb-2 block">
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
                        <Label className="text-sm font-semibold text-fx-text mb-2 block">
                          Scale Settings
                        </Label>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-fx-text2">
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
                        <Label className="text-sm font-semibold text-fx-text mb-2 block">
                          Target substring
                        </Label>
                        <Input
                          placeholder="e.g., cabernet"
                          value={category.contains_value || ''}
                          onChange={(e) => updateCategory(category.id, { contains_value: e.target.value })}
                          className="w-full min-h-[48px] rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-semibold text-fx-text mb-2 block">
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
                  data-testid="btn-add-category"
                  className="w-full min-h-[48px] rounded-xl font-semibold bg-fx-primary text-white hover:bg-fx-primaryHover focus-enhanced btn-primary"
                  aria-label="Add category"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </CardContent>
            )}
          </Card>
        </section>

        {/* Items to Taste */}
        <section>
          <Card variant="elevated" className="rounded-xl bg-white shadow-soft border border-card-border p-4 sm:p-5 hover-lift card-enter">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-fx-text font-heading">
                Items to Taste
                {isAddAsYouGoMode && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Add-as-you-go enabled
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-fx-text2 mt-1">
                {isAddAsYouGoMode
                  ? "Pre-add items or leave empty to add them during the tasting session"
                  : "Add the items participants will evaluate"
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div data-testid="rep-items" className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="border border-card-border rounded-lg p-4 space-y-3">
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
                      <Label className="text-sm font-semibold text-fx-text mb-2 block">
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
                      <Label className="text-sm font-semibold text-fx-text mb-2 block">
                        Image (Optional)
                      </Label>
                      <PhotoUpload
                        onPhotoUploaded={(url) => updateItem(item.id, { item_image: url })}
                        onPhotoRemoved={() => updateItem(item.id, { item_image: undefined })}
                        currentPhotoUrl={item.item_image}
                        userId="mock-user-id" // Replace with actual user ID from auth
                        folder="tasting-items"
                        maxPhotos={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

                          <Button
              type="button"
              onClick={addItem}
              data-testid="btn-add-item"
              className="w-full min-h-[48px] rounded-xl font-semibold bg-fx-primary text-white hover:bg-fx-primaryHover focus-enhanced btn-primary"
              aria-label="Add item"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer Actions - Moved to footer prop */}
      </div>
    </AppShell>
  )
}
