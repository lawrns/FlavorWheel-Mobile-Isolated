'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Minus, Camera, Upload, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

// Types based on the JSON specification
type EvaluationType = 'subjective' | 'multiple_choice' | 'sliding_scale' | 'exact_answer' | 'contains_x'

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

const PRODUCT_TYPES = [
  { value: 'wine', label: 'Wine' },
  { value: 'beer', label: 'Beer' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'spirits', label: 'Spirits' },
  { value: 'tea', label: 'Tea' },
  { value: 'other', label: 'Other' }
]

const TEMPLATES = [
  { value: 'sca_coffee', label: 'SCA Coffee Tasting' },
  { value: 'cms_wine', label: 'CMS Wine Tasting' },
  { value: 'bjcp_beer', label: 'BJCP Beer Evaluation' },
  { value: 'none', label: 'Blank Template' }
]

export default function CreateStudyPage() {
  const router = useRouter()
  const [tastingName, setTastingName] = useState('')
  const [productType, setProductType] = useState('')
  const [template, setTemplate] = useState('')
  const [blindToggle, setBlindToggle] = useState(false)
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      category_name: '',
      evaluation_type: 'subjective'
    }
  ])
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      item_name: '',
      item_description: ''
    }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addCategory = () => {
    if (categories.length < 10) {
      const newCategory: Category = {
        id: Date.now().toString(),
        category_name: '',
        evaluation_type: 'subjective'
      }
      setCategories([...categories, newCategory])
    }
  }

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    ))
  }

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      item_name: '',
      item_description: ''
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const clearDraft = () => {
    setTastingName('')
    setProductType('')
    setTemplate('')
    setBlindToggle(false)
    setCategories([{
      id: '1',
      category_name: '',
      evaluation_type: 'subjective'
    }])
    setItems([{
      id: '1',
      item_name: '',
      item_description: ''
    }])
  }

  const handleCreateTasting = async () => {
    // Basic validation
    if (!tastingName.trim() || !productType) {
      alert('Please fill in required fields')
      return
    }

    if (categories.some(cat => !cat.category_name.trim())) {
      alert('Please fill in all category names')
      return
    }

    if (items.some(item => !item.item_name.trim())) {
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

  const addPrefillCategory = (preset: { category_name: string; evaluation_type: EvaluationType }) => {
    if (categories.length < 10) {
      const newCategory: Category = {
        id: Date.now().toString(),
        category_name: preset.category_name,
        evaluation_type: preset.evaluation_type
      }
      setCategories([...categories, newCategory])
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#FAF7F0]/80 backdrop-blur border-b border-[#E6E1D9]">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-lg inline-flex items-center justify-center hover:bg-[#F4F1EC] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-[#1B1B18] flex-1 text-center">
            Create Study Mode Tasting
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24 space-y-6">
        {/* Basic Information */}
        <section>
          <Card className="rounded-xl bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1B1B18]">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tasting-name" className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                  Tasting Name *
                </Label>
                <Input
                  id="tasting-name"
                  data-testid="ti-tasting-name"
                  placeholder="e.g., Red Wine Tasting 2024"
                  value={tastingName}
                  onChange={(e) => setTastingName(e.target.value)}
                  className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="product-type" className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                  Product Type *
                </Label>
                <Select value={productType} onValueChange={setProductType}>
                  <SelectTrigger
                    id="product-type"
                    data-testid="sel-product-type"
                    className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                  >
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template" className="text-sm font-semibold text-[#1B1B18] mb-2 block">
                  Templates
                </Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger
                    id="template"
                    data-testid="sel-template"
                    className="w-full rounded-lg border-[#D6D1C8] bg-white p-3 text-sm"
                  >
                    <SelectValue placeholder="Choose Template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(tmpl => (
                      <SelectItem key={tmpl.value} value={tmpl.value}>
                        {tmpl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#5A5A56] mt-1">Optional. Prefills categories.</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="blind-toggle" className="text-sm font-semibold text-[#1B1B18]">
                  Blind Tasting
                </Label>
                <Switch
                  id="blind-toggle"
                  data-testid="sw-blind"
                  checked={blindToggle}
                  onCheckedChange={setBlindToggle}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Evaluation Categories */}
        <section>
          <Card className="rounded-xl bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1B1B18]">Evaluation Categories</CardTitle>
              <p className="text-sm text-[#5A5A56]">Define categories for evaluation (max 10)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Prefill Options */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-[#1B1B18]">Quick Add:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPrefillCategory({ category_name: 'Aroma', evaluation_type: 'subjective' })}
                    className="text-xs"
                  >
                    Aroma (subjective)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPrefillCategory({ category_name: 'Flavor', evaluation_type: 'subjective' })}
                    className="text-xs"
                  >
                    Flavor (subjective)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPrefillCategory({ category_name: 'Texture', evaluation_type: 'subjective' })}
                    className="text-xs"
                  >
                    Texture (subjective)
                  </Button>
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
