'use client'
import * as React from 'react'
import { useState, useEffect } from 'react'

import { DashboardAppShell } from '@/components/app-shell'
import { useTasting } from '@/components/tasting-context'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Toggle } from '@/components/ui/toggle'
import { Wine, Users, Clock, MapPin, Star, Plus, X, Calendar, Globe, Lock, ArrowLeft, Upload, Sparkles, BookOpen, Target } from 'lucide-react'
import { SignInModal } from '@/components/sign-in-modal'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TemplateLibrary } from '@/components/template-library'
import { useForm } from 'react-hook-form'

// Import our CRUD service
import {
  createTasting,
  type Template as ServiceTemplate,
  type CreateTastingData
} from '@/services/create-tasting-service'

// Import keyword extraction service
import { extractKeywords } from '@/services/keyword-extraction-service'

// Micro animations for buttons
const microAnimations = {
  buttonHover: 'transition-all duration-200 hover:scale-105 hover:shadow-lg',
  cardHover: 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
  fadeIn: 'animate-in fade-in duration-500',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
}

// Template interface for TemplateLibrary component
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
  product_type?: any
}

// Predefined evaluation descriptors/attributes
const EVALUATION_DESCRIPTORS = [
  // General descriptors
  'Aroma', 'Flavor', 'Texture', 'Complexity', 'Typicity', 'Overall',
  // Wine-specific
  'Variety', 'Region', 'Vintage', 'Acidity', 'Tannins', 'Body', 'Finish',
  // Spirits-specific
  'Age', 'Proof', 'Distillery', 'Mash Bill', 'Cask Type',
  // Sensory attributes
  'Sweetness', 'Bitterness', 'Spiciness', 'Silkiness', 'Smoothness',
  // Coffee-specific
  'Origin', 'Roast Level', 'Processing Method', 'Grind Size',
  // Beer-specific
  'Style', 'ABV', 'IBU', 'Hops', 'Malt',
  // General quality attributes
  'Balance', 'Intensity', 'Persistence', 'Elegance', 'Character'
]

interface FormData {
  name: string
  description: string
  isBlind: boolean
  productType: string
  productTypeId: string
  templateId: string
  categories: Array<{
    name: string
    parameterType: 'exact_answer' | 'subjective_input' | 'contains_x' | 'multiple_choice' | 'sliding_scale'
    options: any
    rankOption: boolean
  }>
  items: Array<{
    name: string
    image?: File | null
    imagePreview?: string
  }>
  // Competition mode specific
  rankParticipants?: boolean
  competitionCategories?: Array<{
    exactAnswer: string
    containsX: string
  }>
  // Prose notes for debugging
  proseNotes?: string
}

type TastingMode = 'study' | 'competition' | 'quick' | null

