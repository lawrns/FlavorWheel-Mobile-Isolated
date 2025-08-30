'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Camera, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
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
} from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { createTasting, type CreateTastingData, getTemplates, type Template } from '@/services/create-tasting-service'
import { getDescriptorsForCategory, getAllCategories } from '@/services/flavor-dictionary-service'
import { useAuth } from '@/components/auth-provider'

interface TastingItem {
  id: string
  name: string
  photo?: string
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

type TastingStep = 'category' | 'flavors' | 'items' | 'review'

const TRANSLATIONS = {
  en: {
    title: 'Quick Tasting',
    subtitle: 'Select your drink and start in seconds',
    whatTasting: 'What are you tasting?',
    flavorsDetected: '¿Qué sabores detectas?',
    flavorsSubtitle: 'Select the flavors you detect and adjust their intensity',
    addCustomFlavor: 'Add custom flavor...',
    add: 'Add',
    selectedFlavors: 'Selected Flavors & Intensity',
    name: 'Name',
    photo: 'Photo (Optional)',
    addPhoto: 'Add Photo',
    aroma: 'Aroma',
    flavor: 'Flavor',
    otherNotes: 'Other Notes',
    overallRating: 'Overall Rating',
    addItem: 'Add Another Item',
    endTasting: 'End Tasting',
    autoSaved: 'Your tasting will be saved automatically',
    back: 'Back'
  },
  es: {
    title: 'Cata Rápida',
    subtitle: 'Selecciona tu bebida y comienza en segundos',
    whatTasting: '¿Qué estás catando?',
    flavorsDetected: '¿Qué sabores detectas?',
    flavorsSubtitle: 'Selecciona los sabores que detectas y ajusta su intensidad',
    addCustomFlavor: 'Añadir sabor personalizado...',
    add: 'Añadir',
    selectedFlavors: 'Sabores Seleccionados e Intensidad',
    name: 'Nombre',
    photo: 'Foto (Opcional)',
    addPhoto: 'Añadir Foto',
    aroma: 'Aroma',
    flavor: 'Sabor',
    otherNotes: 'Otras Notas',
    overallRating: 'Calificación General',
    addItem: 'Añadir Otro Elemento',
    endTasting: 'Finalizar Cata',
    autoSaved: 'Tu cata se guardará automáticamente',
    back: 'Volver'
  }
}

const TASTING_CATEGORIES = [
  // Wines
  { value: 'white-wine', label: 'White Wine', icon: '🍷', category: 'Wine' },
  { value: 'red-wine', label: 'Red Wine', icon: '🍷', category: 'Wine' },
  { value: 'rosé-wine', label: 'Rosé Wine', icon: '🍷', category: 'Wine' },
  { value: 'sparkling-wine', label: 'Sparkling Wine', icon: '🥂', category: 'Wine' },
  { value: 'dessert-wine', label: 'Dessert Wine', icon: '🍷', category: 'Wine' },

  // Spirits
  { value: 'whisky', label: 'Whisky', icon: '🥃', category: 'Spirits' },
  { value: 'scotch', label: 'Scotch', icon: '🥃', category: 'Spirits' },
  { value: 'bourbon', label: 'Bourbon', icon: '🥃', category: 'Spirits' },
  { value: 'gin', label: 'Gin', icon: '🍸', category: 'Spirits' },
  { value: 'vodka', label: 'Vodka', icon: '🍸', category: 'Spirits' },
  { value: 'rum', label: 'Rum', icon: '🥃', category: 'Spirits' },
  { value: 'brandy', label: 'Brandy', icon: '🥃', category: 'Spirits' },
  { value: 'cognac', label: 'Cognac', icon: '🥃', category: 'Spirits' },

  // Mexican Spirits
  { value: 'mezcal', label: 'Mezcal', icon: '🥃', category: 'Mexican Spirits' },
  { value: 'tequila', label: 'Tequila', icon: '🥃', category: 'Mexican Spirits' },
  { value: 'sotol', label: 'Sotol', icon: '🥃', category: 'Mexican Spirits' },
  { value: 'raicilla', label: 'Raicilla', icon: '🥃', category: 'Mexican Spirits' },
  { value: 'bacanora', label: 'Bacanora', icon: '🥃', category: 'Mexican Spirits' },

  // Beer & Fermented
  { value: 'beer', label: 'Beer', icon: '🍺', category: 'Beer & Fermented' },
  { value: 'craft-beer', label: 'Craft Beer', icon: '🍺', category: 'Beer & Fermented' },
  { value: 'sake', label: 'Sake', icon: '🍶', category: 'Beer & Fermented' },

  // Non-Alcoholic Beverages
  { value: 'coffee', label: 'Coffee', icon: '☕', category: 'Non-Alcoholic' },
  { value: 'tea', label: 'Tea', icon: '🍵', category: 'Non-Alcoholic' },
  { value: 'chocolate', label: 'Chocolate', icon: '🍫', category: 'Non-Alcoholic' },

  // Food Items
  { value: 'olive-oil', label: 'Olive Oil', icon: '🫒', category: 'Food' },
  { value: 'cheese', label: 'Cheese', icon: '🧀', category: 'Food' },
  { value: 'honey', label: 'Honey', icon: '🍯', category: 'Food' },
  { value: 'chocolate-bar', label: 'Chocolate Bar', icon: '🍫', category: 'Food' },
  { value: 'dessert', label: 'Dessert', icon: '🍰', category: 'Food' },

  // Snacks
  { value: 'chips', label: 'Chips', icon: '🥔', category: 'Snacks' },
  { value: 'nuts', label: 'Nuts', icon: '🥜', category: 'Snacks' },
  { value: 'crackers', label: 'Crackers', icon: '🍘', category: 'Snacks' },

  // Specialty
  { value: 'perfume', label: 'Perfume', icon: '�', category: 'Specialty' },
  { value: 'essential-oil', label: 'Essential Oil', icon: '🌿', category: 'Specialty' },
  { value: 'spices', label: 'Spices', icon: '🌶️', category: 'Specialty' },

  // Other
  { value: 'other', label: 'Other', icon: '❓', category: 'Other' },
]

export default function QuickTastingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState<TastingStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [flavors, setFlavors] = useState<FlavorDescriptor[]>([])
  const [customFlavorInput, setCustomFlavorInput] = useState('')
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [language, setLanguage] = useState<'en' | 'es'>('en')

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoadingTemplates(true)
      try {
        const templates = await getTemplates()
        // Filter for beginner and intermediate templates suitable for quick tasting
        const quickTemplates = templates.filter(template =>
          template.difficulty_level !== 'professional' &&
          template.num_samples <= 5 &&
          template.template_categories?.some(cat => cat.parameter_type === 'subjective_input')
        )
        setAvailableTemplates(quickTemplates)
      } catch (error) {
        console.error('Error loading templates:', error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }
    loadTemplates()
  }, [])

  // Load flavor descriptors when category changes
  useEffect(() => {
    if (selectedCategory) {
      // Set basic flavor descriptors based on category
      const getBasicFlavors = (category: string): FlavorDescriptor[] => {
        const commonFlavors = [
          { id: '1', name: 'Sweet', intensity: 5, selected: false },
          { id: '2', name: 'Bitter', intensity: 5, selected: false },
          { id: '3', name: 'Sour', intensity: 5, selected: false },
          { id: '4', name: 'Salty', intensity: 5, selected: false },
          { id: '5', name: 'Spicy', intensity: 5, selected: false },
          { id: '6', name: 'Fruity', intensity: 5, selected: false },
          { id: '7', name: 'Floral', intensity: 5, selected: false },
          { id: '8', name: 'Earthy', intensity: 5, selected: false },
        ]

        // Add category-specific flavors
        if (category.includes('wine')) {
          return [...commonFlavors,
            { id: '9', name: 'Oaky', intensity: 5, selected: false },
            { id: '10', name: 'Tannins', intensity: 5, selected: false },
            { id: '11', name: 'Mineral', intensity: 5, selected: false },
          ]
        } else if (category.includes('coffee')) {
          return [...commonFlavors,
            { id: '9', name: 'Nutty', intensity: 5, selected: false },
            { id: '10', name: 'Chocolate', intensity: 5, selected: false },
            { id: '11', name: 'Roasted', intensity: 5, selected: false },
          ]
        } else if (category === 'mezcal' || category === 'tequila') {
          return [...commonFlavors,
            { id: '9', name: 'Smoky', intensity: 5, selected: false },
            { id: '10', name: 'Agave', intensity: 5, selected: false },
            { id: '11', name: 'Herbal', intensity: 5, selected: false },
          ]
        }

        return commonFlavors
      }

      setFlavors(getBasicFlavors(selectedCategory))
    }
  }, [selectedCategory])

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (selectedCategory && items.some(item => item.name.trim() !== '')) {
        const draftData = {
          selectedCategory,
          flavors: flavors.filter(f => f.selected),
          items,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem('quick-tasting-draft', JSON.stringify(draftData))
        setLastSaved(new Date())
      }
    }

    const timeoutId = setTimeout(autoSave, 2000) // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timeoutId)
  }, [selectedCategory, flavors, items])

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftData = localStorage.getItem('quick-tasting-draft')
        if (draftData) {
          const parsed = JSON.parse(draftData)
          // Only load if it's recent (within 24 hours)
          const draftTime = new Date(parsed.timestamp)
          const now = new Date()
          const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60)

          if (hoursDiff < 24) {
            setSelectedCategory(parsed.selectedCategory || '')
            setFlavors(parsed.flavors || [])
            setItems(parsed.items || [{ id: '1', name: '', aroma: '', flavor: '', other: '', overall: 50 }])
            setLastSaved(draftTime)
            toast({
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

  const clearDraft = () => {
    localStorage.removeItem('quick-tasting-draft')
    setLastSaved(null)
  }

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

  // Flavor management functions
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

  // Step navigation
  const nextStep = () => {
    if (currentStep === 'category' && selectedCategory) {
      setCurrentStep('flavors')
    } else if (currentStep === 'flavors') {
      setCurrentStep('items')
    } else if (currentStep === 'items') {
      setCurrentStep('review')
    }
  }

  const prevStep = () => {
    if (currentStep === 'flavors') {
      setCurrentStep('category')
    } else if (currentStep === 'items') {
      setCurrentStep('flavors')
    } else if (currentStep === 'review') {
      setCurrentStep('items')
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    // Auto-populate category if template has product type
    if (template.product_type?.name) {
      const matchingCategory = TASTING_CATEGORIES.find(cat =>
        cat.label.toLowerCase().includes(template.product_type?.name.toLowerCase() || '')
      )
      if (matchingCategory) {
        setSelectedCategory(matchingCategory.value)
      }
    }
    // Adjust number of items based on template
    if (template.num_samples > items.length) {
      const newItems = Array.from({ length: template.num_samples - items.length }, (_, i) => ({
        id: (items.length + i + 1).toString(),
        name: '',
        aroma: '',
        flavor: '',
        other: '',
        overall: 50,
      }))
      setItems([...items, ...newItems])
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your tasting.",
        variant: "destructive",
      })
      return
    }

    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select what you're tasting.",
        variant: "destructive",
      })
      return
    }

    const validItems = items.filter(item => item.name.trim() !== '')
    if (validItems.length === 0) {
      toast({
        title: "Item Required",
        description: "Please add at least one item with a name.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare tasting data for backend
      const tastingData: CreateTastingData = {
        name: selectedTemplate
          ? `${selectedTemplate.name} - Quick Session`
          : `Quick Tasting - ${TASTING_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory}`,
        description: selectedTemplate
          ? `Quick tasting based on ${selectedTemplate.name} template with ${validItems.length} item(s)`
          : `Quick tasting session with ${validItems.length} item(s)`,
        mode: 'quick',
        is_blind: false,
        review_type: 'quick',
        product_type: selectedCategory,
        template_id: selectedTemplate?.id,
        categories: selectedTemplate?.template_categories
          ?.filter(cat => cat.parameter_type === 'subjective_input')
          .map(cat => ({
            name: cat.name,
            parameterType: cat.parameter_type,
            options: cat.options,
            rankOption: cat.rank_option,
            sortOrder: cat.sort_order
          })) || [],
        items: validItems.map(item => ({
          name: item.name,
          details: JSON.stringify({
            aroma: item.aroma,
            flavor: item.flavor,
            other: item.other,
            overall_rating: item.overall,
            selected_flavors: flavors.filter(f => f.selected).map(f => ({
              name: f.name,
              intensity: f.intensity,
              isCustom: f.isCustom || false
            }))
          })
        }))
      }

      const result = await createTasting(tastingData)

      // Clear the draft after successful submission
      clearDraft()

      toast({
        title: "Tasting Saved!",
        description: "Your quick tasting has been recorded successfully.",
      })

      // Prepare complete tasting data for confirmation and input screens
      const completionTastingData = {
        id: result.id,
        name: `Quick Tasting - ${TASTING_CATEGORIES.find(cat => cat.value === selectedCategory)?.label || selectedCategory}`,
        mode: 'quick' as const,
        product_type: selectedCategory,
        categories: [
          {
            id: 'aroma',
            name: 'Aroma',
            parameterType: 'subjective_input'
          },
          {
            id: 'flavor',
            name: 'Flavor',
            parameterType: 'subjective_input'
          },
          {
            id: 'other',
            name: 'Other Notes',
            parameterType: 'subjective_input'
          }
        ],
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          category: selectedCategory
        })),
        quickNotes: {
          aroma: items.find(item => item.name)?.aroma || '',
          flavor: items.find(item => item.name)?.flavor || '',
          other: items.find(item => item.name)?.other || '',
          selectedFlavors: flavors.filter(f => f.selected)
        }
      }

      // Store tasting data temporarily for confirmation screen
      sessionStorage.setItem('tasting-completion-data', JSON.stringify(completionTastingData))
      router.push(`/quick-tasting/${result.id}/confirm`)
    } catch (error: any) {
      console.error('Error saving tasting:', error)
      toast({
        title: "Error Saving Tasting",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-between items-start">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {TRANSLATIONS[language].back}
            </Button>

            {/* Language Toggle */}
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
                className={`text-xs ${language === 'en' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'}`}
              >
                EN
              </Button>
              <Button
                variant={language === 'es' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('es')}
                className={`text-xs ${language === 'es' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200'}`}
              >
                ES
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">{TRANSLATIONS[language].title}</h1>
          <p className="text-neutral-600">{TRANSLATIONS[language].subtitle}</p>
          {lastSaved && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Auto-saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <Card className="mb-6 border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-neutral-800">{TRANSLATIONS[language].whatTasting}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="What are you tasting?" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {/* Group categories */}
                {Object.entries(
                  TASTING_CATEGORIES.reduce((groups, item) => {
                    const group = item.category
                    if (!groups[group]) groups[group] = []
                    groups[group].push(item)
                    return groups
                  }, {} as Record<string, typeof TASTING_CATEGORIES>)
                ).map(([groupName, items]) => (
                  <div key={groupName}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-500 bg-gray-50">
                      {groupName}
                    </div>
                    {items.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Flavor Detection Section */}
        {selectedCategory && flavors.length > 0 && (
          <Card className="mb-6 border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-800">{TRANSLATIONS[language].flavorsDetected}</CardTitle>
              <p className="text-sm text-neutral-600">
                {TRANSLATIONS[language].flavorsSubtitle}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flavor Toggle Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {flavors.map((flavor) => (
                  <Toggle
                    key={flavor.id}
                    pressed={flavor.selected}
                    onPressedChange={() => toggleFlavor(flavor.id)}
                    className="justify-start text-sm data-[state=on]:bg-green-100 data-[state=on]:text-green-800"
                  >
                    {flavor.name}
                    {flavor.isCustom && <span className="ml-1 text-xs">*</span>}
                  </Toggle>
                ))}
              </div>

              {/* Custom Flavor Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={TRANSLATIONS[language].addCustomFlavor}
                  value={customFlavorInput}
                  onChange={(e) => setCustomFlavorInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="border-neutral-300 focus:border-green-500 focus:ring-green-500"
                />
                <Button
                  onClick={addCustomFlavor}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  {TRANSLATIONS[language].add}
                </Button>
              </div>

              {/* Selected Flavors with Intensity Sliders */}
              {flavors.filter(f => f.selected).length > 0 && (
                <div className="space-y-3 pt-4 border-t border-neutral-200">
                  <h4 className="font-medium text-neutral-800">{TRANSLATIONS[language].selectedFlavors}</h4>
                  {flavors.filter(f => f.selected).map((flavor) => (
                    <div key={flavor.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-neutral-700 min-w-20">
                        {flavor.name}
                      </span>
                      <Slider
                        value={[flavor.intensity]}
                        onValueChange={(value) => updateFlavorIntensity(flavor.id, value[0])}
                        min={0}
                        max={10}
                        step={1}
                        className="flex-1 [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
                      />
                      <span className="text-sm text-neutral-600 min-w-8">
                        {flavor.intensity}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Optional Template Selection */}
        {(availableTemplates.length > 0 || isLoadingTemplates) && (
          <Card className="mb-6 border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-neutral-800">
                Use a Template (Optional)
              </CardTitle>
              <p className="text-sm text-neutral-600">
                Choose a template to guide your tasting with structured categories
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Loading templates...</div>
                </div>
              ) : (
                <Select
                  value={selectedTemplate?.id || 'none'}
                  onValueChange={(value) => {
                    if (value && value !== 'none') {
                      const template = availableTemplates.find(t => t.id === value)
                      if (template) handleTemplateSelect(template)
                    } else {
                      setSelectedTemplate(null)
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a template (optional)..." />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {availableTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="text-xs text-gray-500">
                          {template.difficulty_level} • {template.num_samples} samples • {template.duration}min
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              )}
              {selectedTemplate && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Template:</strong> {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {selectedTemplate.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-neutral-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base text-neutral-800">
                    Item {index + 1}
                  </CardTitle>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div>
                    <Label htmlFor={`name-${item.id}`} className="text-neutral-700">Name</Label>
                    <Input
                      id={`name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Enter item name..."
                      className="border-neutral-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Photo */}
                  <div>
                    <Label className="text-neutral-700">Photo (Optional)</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      onClick={() => {
                        // TODO: Implement photo upload
                        toast({
                          title: "Photo Upload",
                          description: "Photo upload feature coming soon!",
                        })
                      }}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Add Photo
                    </Button>
                  </div>

                  {/* Aroma */}
                  <div>
                    <Label htmlFor={`aroma-${item.id}`} className="text-neutral-700">Aroma</Label>
                    {flavors.filter(f => f.selected).length > 0 && (
                      <div className="mb-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        <strong>Detected flavors:</strong> {flavors.filter(f => f.selected).map(f => `${f.name} (${f.intensity}/10)`).join(', ')}
                      </div>
                    )}
                    <Textarea
                      id={`aroma-${item.id}`}
                      value={item.aroma}
                      onChange={(e) => updateItem(item.id, 'aroma', e.target.value)}
                      placeholder="Describe the aroma... (flavors detected above will be included)"
                      rows={2}
                      className="border-neutral-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Flavor */}
                  <div>
                    <Label htmlFor={`flavor-${item.id}`} className="text-neutral-700">Flavor</Label>
                    {flavors.filter(f => f.selected).length > 0 && (
                      <div className="mb-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        <strong>Selected flavors:</strong> {flavors.filter(f => f.selected).map(f => `${f.name} (${f.intensity}/10)`).join(', ')}
                      </div>
                    )}
                    <Textarea
                      id={`flavor-${item.id}`}
                      value={item.flavor}
                      onChange={(e) => updateItem(item.id, 'flavor', e.target.value)}
                      placeholder="Describe the flavor... (selected flavors above will be included)"
                      rows={2}
                      className="border-neutral-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Other */}
                  <div>
                    <Label htmlFor={`other-${item.id}`} className="text-neutral-700">Other Notes</Label>
                    <Textarea
                      id={`other-${item.id}`}
                      value={item.other}
                      onChange={(e) => updateItem(item.id, 'other', e.target.value)}
                      placeholder="Any other important information?"
                      rows={2}
                      className="border-neutral-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Overall Rating */}
                  <div>
                    <Label className="text-neutral-700">Overall Rating: {item.overall}/100</Label>
                    <div className="mt-2">
                      <Slider
                        value={[item.overall]}
                        onValueChange={(value) => updateItem(item.id, 'overall', value[0])}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full [&_[role=slider]]:bg-green-500 [&_[role=slider]]:border-green-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Item Button */}
        <div className="my-6 text-center">
          <Button
            onClick={addNewItem}
            variant="outline"
            className="flex items-center gap-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
            {TRANSLATIONS[language].addItem}
          </Button>
        </div>

        {/* Submit Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium"
            size="lg"
          >
            {isSubmitting ? (language === 'en' ? 'Saving...' : 'Guardando...') : TRANSLATIONS[language].endTasting}
          </Button>
          <p className="mt-2 text-sm text-neutral-500">
            {TRANSLATIONS[language].autoSaved}
          </p>
        </div>
      </div>
    </div>
  )
}
