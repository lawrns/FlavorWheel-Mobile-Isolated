'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Camera, Upload, ChevronDown, X, Sparkles, FileText, Sliders, CheckSquare, Type, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProductTypeSelect from '@/components/ProductTypeSelect'
import { CreateShell, CreateHeader, CreateFooterActions } from '@/components/create'


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

      // Create draft tasting using existing logic
      router.push('/en/landing')
    } catch (error) {
      console.error('Failed to create tasting:', error)
      // Could set error status message here
    } finally {
      setIsSubmitting(false)
    }
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
    <CreateShell
      header={
        <CreateHeader
          title="Study Session"
          onBack={() => router.back()}
          status={lastSaved ? 'saved' : null}
        />
      }
      footer={
        <CreateFooterActions
          primaryLabel="Create Study"
          onPrimary={handleCreateTasting}
          secondaryLabel="Cancel"
          onSecondary={() => router.back()}
          disabled={!isFormValid()}
          busy={isSubmitting}
          statusMessage={isSubmitting ? 'Creating tasting...' : undefined}
        />
      }
    >

      {/* Enhanced Main Content */}
      <div className="space-y-6">
        {/* Basic Information */}
        <section>
          <Card className="rounded-xl bg-white shadow-fx border border-fx-border p-4 sm:p-5">
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
                  className="min-h-[48px] w-full rounded-lg border border-fx-border bg-white px-3 text-sm text-fx-text placeholder:text-fx-muted focus-enhanced form-input"
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
                  className="min-h-[48px] w-full justify-start rounded-lg border border-fx-border bg-white px-3 text-sm text-fx-text hover:bg-fx-bg focus-enhanced hover-lift"
                  onClick={() => alert('Template picker dialog would open here')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Choose Template
                </Button>
                <p className="text-xs text-fx-muted mt-1">Optional. Prefills categories.</p>
              </div>

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
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Evaluation Categories with Collapsible */}
        <section>
          <Card className="rounded-xl bg-white shadow-soft border border-fx-border p-4 sm:p-5 hover-lift card-enter">
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
          <Card className="rounded-xl bg-white shadow-soft border border-fx-border p-4 sm:p-5 hover-lift card-enter">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-fx-text font-heading">Items to Taste</CardTitle>
              <p className="text-sm text-fx-text2 mt-1">Add the items participants will evaluate</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div data-testid="rep-items" className="space-y-4">
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
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 min-h-[48px] rounded-xl border-[#D6D1C8] bg-white"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 min-h-[48px] rounded-xl border-[#D6D1C8] bg-white"
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
              className="w-full min-h-[48px] rounded-xl font-semibold bg-fx-primary text-white hover:bg-fx-primaryHover focus-enhanced btn-primary"
              aria-label="Add item"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            </CardContent>
          </Card>
        </section>

        {/* Footer Actions - Static */}
        <CreateFooterActions
          primaryLabel="Create Study"
          onPrimary={handleCreateTasting}
          secondaryLabel="Cancel"
          onSecondary={() => router.back()}
          disabled={!isFormValid()}
          busy={isSubmitting}
          statusMessage={isSubmitting ? 'Creating tasting...' : undefined}
        />
      </div>
    </CreateShell>
  )
}
