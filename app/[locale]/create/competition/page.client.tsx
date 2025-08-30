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
  Palette, Sparkles, Target, Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductTypeOption {
  value: string
  label: string
  category: string
  icon: React.ReactNode
}

interface Category {
  id: string
  name: string
  parameterType: 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
  options: any
  minValue?: number
  maxValue?: number
  containsText?: string
  rankOption: boolean
}

interface Item {
  id: string
  name: string
  description?: string
  image?: File
  imageUrl?: string
  // Pre-loaded data for competition
  preLoadedData?: {
    exactAnswer?: string
    containsX?: string
    slidingScaleValue?: number
    multipleChoiceOptions?: string[]
    correctAnswer?: string
    subjectiveInput?: string
  }
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
  { value: 'Dessert Wine', label: 'Dessert Wine', category: 'wine', icon: <Wine className="h-4 w-4" /> },

  // Coffee
  { value: 'Espresso', label: 'Espresso', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'Filter Coffee', label: 'Filter Coffee', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'Cold Brew', label: 'Cold Brew', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'Pour Over', label: 'Pour Over', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },
  { value: 'French Press', label: 'French Press', category: 'coffee', icon: <Coffee className="h-4 w-4" /> },

  // Beer
  { value: 'Pale Ale', label: 'Pale Ale', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'IPA', label: 'IPA', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Stout', label: 'Stout', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Lager', label: 'Lager', category: 'beer', icon: <Beer className="h-4 w-4" /> },
  { value: 'Wheat Beer', label: 'Wheat Beer', category: 'beer', icon: <Beer className="h-4 w-4" /> },

  // Spirits
  { value: 'Whiskey', label: 'Whiskey', category: 'spirits', icon: <Target className="h-4 w-4" /> },
  { value: 'Vodka', label: 'Vodka', category: 'spirits', icon: <Target className="h-4 w-4" /> },
  { value: 'Gin', label: 'Gin', category: 'spirits', icon: <Target className="h-4 w-4" /> },
  { value: 'Rum', label: 'Rum', category: 'spirits', icon: <Target className="h-4 w-4" /> },
  { value: 'Tequila', label: 'Tequila', category: 'spirits', icon: <Target className="h-4 w-4" /> },
  { value: 'Mezcal', label: 'Mezcal', category: 'spirits', icon: <Target className="h-4 w-4" /> },

  // Other
  { value: 'Olive Oil', label: 'Olive Oil', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Perfume', label: 'Perfume', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Tea', label: 'Tea', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Chocolate', label: 'Chocolate', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Cheese', label: 'Cheese', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Dessert', label: 'Dessert', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Ice Cream', label: 'Ice Cream', category: 'other', icon: <Palette className="h-4 w-4" /> },
  { value: 'Cake', label: 'Cake', category: 'other', icon: <Palette className="h-4 w-4" /> },
]

interface CompetitionModePageProps {
  params: {
    locale: string
  }
}