export default function CreateTastingPageClient(props: any) {
  const [selectedMode, setSelectedMode] = useState<TastingMode>(null)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [customCategoryInputs, setCustomCategoryInputs] = useState<{ [key: number]: boolean }>({})

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      isBlind: false,
      productType: '',
      productTypeId: '',
      templateId: '',
      categories: [],
      items: [],
      rankParticipants: false,
      competitionCategories: Array.from({ length: 10 }, () => ({ exactAnswer: '', containsX: '' })),
      proseNotes: ''
    }
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = form

  // Handle unauthorized state behavior: show interface for 3 seconds, then show sign-in modal
  useEffect(() => {
    if (!isAuthenticated) {
      // After 3 seconds, show the sign-in modal (but keep the interface visible)
      const timer = setTimeout(() => {
        setShowSignInModal(true)
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      // User is authenticated, hide the sign-in modal
      setShowSignInModal(false)
    }
  }, [isAuthenticated])

  // Handle mode selection
  const handleModeSelect = (mode: TastingMode) => {
    if (!isAuthenticated) {
      setShowSignInModal(true)
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a tasting.',
        variant: 'destructive',
      })
      return
    }

    if (mode === 'quick') {
      // For quick mode, redirect to standalone quick tasting
      router.push('/quick-tasting')
      return
    }

    if (mode === 'study') {
      // For study mode, redirect to the new study mode creation pages
      const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
      router.push(`/${currentLocale}/create/study`)
      return
    }

    if (mode === 'competition') {
      // For competition mode, redirect to the new competition mode creation pages
      const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
      router.push(`/${currentLocale}/create/competition`)
      return
    }

    setSelectedMode(mode)
  }

  // Handle back to mode selection
  const handleBackToModes = () => {
    setSelectedMode(null)
    setSelectedTemplate(null)
    setValue('name', '')
    setValue('description', '')
    setValue('items', [])
    setValue('categories', [])
    setValue('productType', '')
  }

  // Add category
  const addCategory = () => {
    const currentCategories = getValues('categories')
    if (currentCategories.length >= 10) {
      toast({
        title: 'Maximum categories reached',
        description: 'You can add up to 10 categories per tasting.',
        variant: 'destructive'
      })
      return
    }

    setValue('categories', [
      ...currentCategories,
      {
        name: '',
        parameterType: 'subjective_input',
        options: {},
        rankOption: false
      }
    ])
  }

  // Remove category
  const removeCategory = (index: number) => {
    const currentCategories = getValues('categories')
    setValue('categories', currentCategories.filter((_, i) => i !== index))

    // Clean up custom input state
    const newCustomInputs = { ...customCategoryInputs }
    delete newCustomInputs[index]
    setCustomCategoryInputs(newCustomInputs)
  }

  // Update category
  const updateCategory = (index: number, field: string, value: any) => {
    const currentCategories = getValues('categories')
    const updatedCategories = [...currentCategories]
    updatedCategories[index] = { ...updatedCategories[index], [field]: value }
    setValue('categories', updatedCategories)
  }

  // Add item
  const addItem = () => {
    const currentItems = getValues('items')
    setValue('items', [
      ...currentItems,
      { name: '', image: null, imagePreview: '' }
    ])
  }

  // Remove item
  const removeItem = (index: number) => {
    const currentItems = getValues('items')
    setValue('items', currentItems.filter((_, i) => i !== index))
  }

  // Update item
  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = getValues('items')
    const updatedItems = [...currentItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setValue('items', updatedItems)
  }

  // Handle image upload for items
  const handleImageUpload = (index: number, file: File | null) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPG, PNG, or WebP image.',
          variant: 'destructive'
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive'
        })
        return
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      updateItem(index, 'image', file)
      updateItem(index, 'imagePreview', previewUrl)
    } else {
      updateItem(index, 'image', null)
      updateItem(index, 'imagePreview', '')
    }
  }

  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setShowTemplateModal(false)

    // Auto-populate form fields from template
    populateFromTemplate(template)

    toast({
      title: 'Template loaded!',
      description: `"${template.name}" has been applied to your tasting. You can customize the auto-populated data.`
    })
  }

  // Generate default item names based on template
  const generateTemplateItems = (template: Template) => {
    const numSamples = template.num_samples || 3
    const templateName = template.name || ''

    // Generate appropriate item names based on template type
    const items = []
    for (let i = 1; i <= numSamples; i++) {
      let itemName = `Sample ${i}`

      if (templateName.includes('White Wine')) {
        itemName = `White Wine Sample ${i}`
      } else if (templateName.includes('Red Wine')) {
        itemName = `Red Wine Sample ${i}`
      } else if (templateName.includes('Coffee')) {
        itemName = `Cup ${i}`
      } else if (templateName.includes('Beer')) {
        itemName = `Beer Sample ${String.fromCharCode(64 + i)}` // A, B, C
      } else if (templateName.includes('Spirits')) {
        itemName = `Spirit Sample ${i}`
      } else if (templateName.includes('Olive Oil')) {
        itemName = `Oil Sample ${i}`
      } else if (templateName.includes('Perfume')) {
        itemName = `Fragrance ${String.fromCharCode(64 + i)}` // A, B, C, D
      }

      items.push({
        name: itemName,
        image: null,
        imagePreview: ''
      })
    }

    return items
  }

  // Auto-populate form fields from template
  const populateFromTemplate = (template: Template) => {
    // Set tasting name (allow customization)
    setValue('name', template.name || '')
    setValue('description', template.description || '')

    // Generate items based on template
    const templateItems = generateTemplateItems(template)
    setValue('items', templateItems)

    // Set other template data if available
    if (template.product_type) {
      const productTypeName = typeof template.product_type === 'string'
        ? template.product_type
        : template.product_type.name
      setValue('productType', productTypeName)
    }
  }

  // Submit handler
  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      setShowSignInModal(true)
      return
    }

    setIsSubmitting(true)

    // Form validation
    if (!data.name || data.name.trim().length < 3) {
      toast({
        title: 'Validation Error',
        description: 'Tasting name must be at least 3 characters long.',
        variant: 'destructive'
      })
      setIsSubmitting(false)
      return
    }

    if (!data.items || data.items.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one item is required.',
        variant: 'destructive'
      })
      setIsSubmitting(false)
      return
    }

    // Validate items
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      if (!item.name || item.name.trim().length < 2) {
        toast({
          title: 'Validation Error',
          description: `Item ${i + 1} name must be at least 2 characters long.`,
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }
    }

    // Mode-specific validation
    if (selectedMode === 'competition' && data.competitionCategories) {
      const hasValidCategories = data.competitionCategories.some(cat =>
        cat.exactAnswer.trim() || cat.containsX.trim()
      )
      if (!hasValidCategories) {
        toast({
          title: 'Validation Error',
          description: 'Competition mode requires at least one category with answers.',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Trigger keyword extraction from prose notes for debugging
      let extractedKeywords: string[] = []
      if (data.proseNotes && data.proseNotes.trim()) {
        try {
          const extractionResult = await extractKeywords(data.proseNotes, {
            productType: data.productType,
            language: 'en',
            maxKeywords: 10
          })
          extractedKeywords = extractionResult.keywords
          console.log('🔍 Keyword Extraction Debug Results:')
          console.log('- Original prose notes:', data.proseNotes)
          console.log('- Extracted keywords:', extractedKeywords)
          console.log('- Extraction confidence:', extractionResult.confidence + '%')
          console.log('- Processing time:', extractionResult.processingTimeMs + 'ms')
        } catch (extractionError) {
          console.warn('⚠️ Keyword extraction failed:', extractionError)
          extractedKeywords = []
        }
      }

      const tastingData: CreateTastingData = {
        name: data.name,
        description: data.description,
        mode: selectedMode!,
        is_blind: data.isBlind,
        review_type: selectedMode === 'study' ? 'prose' : 'quick', // Study uses prose for flavor wheel generation
        product_type: data.productType,
        product_type_id: data.productTypeId || undefined,
        template_id: data.templateId || undefined,
        categories: selectedMode === 'competition'
          ? (data.competitionCategories || []).map((cat, idx) => ({
              name: `Category ${idx + 1}`,
              parameterType: 'contains_x' as const,
              options: { exactAnswer: cat.exactAnswer, containsX: cat.containsX },
              rankOption: data.rankParticipants || false
            }))
          : (data.categories || []),
        items: data.items || [],
        // Add extracted keywords for debugging
        extracted_keywords: extractedKeywords.length > 0 ? extractedKeywords : undefined,
        prose_notes: data.proseNotes || undefined
      }

      const result = await createTasting(tastingData)

      toast({
        title: 'Tasting created successfully!',
        description: `Your ${selectedMode} tasting "${data.name}" has been created. ${extractedKeywords.length > 0 ? `Found ${extractedKeywords.length} flavor keywords from your notes.` : ''}`
      })

      // Navigate to the created tasting
      const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
      router.push(`/${currentLocale}/participate?tasting=${result.id}`)
    } catch (error: any) {
      console.error('Error creating tasting:', error)
      toast({
        title: 'Error creating tasting',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // For unauthorized users, always show the full interface but disable interactions when modal is open
  const isUnauthorizedWithModal = !isAuthenticated && showSignInModal

  // Mode selection view
  if (!selectedMode) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className={`container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 min-h-[calc(100vh-8rem)] flex items-center justify-center overflow-hidden ${isUnauthorizedWithModal ? 'pointer-events-none opacity-50' : ''}`}>
          <div className={`w-full ${microAnimations.fadeIn}`}>
            {/* Type Selection */}
            <Card className={`${microAnimations.cardHover} shadow-lg`}>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl">What would you like to create?</CardTitle>
                <CardDescription>Choose the type of experience you want to share</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
                  {[
                    {
                      mode: 'study' as const,
                      icon: BookOpen,
                      title: 'Study Mode',
                      description: 'Flexible tasting for learning with prose input and flavor wheel generation',
                    },
                    {
                      mode: 'competition' as const,
                      icon: Target,
                      title: 'Competition Mode',
                      description: 'Structured competition with scoring and ranking',
                    },
                    {
                      mode: 'quick' as const,
                      icon: Star,
                      title: 'Quick Tasting',
                      description: 'Simple 4-category evaluation',
                    },
                  ].map(({ mode, icon: Icon, title, description }) => (
                    <button
                      key={mode}
                      onClick={() => handleModeSelect(mode)}
                      className={`p-4 sm:p-6 rounded-xl border-2 transition-all text-center border-gray-200 hover:border-gray-300 hover:shadow-md min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center ${microAnimations.buttonHover}`}
                    >
                      <Icon className="h-10 w-10 mx-auto mb-3 flex-shrink-0" />
                      <div className="flex flex-col flex-1 min-h-0">
                        <h3 className="font-semibold text-lg mb-2 leading-tight">{title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed break-words hyphens-auto">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sign In Modal for unauthorized users after 3-second preview */}
        <SignInModal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        />
      </DashboardAppShell>
    )
  }

  // Mode-specific forms
  return (
    <DashboardAppShell activeNavItem="create" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleBackToModes}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modes
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create {selectedMode?.charAt(0).toUpperCase()}{selectedMode?.slice(1)} Tasting</h1>
            <p className="text-muted-foreground">
              {selectedMode === 'study' && 'Flexible tasting with prose input for flavor wheel generation'}
              {selectedMode === 'competition' && 'Structured competition with scoring'}
              {selectedMode === 'quick' && 'Simple evaluation'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Choose Template Button */}
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Speed up your tasting creation</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose from professional templates to auto-populate items and details
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => setShowTemplateModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Choose Template
                  </Button>
                  {selectedTemplate && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedTemplate(null)
                        // Reset form to defaults
                        setValue('name', '')
                        setValue('description', '')
                        setValue('items', [])
                        setValue('productType', '')
                        toast({
                          title: 'Template cleared',
                          description: 'Form has been reset to manual entry mode.'
                        })
                      }}
                    >
                      Clear Template
                    </Button>
                  )}
                </div>
                {selectedTemplate && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Using template: {selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data has been auto-populated. You can customize it below.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Set up the basic details for your {selectedMode} tasting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tasting Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Tasting name is required' })}
                  placeholder="e.g., Wine Appreciation Session"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Optional description of your tasting session"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isBlind"
                  {...register('isBlind')}
                />
                <Label htmlFor="isBlind">Blind Tasting</Label>
                <span className="text-sm text-muted-foreground ml-2">
                  Hide item names from participants
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Mode-specific sections */}
          {selectedMode === 'study' && (
            <>
              {/* Prose Input for Study Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Prose Input for Flavor Analysis</CardTitle>
                  <CardDescription>
                    Add detailed tasting notes for AI-powered flavor wheel generation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...register('proseNotes')}
                    placeholder="Describe your tasting experience in detail. Include aromas, flavors, textures, and any other observations. This will be used to generate a personalized flavor wheel."
                    rows={6}
                  />
                </CardContent>
              </Card>

              {/* Items Section for Study Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Items to Taste</CardTitle>
                  <CardDescription>
                    Add the items that will be evaluated in this tasting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watch('items').map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item Name */}
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            placeholder={`Enter item ${index + 1} name`}
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                          <Label>Item Image (Optional)</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleImageUpload(index, file)
                              }}
                              className="hidden"
                              id={`image-upload-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`image-upload-${index}`)?.click()}
                              className="flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload Image</span>
                            </Button>
                            {item.image && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImageUpload(index, null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          {/* Image Preview */}
                          {item.imagePreview && (
                            <div className="mt-2">
                              <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                <img
                                  src={item.imagePreview}
                                  alt={`Preview for ${item.name || `Item ${index + 1}`}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.image?.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              {/* Categories Section - Optional for Study Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Categories (Optional)</CardTitle>
                  <CardDescription>
                    Add structured evaluation categories for your study tasting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watch('categories').map((category, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Category {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategory(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <Label>Category Name</Label>
                        {!customCategoryInputs[index] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCustomCategoryInputs(prev => ({ ...prev, [index]: true }))}
                            className="text-xs"
                          >
                            Custom Category
                          </Button>
                        )}
                      </div>

                      {customCategoryInputs[index] ? (
                        <div className="flex gap-2">
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                            placeholder="Enter custom category name"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomCategoryInputs(prev => ({ ...prev, [index]: false }))
                              updateCategory(index, 'name', '')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Select
                          value={category.name}
                          onValueChange={(value) => updateCategory(index, 'name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVALUATION_DESCRIPTORS.map((descriptor) => (
                              <SelectItem key={descriptor} value={descriptor}>
                                {descriptor}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCategory}
                    disabled={watch('categories').length >= 10}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {selectedMode === 'competition' && (
            <>
              {/* Competition Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Competition Settings</CardTitle>
                  <CardDescription>
                    Configure your competition parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rankParticipants"
                      {...register('rankParticipants')}
                    />
                    <Label htmlFor="rankParticipants">Rank Participants</Label>
                    <span className="text-sm text-muted-foreground ml-2">
                      Show leaderboard and rankings
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Competition Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Competition Categories</CardTitle>
                  <CardDescription>
                    Set up to 10 categories with exact answers and fuzzy matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <h4 className="font-medium">Category {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Exact Answer</Label>
                          <Input
                            {...register(`competitionCategories.${index}.exactAnswer` as const)}
                            placeholder="Exact answer required"
                          />
                        </div>
                        <div>
                          <Label>Contains X (Fuzzy Match)</Label>
                          <Input
                            {...register(`competitionCategories.${index}.containsX` as const)}
                            placeholder="Partial match keywords (comma-separated)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Items Section for Competition Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Items to Taste</CardTitle>
                  <CardDescription>
                    Add the items that will be evaluated in this competition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watch('items').map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Item Name */}
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                            placeholder={`Enter item ${index + 1} name`}
                          />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                          <Label>Item Image (Optional)</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleImageUpload(index, file)
                              }}
                              className="hidden"
                              id={`competition-image-upload-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`competition-image-upload-${index}`)?.click()}
                              className="flex items-center space-x-2"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload Image</span>
                            </Button>
                            {item.image && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImageUpload(index, null)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            )}
                          </div>

                          {/* Image Preview */}
                          {item.imagePreview && (
                            <div className="mt-2">
                              <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
                                <img
                                  src={item.imagePreview}
                                  alt={`Preview for ${item.name || `Item ${index + 1}`}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.image?.name}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              {/* Prose Input for Competition Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                  <CardDescription>
                    Optional notes for flavor analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...register('proseNotes')}
                    placeholder="Optional tasting notes for AI analysis"
                    rows={4}
                  />
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Tasting'}
            </Button>
          </div>
        </form>
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Choose Template
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <TemplateLibrary
              onSelectTemplate={handleTemplateSelect}
              showCreateButton={false}
              className="border-0 shadow-none"
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardAppShell>
  )
}
