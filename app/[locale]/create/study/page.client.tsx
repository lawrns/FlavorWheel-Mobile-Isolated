'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { createTasting } from '@/services/create-tasting-service'
import { DashboardAppShell } from '@/components/app-shell'
import {
  Plus, Minus, Save, Camera, Upload, Wine, Coffee, Beer, ArrowLeft,
  HelpCircle, Sliders, FileText, CheckSquare, Type, Search, X,
  Palette, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudyModePageProps {
  params: {
    locale: string
  }
}

interface ProductTypeOption {
  value: string
  label: string
  category: 'wine' | 'coffee' | 'beer' | 'spirits' | 'other'
  icon?: React.ReactNode
}

interface Category {
  id: string
  name: string
  parameterType: 'subjective_input' | 'sliding_scale' | 'multiple_choice' | 'exact_answer' | 'contains_x'
  options?: string[]
  minValue?: number
  maxValue?: number
  containsText?: string
}

interface Item {
  id: string
  name: string
  description?: string
  image?: File
  imageUrl?: string
}

interface Template {
  id: string
  name: string
  description: string
  difficulty_level: 'beginner' | 'intermediate' | 'professional'
  duration: number
  category: string
  num_samples: number
  evaluation_criteria: Array<{
    name: string
    type: 'scale' | 'text' | 'multipleChoice'
    options?: string[]
  }>
  product_type?: {
    name: string
    display_name: string
  }
}

// Comprehensive product types with categories
const PRODUCT_TYPES: ProductTypeOption[] = [
  // Wine
  { value: 'White Wine', label: 'White Wine', category: 'wine', icon: <Wine className="h-4 w-4" /> },
  { value: 'Red Wine', label: 'Red Wine', category: 'wine', icon: <Wine className="h-4 w-4" /> },
  { value: 'Rosé Wine', label: 'Rosé Wine', category: 'wine', icon: <Wine className="h-4 w-4" /> },
  { value: 'Sparkling Wine', label: 'Sparkling Wine', category: 'wine', icon: <Wine className="h-4 w-4" /> },

  // Coffee
  { value: 'Coffee', label: 'Coffee', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'Espresso', label: 'Espresso', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'Cold Brew', label: 'Cold Brew', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },

  // Beer
  { value: 'Beer', label: 'Beer', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'IPA', label: 'IPA', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Stout', label: 'Stout', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Lager', label: 'Lager', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Pilsner', label: 'Pilsner', category: 'beer', icon: <Beer className="h-4 w-4" /> },

  // Spirits
  { value: 'Gin', label: 'Gin', category: 'spirits' },
  { value: 'Whisky', label: 'Whisky', category: 'spirits' },
  { value: 'Scotch', label: 'Scotch', category: 'spirits' },
  { value: 'Bourbon', label: 'Bourbon', category: 'spirits' },
  { value: 'Rum', label: 'Rum', category: 'spirits' },
  { value: 'Mezcal', label: 'Mezcal', category: 'spirits' },
  { value: 'Tequila', label: 'Tequila', category: 'spirits' },
  { value: 'Sotol', label: 'Sotol', category: 'spirits' },
  { value: 'Raicilla', label: 'Raicilla', category: 'spirits' },

  // Other
  { value: 'Perfume', label: 'Perfume', category: 'other' },
  { value: 'Cologne', label: 'Cologne', category: 'other' },
  { value: 'Olive Oil', label: 'Olive Oil', category: 'other' },
  { value: 'Extra Virgin Olive Oil', label: 'Extra Virgin Olive Oil', category: 'other' },
  { value: 'Chips', label: 'Chips', category: 'other' },
  { value: 'Snacks', label: 'Snacks', category: 'other' },
  { value: 'Crackers', label: 'Crackers', category: 'other' },
  { value: 'Chocolate', label: 'Chocolate', category: 'other' },
  { value: 'Dark Chocolate', label: 'Dark Chocolate', category: 'other' },
  { value: 'Milk Chocolate', label: 'Milk Chocolate', category: 'other' },
  { value: 'Dessert', label: 'Dessert', category: 'other' },
  { value: 'Ice Cream', label: 'Ice Cream', category: 'other' },
  { value: 'Cake', label: 'Cake', category: 'other' },
]

export default function StudyModePageClient({ params }: StudyModePageProps) {
  const [selectedProductType, setSelectedProductType] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Aroma',
      parameterType: 'subjective_input'
    },
    {
      id: '2',
      name: 'Flavor',
      parameterType: 'subjective_input'
    },
    {
      id: '3',
      name: 'Texture',
      parameterType: 'subjective_input'
    }
  ])
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: '' },
    { id: '2', name: '' }
  ])
  const [isBlindTasting, setIsBlindTasting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Template-related state
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      productType: '',
      categories,
      items,
      isBlindTasting: false
    },
    mode: 'onChange'
  })

  // Auto-save functionality
  const autoSaveKey = `study-tasting-draft-${user?.id || 'guest'}`
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  useEffect(() => {
    // Load draft on mount
    const saved = localStorage.getItem(autoSaveKey)
    if (saved) {
      try {
        const draft = JSON.parse(saved)
        setValue('name', draft.name || '')
        setCategories(draft.categories || categories)
        setItems(draft.items || items)
        setIsBlindTasting(draft.isBlindTasting || false)
        setSelectedProductType(draft.productType || '')
        setSelectedTemplate(draft.selectedTemplate || null)
        toast({
          title: 'Draft Loaded',
          description: 'Your previous work has been restored.',
        })
      } catch (e) {
        console.error('Failed to load draft', e)
      }
    }
  }, [])

  useEffect(() => {
    // Auto-save on changes
    const subscription = watch((values) => {
      const dataToSave = {
        name: values.name,
        productType: selectedProductType,
        categories,
        items,
        isBlindTasting,
        selectedTemplate,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(autoSaveKey, JSON.stringify(dataToSave))
      setLastSaved(new Date())
    })
    return () => subscription.unsubscribe()
  }, [watch, categories, items, isBlindTasting, selectedProductType, selectedTemplate])

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch('/api/templates?featured=true&limit=20')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const applyTemplate = (template: Template) => {
    // Set product type from template
    if (template.product_type) {
      setSelectedProductType(template.product_type.name)
    }

    // Convert template categories to our format
    const templateCategories = template.evaluation_criteria.map((criteria, index) => ({
      id: `template-${index + 1}`,
      name: criteria.name,
      parameterType: (criteria.type === 'scale' ? 'sliding_scale' :
                     criteria.type === 'multipleChoice' ? 'multiple_choice' :
                     criteria.type === 'text' ? 'subjective_input' : 'subjective_input') as Category['parameterType'],
      options: criteria.options,
      minValue: criteria.type === 'scale' ? 1 : undefined,
      maxValue: criteria.type === 'scale' ? 100 : undefined,
      containsText: undefined
    }))

    setCategories(templateCategories)
    setSelectedTemplate(template)
    setShowTemplateDialog(false)

    toast({
      title: 'Template Applied',
      description: `Applied ${template.name} template successfully.`,
    })
  }

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value)
    setValue('productType', value)
  }

  const addCategory = () => {
    if (categories.length >= 10) {
      alert('Maximum of 10 categories allowed')
      return
    }
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      parameterType: 'subjective_input'
    }
    setCategories([...categories, newCategory])
  }

  const removeCategory = (id: string) => {
    if (categories.length <= 1) return
    setCategories(categories.filter(c => c.id !== id))
  }

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ))
  }

  const addItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: ''
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length <= 1) return
    setItems(items.filter(i => i.id !== id))
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(items.map(i =>
      i.id === id ? { ...i, ...updates } : i
    ))
  }

  const handleImageUpload = (itemId: string, file: File) => {
    updateItem(itemId, { image: file, imageUrl: URL.createObjectURL(file) })
  }

  const handleCameraCapture = async (itemId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      setTimeout(() => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context?.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `item-${itemId}.jpg`, { type: 'image/jpeg' })
            handleImageUpload(itemId, file)
          }
        })

        stream.getTracks().forEach(track => track.stop())
      }, 1000)
    } catch (error) {
      console.error('Camera capture failed', error)
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please try uploading an image instead.',
        variant: 'destructive',
      })
    }
  }

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear your draft? This action cannot be undone.')) {
      localStorage.removeItem(autoSaveKey)
      setLastSaved(null)
      toast({
        title: 'Draft Cleared',
        description: 'All auto-saved data has been removed.',
      })
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!watch('name')?.trim()) {
      errors.push('Tasting name is required')
    }

    if (!selectedProductType) {
      errors.push('Product type is required')
    }

    categories.forEach((category, index) => {
      if (!category.name?.trim()) {
        errors.push(`Category ${index + 1} name is required`)
      }
    })

    items.forEach((item, index) => {
      if (!item.name?.trim()) {
        errors.push(`Item ${index + 1} name is required`)
      }
    })

    return errors
  }

  const onSubmit = async (data: any) => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors.join(', '),
        variant: 'destructive',
      })
      return
    }

    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a tasting.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const tastingData = {
        name: data.name,
        mode: 'study' as const,
        productType: selectedProductType,
        categories: categories.map(c => ({
          name: c.name,
          parameterType: c.parameterType,
          options: c.options,
          minValue: c.minValue,
          maxValue: c.maxValue,
          containsText: c.containsText
        })),
        items: items.map(i => ({
          name: i.name,
          description: i.description,
          image: i.image
        })),
        is_blind: isBlindTasting,
        createdBy: user?.id
      }

      const result = await createTasting(tastingData)

      // Clear draft after successful creation
      localStorage.removeItem(autoSaveKey)

      toast({
        title: 'Success!',
        description: 'Your tasting has been created successfully.',
      })

      // Prepare complete tasting data for confirmation and input screens
      console.log('🔧 STUDY CREATE - ORIGINAL CATEGORIES BEFORE STORAGE:', categories)
      categories.forEach((cat, index) => {
        console.log(`🔧 STUDY CREATE CATEGORY ${index}: ${cat.name}`, {
          parameterType: cat.parameterType,
          allKeys: Object.keys(cat)
        })
      })

      const completionTastingData = {
        id: result.id,
        name: data.name,
        mode: 'study' as const,
        product_type: selectedProductType,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          parameterType: cat.parameterType, // camelCase
          parameter_type: cat.parameterType, // Also store snake_case for compatibility
          options: cat.options,
          minValue: cat.minValue,
          maxValue: cat.maxValue,
          containsText: cat.containsText,
          rankOption: cat.rankOption
        })),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          preLoadedData: item.preLoadedData || {}
        })),
        subjectiveInputs: categories
          .filter(cat => cat.parameterType === 'subjective_input')
          .map(cat => cat.name + ': ' + (cat.options?.join(', ') || ''))
          .concat(
            items.flatMap(item =>
              categories
                .filter(cat => cat.parameterType === 'subjective_input')
                .map(cat => item.preLoadedData?.[cat.id]?.subjectiveInput || '')
                .filter(Boolean)
            )
          )
      }

      // Store tasting data temporarily for confirmation screen
      console.log('🔧 STUDY CREATE - COMPLETION DATA BEING STORED:', completionTastingData)
      console.log('🔧 STUDY CREATE - CATEGORIES IN COMPLETION DATA:', completionTastingData.categories)

      sessionStorage.setItem('tasting-completion-data', JSON.stringify(completionTastingData))

      // Verify what was actually stored
      const storedVerification = sessionStorage.getItem('tasting-completion-data')
      console.log('🔧 STUDY CREATE - VERIFICATION OF STORED DATA:', JSON.parse(storedVerification || '{}'))

      router.push(`/${params.locale}/study/${result.id}/confirm`)
    } catch (error) {
      console.error('Failed to create tasting', error)
      toast({
        title: 'Error',
        description: 'Failed to create tasting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push(`/${params.locale}/create`)
  }

  return (
    <DashboardAppShell activeNavItem="create" maxWidth="full">
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {lastSaved && (
            <div className="text-xs text-muted-foreground">
              Auto-saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Study Mode Tasting</h1>
          <p className="text-muted-foreground">
            Set up your tasting with categories, items, and evaluation parameters
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tasting Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Tasting name is required' })}
                  placeholder="e.g., Red Wine Tasting 2024"
                  className="min-h-[48px]"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="product-type">Product Type *</Label>
                <Select value={selectedProductType} onValueChange={handleProductTypeChange}>
                  <SelectTrigger id="product-type" className="min-h-[48px]">
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {/* Wine Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                      🍷 Wine
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === 'wine').map((type) => (
                      <SelectItem key={type.value} value={type.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}

                    {/* Coffee Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-2">
                      ☕ Coffee
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === 'coffee').map((type) => (
                      <SelectItem key={type.value} value={type.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}

                    {/* Beer Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-2">
                      🍺 Beer
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === 'beer').map((type) => (
                      <SelectItem key={type.value} value={type.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}

                    {/* Spirits Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-2">
                      🥃 Spirits
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === 'spirits').map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}

                    {/* Other Section */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-t mt-2">
                      🧁 Other
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === 'other').map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProductType && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: <span className="font-medium">{selectedProductType}</span>
                  </p>
                )}
              </div>

              {/* Template Selector */}
              <div>
                <Label>Templates</Label>
                <div className="mt-2">
                  <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full min-h-[48px] justify-start"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {selectedTemplate ? `Using: ${selectedTemplate.name}` : 'Choose Template'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Choose a Template</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {loadingTemplates ? (
                          <div className="col-span-full text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Loading templates...</p>
                          </div>
                        ) : templates.length === 0 ? (
                          <div className="col-span-full text-center py-8">
                            <p className="text-muted-foreground">No templates available</p>
                          </div>
                        ) : (
                          templates.map((template) => (
                            <Card
                              key={template.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => applyTemplate(template)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                      {template.description}
                                    </CardDescription>
                                  </div>
                                  <Badge variant={
                                    template.difficulty_level === 'beginner' ? 'secondary' :
                                    template.difficulty_level === 'intermediate' ? 'default' : 'destructive'
                                  }>
                                    {template.difficulty_level}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Duration:</span>
                                    <span>{template.duration} min</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Samples:</span>
                                    <span>{template.num_samples}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Categories:</span>
                                    <span>{template.evaluation_criteria.length}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  {selectedTemplate && (
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          <strong>{selectedTemplate.name}</strong> • {selectedTemplate.difficulty_level} • {selectedTemplate.duration} min
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTemplate(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Blind Tasting Toggle */}
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2 cursor-help">
                        <Switch
                          id="blind-tasting"
                          checked={isBlindTasting}
                          onCheckedChange={setIsBlindTasting}
                        />
                        <Label htmlFor="blind-tasting">Blind Tasting</Label>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hide item names from participants to enable blind evaluation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Evaluation Categories</CardTitle>
              <CardDescription>
                Define categories for evaluation (max 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="flex-1 min-w-0 break-words">Configure Evaluation Categories</span>
                      <Badge variant="secondary" className="flex-shrink-0">{categories.length} categories</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 overflow-hidden">


                    {categories.map((category, index) => (
                      <div key={category.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-4">
                            <div>
                              <Label>Category Name *</Label>
                              <Input
                                value={category.name}
                                onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                                placeholder="e.g., Aroma, Flavor, Texture"
                                className="min-h-[48px]"
                              />
                            </div>

                            <div>
                              <Label>Evaluation Type</Label>
                              <Select
                                value={category.parameterType}
                                onValueChange={(value: any) => updateCategory(category.id, { parameterType: value })}
                              >
                                <SelectTrigger className="min-h-[48px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="subjective_input">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">Subjective Input</div>
                                        <div className="text-xs text-muted-foreground">Free-form prose notes</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="sliding_scale">
                                    <div className="flex items-center gap-2">
                                      <Sliders className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">Sliding Scale</div>
                                        <div className="text-xs text-muted-foreground">Interactive 1-100 rating slider</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="multiple_choice">
                                    <div className="flex items-center gap-2">
                                      <CheckSquare className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">Multiple Choice</div>
                                        <div className="text-xs text-muted-foreground">Select from predefined options</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="exact_answer">
                                    <div className="flex items-center gap-2">
                                      <Type className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">Exact Answer</div>
                                        <div className="text-xs text-muted-foreground">Precise text matching</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="contains_x">
                                    <div className="flex items-center gap-2">
                                      <Search className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">Contains X</div>
                                        <div className="text-xs text-muted-foreground">Fuzzy text matching with variations</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Conditional fields based on parameter type */}
                            {category.parameterType === 'multiple_choice' && (
                              <div>
                                <Label>Options (comma-separated)</Label>
                                <Textarea
                                  value={category.options?.join(', ') || ''}
                                  onChange={(e) => updateCategory(category.id, {
                                    options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                  })}
                                  placeholder="e.g., Light, Medium, Full"
                                  className="min-h-[48px]"
                                />
                              </div>
                            )}

                            {category.parameterType === 'sliding_scale' && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Min Value</Label>
                                  <Input
                                    type="number"
                                    value={category.minValue || 1}
                                    onChange={(e) => updateCategory(category.id, { minValue: parseInt(e.target.value) })}
                                    className="min-h-[48px]"
                                  />
                                </div>
                                <div>
                                  <Label>Max Value</Label>
                                  <Input
                                    type="number"
                                    value={category.maxValue || 100}
                                    onChange={(e) => updateCategory(category.id, { maxValue: parseInt(e.target.value) })}
                                    className="min-h-[48px]"
                                  />
                                </div>
                              </div>
                            )}

                            {category.parameterType === 'contains_x' && (
                              <div>
                                <Label>Text to match</Label>
                                <Input
                                  value={category.containsText || ''}
                                  onChange={(e) => updateCategory(category.id, { containsText: e.target.value })}
                                  placeholder="e.g., fruity"
                                  className="min-h-[48px]"
                                />
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCategory(category.id)}
                            disabled={categories.length <= 1}
                            className="min-h-[48px] min-w-[48px]"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>

                        {category.parameterType === 'subjective_input' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md cursor-help">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Describe aromas, flavors, textures, and observations</span>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Use detailed prose to describe your sensory experience</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCategory}
                  disabled={categories.length >= 10}
                  className="w-full min-h-[48px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Items to Taste</CardTitle>
              <CardDescription>
                Add the items participants will evaluate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-hidden">
              {items.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4 overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label>Item Name *</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          placeholder={`Item ${index + 1}`}
                          className="min-h-[48px]"
                        />
                      </div>

                      <div>
                        <Label>Description (Optional)</Label>
                        <Textarea
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Add any additional details about this item..."
                          className="min-h-[60px]"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label>Image (Optional)</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCameraCapture(item.id)}
                            className="min-h-[48px]"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById(`image-upload-${item.id}`)?.click()}
                            className="min-h-[48px]"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                          <input
                            id={`image-upload-${item.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(item.id, file)
                            }}
                            className="hidden"
                          />
                        </div>
                        {item.imageUrl && (
                          <div className="mt-2">
                            <img
                              src={item.imageUrl}
                              alt={`Item ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1}
                      className="min-h-[48px] min-w-[48px]"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full min-h-[48px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={clearDraft}
              className="min-h-[48px]"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Draft
            </Button>

            <div className="flex-1" />

            <Button
              type="submit"
              disabled={isSubmitting || !watch('name')?.trim() || !selectedProductType}
              className="min-h-[48px] bg-green-500 hover:bg-green-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Tasting'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardAppShell>
  )
}