export default function CompetitionModePageClient({ params }: CompetitionModePageProps) {
  const [selectedProductType, setSelectedProductType] = useState<string>('')
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Variety',
      parameterType: 'multiple_choice',
      options: [],
      rankOption: true
    },
    {
      id: '2',
      name: 'Region',
      parameterType: 'exact_answer',
      options: {},
      rankOption: true
    }
  ])
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: '', preLoadedData: {} },
    { id: '2', name: '', preLoadedData: {} }
  ])
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isBlindTasting, setIsBlindTasting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Template-related state
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isBlind: false
    },
    mode: 'onChange'
  })

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

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
                     criteria.type === 'text' ? 'subjective_input' : 'exact_answer') as Category['parameterType'],
      options: criteria.options || [],
      minValue: criteria.type === 'scale' ? 1 : undefined,
      maxValue: criteria.type === 'scale' ? 100 : undefined,
      containsText: undefined,
      rankOption: true
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
  }

  const addCategory = () => {
    if (categories.length >= 10) {
      alert('Maximum of 10 categories allowed')
      return
    }
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      parameterType: 'subjective_input',
      options: {},
      rankOption: true
    }
    setCategories([...categories, newCategory])
  }

  const removeCategory = (id: string) => {
    if (categories.length <= 1) return
    setCategories(categories.filter(c => c.id !== id))
  }

  const updateCategory = (id: string, field: string, value: any) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ))
  }

  const addItem = () => {
    if (items.length >= 10) {
      alert('Maximum of 10 items allowed')
      return
    }
    const newItem: Item = {
      id: Date.now().toString(),
      name: '',
      preLoadedData: {}
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length <= 2) return
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const handleBack = () => {
    router.push(`/${params.locale}/create`)
  }

  // Auto-save functionality
  useEffect(() => {
    const autoSaveKey = `competition-draft-${params.locale}`
    const interval = setInterval(() => {
      if (getValues('name') || selectedProductType || categories.some(c => c.name) || items.some(i => i.name)) {
        const draftData = {
          selectedProductType,
          categories,
          items,
          isBlindTasting,
          selectedTemplate,
          formData: getValues(),
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(autoSaveKey, JSON.stringify(draftData))
        setLastSaved(new Date())
      }
    }, 2000) // Auto-save every 2 seconds

    return () => clearInterval(interval)
  }, [selectedProductType, categories, items, isBlindTasting, selectedTemplate, params.locale, getValues])

  // Load draft on mount
  useEffect(() => {
    const autoSaveKey = `competition-draft-${params.locale}`
    const draftData = localStorage.getItem(autoSaveKey)
    if (draftData) {
      try {
        const parsed = JSON.parse(draftData)
        if (parsed.selectedProductType) setSelectedProductType(parsed.selectedProductType)
        if (parsed.categories) setCategories(parsed.categories)
        if (parsed.items) setItems(parsed.items)
        if (parsed.isBlindTasting) setIsBlindTasting(parsed.isBlindTasting)
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate)
        if (parsed.formData) {
          Object.keys(parsed.formData).forEach(key => {
            setValue(key as keyof typeof parsed.formData, parsed.formData[key])
          })
        }
        toast({
          title: 'Draft Loaded',
          description: 'Your previous work has been restored.',
        })
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [params.locale, setValue, toast])

  const clearDraft = () => {
    if (confirm('Are you sure you want to clear your draft? This cannot be undone.')) {
      const autoSaveKey = `competition-draft-${params.locale}`
      localStorage.removeItem(autoSaveKey)
      setSelectedProductType('')
      setCategories([
        {
          id: '1',
          name: 'Variety',
          parameterType: 'multiple_choice',
          options: [],
          rankOption: true
        },
        {
          id: '2',
          name: 'Region',
          parameterType: 'exact_answer',
          options: {},
          rankOption: true
        }
      ])
      setItems([
        { id: '1', name: '', preLoadedData: {} },
        { id: '2', name: '', preLoadedData: {} }
      ])
      setIsBlindTasting(false)
      setSelectedTemplate(null)
      reset()
      setLastSaved(null)
      toast({
        title: 'Draft Cleared',
        description: 'All data has been reset.',
      })
    }
  }

  const validatePreLoadedData = () => {
    const errors: string[] = []

    // Check if all items have names
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        errors.push(`Item ${index + 1} is missing a name`)
      }
    })

    // Check if pre-loaded data is provided for each category and item
    categories.forEach((category) => {
      if (category.rankOption) {
        items.forEach((item, itemIndex) => {
          const preLoadedData = item.preLoadedData || {}

          switch (category.parameterType) {
            case 'exact_answer':
              if (!preLoadedData.exactAnswer?.trim()) {
                errors.push(`"${item.name || `Item ${itemIndex + 1}`}" is missing pre-loaded data for "${category.name}" (Exact Answer)`)
              }
              break
            case 'contains_x':
              if (!preLoadedData.containsX?.trim()) {
                errors.push(`"${item.name || `Item ${itemIndex + 1}`}" is missing pre-loaded data for "${category.name}" (Contains X)`)
              }
              break
            case 'sliding_scale':
              if (preLoadedData.slidingScaleValue === undefined || preLoadedData.slidingScaleValue === null || preLoadedData.slidingScaleValue === 0) {
                errors.push(`"${item.name || `Item ${itemIndex + 1}`}" is missing pre-loaded data for "${category.name}" (Sliding Scale)`)
              }
              break
            case 'multiple_choice':
              if (!preLoadedData.correctAnswer?.trim()) {
                errors.push(`"${item.name || `Item ${itemIndex + 1}`}" is missing pre-loaded data for "${category.name}" (Multiple Choice)`)
              }
              break
            case 'subjective_input':
              if (!preLoadedData.subjectiveInput?.trim()) {
                errors.push(`"${item.name || `Item ${itemIndex + 1}`}" is missing pre-loaded data for "${category.name}" (Subjective Input)`)
              }
              break
          }
        })
      }
    })

    return errors
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)

    try {
      // Validate pre-loaded data
      const validationErrors = validatePreLoadedData()
      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Error',
          description: validationErrors[0], // Show first error
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      const tastingData = {
        mode: 'competition' as const,
        name: data.name,
        description: data.description || '',
        product_type: selectedProductType,
        is_blind: isBlindTasting,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          parameter_type: cat.parameterType,
          options: cat.options,
          min_value: cat.minValue,
          max_value: cat.maxValue,
          contains_text: cat.containsText,
          rank_option: cat.rankOption
        })),
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          image: item.image,
          pre_loaded_data: item.preLoadedData
        })),
        template_id: selectedTemplate?.id
      }

      await createTasting(tastingData)

      toast({
        title: 'Competition Created!',
        description: 'Your competition tasting has been created successfully.',
      })

      // Clear the draft after successful submission
      const autoSaveKey = `competition-draft-${params.locale}`
      localStorage.removeItem(autoSaveKey)

      // Prepare complete tasting data for confirmation and input screens
      const completionTastingData = {
        id: result.id,
        name: data.name,
        mode: 'competition' as const,
        product_type: selectedProductType,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          parameterType: cat.parameterType,
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
                .map(cat => item.preLoadedData?.subjectiveInput || '')
                .filter(Boolean)
            )
          ),
        preLoadedData: items.map(item => item.preLoadedData || {})
      }

      // Store tasting data temporarily for confirmation screen
      sessionStorage.setItem('tasting-completion-data', JSON.stringify(completionTastingData))
      router.push(`/${params.locale}/competition/${result.id}/confirm?tasting=${result.id}`)

    } catch (error) {
      console.error('Failed to create competition:', error)
      toast({
        title: 'Error',
        description: 'Failed to create competition. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
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

          <div className="text-center">
            <h1 className="text-2xl font-bold">Create Competition</h1>
            <p className="text-sm text-muted-foreground">Structured competition with scoring and ranking</p>
            {lastSaved && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up your competition details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Competition Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Competition name is required" })}
                  placeholder="e.g., Wine Competition 2024"
                  className="min-h-[48px]"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Optional description of your competition"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="product-type">Product Type *</Label>
                <Select value={selectedProductType} onValueChange={handleProductTypeChange}>
                  <SelectTrigger id="product-type" className="min-h-[48px]">
                    <SelectValue placeholder="Select a product type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                      🍷 Wine
                    </div>
                    {PRODUCT_TYPES.filter(pt => pt.category === "wine").map((type) => (
                      <SelectItem key={type.value} value={type.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {type.icon}
                          <span>{type.label}</span>
                        </div>
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
                        {selectedTemplate ? `Using: ${selectedTemplate.name}` : "Choose Template"}
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
                                    template.difficulty_level === "beginner" ? "secondary" :
                                    template.difficulty_level === "intermediate" ? "default" : "destructive"
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

          {/* Evaluation Categories */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Evaluation Categories</CardTitle>
              <CardDescription>
                Define categories for evaluation (max 10)
                <Badge variant="secondary" className="ml-2">{categories.length} categories</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {categories.map((category, index) => (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>{category.name || `Category ${index + 1}`}</span>
                        {category.parameterType === 'sliding_scale' && (
                          <Badge variant="outline" className="text-xs">
                            <Sliders className="h-3 w-3 mr-1" />
                            Scale
                          </Badge>
                        )}
                        {category.parameterType === 'multiple_choice' && (
                          <Badge variant="outline" className="text-xs">
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Multiple Choice
                          </Badge>
                        )}
                        {category.parameterType === 'exact_answer' && (
                          <Badge variant="outline" className="text-xs">
                            <Type className="h-3 w-3 mr-1" />
                            Exact Answer
                          </Badge>
                        )}
                        {category.parameterType === 'contains_x' && (
                          <Badge variant="outline" className="text-xs">
                            <Search className="h-3 w-3 mr-1" />
                            Contains X
                          </Badge>
                        )}
                        {category.parameterType === 'subjective_input' && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Subjective
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Category Name *</Label>
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                            placeholder="e.g., Variety, Aroma, Flavor"
                            className="min-h-[48px]"
                          />
                        </div>

                        <div>
                          <Label>Parameter Type *</Label>
                          <Select value={category.parameterType} onValueChange={(value) => updateCategory(category.id, 'parameterType', value)}>
                            <SelectTrigger className="min-h-[48px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subjective_input">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">Subjective Input</div>
                                    <div className="text-xs text-muted-foreground">Free-form text responses</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="sliding_scale">
                                <div className="flex items-center gap-2">
                                  <Sliders className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">Sliding Scale</div>
                                    <div className="text-xs text-muted-foreground">1-100 rating scale</div>
                                  </div>
                                </div>
                              </SelectItem>
                              <SelectItem value="multiple_choice">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">Multiple Choice</div>
                                    <div className="text-xs text-muted-foreground">Select from options</div>
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
                                    <div className="text-xs text-muted-foreground">Text contains specific words</div>
                                  </div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Parameter-specific options */}
                        {category.parameterType === 'multiple_choice' && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Textarea
                              value={Array.isArray(category.options) ? category.options.join(', ') : ''}
                              onChange={(e) => updateCategory(category.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                              placeholder="e.g., Cabernet Sauvignon, Merlot, Pinot Noir"
                              className="min-h-[60px]"
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
                                onChange={(e) => updateCategory(category.id, 'minValue', parseInt(e.target.value) || 1)}
                                min="0"
                                className="min-h-[48px]"
                              />
                            </div>
                            <div>
                              <Label>Max Value</Label>
                              <Input
                                type="number"
                                value={category.maxValue || 100}
                                onChange={(e) => updateCategory(category.id, 'maxValue', parseInt(e.target.value) || 100)}
                                min="1"
                                className="min-h-[48px]"
                              />
                            </div>
                          </div>
                        )}

                        {category.parameterType === 'contains_x' && (
                          <div>
                            <Label>Contains Text</Label>
                            <Input
                              value={category.containsText || ''}
                              onChange={(e) => updateCategory(category.id, 'containsText', e.target.value)}
                              placeholder="Text that must be contained in response"
                              className="min-h-[48px]"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`rank-${category.id}`}
                            checked={category.rankOption}
                            onCheckedChange={(checked) => updateCategory(category.id, 'rankOption', checked)}
                          />
                          <Label htmlFor={`rank-${category.id}`}>Include in ranking</Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
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

          {/* Items to Taste */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Items to Taste</CardTitle>
              <CardDescription>Add the items participants will evaluate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {items.map((item, index) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>{item.name || `Item ${index + 1}`}</span>
                        {item.image && (
                          <Badge variant="outline" className="text-xs">
                            📷 Photo
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="space-y-4">
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
                              onClick={() => document.getElementById(`image-upload-${item.id}`)?.click()}
                              className="min-h-[48px]"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {/* Camera functionality */}}
                              className="min-h-[48px]"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Take Photo
                            </Button>
                            <input
                              id={`image-upload-${item.id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  updateItem(item.id, { image: file, imageUrl: URL.createObjectURL(file) })
                                }
                              }}
                              className="hidden"
                            />
                          </div>
                          {item.imageUrl && (
                            <div className="mt-2">
                              <img src={item.imageUrl} alt="Item" className="w-20 h-20 object-cover rounded" />
                            </div>
                          )}
                        </div>

                        {/* Pre-loaded Data for each category */}
                        <div className="border-t pt-4">
                          <Label className="text-base font-medium mb-3 block">Pre-loaded Data</Label>
                          <div className="space-y-3">
                            {categories.map((category) => (
                              <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                                <Label className="text-sm font-medium">{category.name}</Label>
                                {category.parameterType === 'exact_answer' && (
                                  <Input
                                    placeholder="Enter the correct answer"
                                    value={item.preLoadedData?.exactAnswer || ''}
                                    onChange={(e) => updateItem(item.id, {
                                      preLoadedData: {
                                        ...item.preLoadedData,
                                        exactAnswer: e.target.value
                                      }
                                    })}
                                    className="mt-1 min-h-[48px]"
                                  />
                                )}
                                {category.parameterType === 'contains_x' && (
                                  <Input
                                    placeholder={`Text that should contain "${category.containsText || 'specific text'}"`}
                                    value={item.preLoadedData?.containsX || ''}
                                    onChange={(e) => updateItem(item.id, {
                                      preLoadedData: {
                                        ...item.preLoadedData,
                                        containsX: e.target.value
                                      }
                                    })}
                                    className="mt-1 min-h-[48px]"
                                  />
                                )}
                                {category.parameterType === 'sliding_scale' && (
                                  <div className="mt-1">
                                    <Input
                                      type="number"
                                      placeholder={`Expected value (${category.minValue}-${category.maxValue})`}
                                      value={item.preLoadedData?.slidingScaleValue || ''}
                                      onChange={(e) => updateItem(item.id, {
                                        preLoadedData: {
                                          ...item.preLoadedData,
                                          slidingScaleValue: parseInt(e.target.value) || 0
                                        }
                                      })}
                                      min={category.minValue || 1}
                                      max={category.maxValue || 100}
                                      className="min-h-[48px]"
                                    />
                                  </div>
                                )}
                                {category.parameterType === 'multiple_choice' && (
                                  <Select
                                    value={item.preLoadedData?.correctAnswer || ''}
                                    onValueChange={(value) => updateItem(item.id, {
                                      preLoadedData: {
                                        ...item.preLoadedData,
                                        correctAnswer: value
                                      }
                                    })}
                                  >
                                    <SelectTrigger className="mt-1 min-h-[48px]">
                                      <SelectValue placeholder="Select correct answer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.isArray(category.options) && category.options.map((option, idx) => (
                                        <SelectItem key={idx} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                {category.parameterType === 'subjective_input' && (
                                  <Textarea
                                    placeholder="Expected subjective response or key points"
                                    value={item.preLoadedData?.subjectiveInput || ''}
                                    onChange={(e) => updateItem(item.id, {
                                      preLoadedData: {
                                        ...item.preLoadedData,
                                        subjectiveInput: e.target.value
                                      }
                                    })}
                                    className="mt-1 min-h-[60px]"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItem}
                  className="w-full min-h-[48px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" onClick={handleBack} variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="button" onClick={clearDraft} variant="outline" className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Clear Draft
            </Button>
            <div className="flex-1" />
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Competition"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardAppShell>
  )
}
