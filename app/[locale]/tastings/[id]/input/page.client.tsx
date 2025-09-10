'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import {
  ArrowLeft, ArrowRight, Save, CheckCircle, Clock,
  MessageSquare, Sliders, List, Type, Search,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TastingItem {
  id: string
  name: string
  image?: string
  category?: string
}

// Raw category data from API (snake_case)
interface RawCategory {
  id: string
  name: string
  parameter_type: 'subjective_input' | 'sliding_scale' | 'multiple_choice' | 'exact_answer' | 'contains_x'
  options?: string[]
  min_value?: number
  max_value?: number
  contains_text?: string
  rank_option?: boolean
}

// Normalized category interface (camelCase)
interface Category {
  id: string
  name: string
  parameterType: 'subjective_input' | 'sliding_scale' | 'multiple_choice' | 'exact_answer' | 'contains_x'
  options?: string[]
  minValue?: number
  maxValue?: number
  containsText?: string
  rankOption?: boolean
}

interface TastingData {
  id: string
  name: string
  mode: 'study' | 'competition' | 'quick'
  product_type: string
  categories: Category[]
  items: TastingItem[]
  preLoadedData?: any[]
}

interface TastingInputPageClientProps {
  params: {
    locale: string
    id: string
  }
}

interface TastingResponse {
  itemId: string
  categoryId: string
  categoryName?: string
  value: any
  parameterType: string
  maxValue?: number
  minValue?: number
}

export default function TastingInputPageClient({ params }: TastingInputPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [tastingData, setTastingData] = useState<TastingData | null>(null)
  const [responses, setResponses] = useState<Record<string, TastingResponse>>({})
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTastingData()
  }, [params.id])

  const loadTastingData = async () => {
    try {
      setLoading(true)

      // Try to load actual tasting data from sessionStorage
      const inputData = sessionStorage.getItem('tasting-input-data')
      console.log('🔍 SESSIONSTORAGE INPUT DATA RAW:', inputData)

      if (inputData) {
        const parsed = JSON.parse(inputData)
        console.log('🔍 SESSIONSTORAGE PARSED DATA:', parsed)

        if (parsed.id === params.id) {
          console.log('✅ LOADING SESSIONSTORAGE TASTING DATA:', parsed)
          console.log('🔍 SESSIONSTORAGE CATEGORIES:', parsed.categories)
          console.log('🔍 SESSIONSTORAGE ITEMS:', parsed.items)

          // Log each category's parameter type to identify the issue
          parsed.categories.forEach((cat: RawCategory, index: number) => {
            // Debug: Log category info
            console.log(`🔍 SESSIONSTORAGE CATEGORY ${index}: ${cat.name}`, {
              id: cat.id,
              name: cat.name,
              parameterType: cat.parameterType,
              allKeys: Object.keys(cat)
            })
          })

          // Validate data structure
          if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
            console.error('No categories found in data:', parsed)
            throw new Error('Invalid tasting data: No categories found')
          }

          if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
            console.error('No items found in data:', parsed)
            throw new Error('Invalid tasting data: No items found')
          }

          // Map categories to ensure proper camelCase properties
          const mappedCategories: Category[] = parsed.categories.map((cat: RawCategory) => ({
            id: cat.id,
            name: cat.name,
            parameterType: cat.parameter_type || 'subjective_input',
            options: cat.options,
            minValue: cat.min_value,
            maxValue: cat.max_value,
            containsText: cat.contains_text,
            rankOption: cat.rank_option
          }))

          // Map items to ensure proper structure
          const mappedItems = parsed.items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            category: item.category || parsed.product_type
          }))

          const tastingData: TastingData = {
            id: parsed.id,
            name: parsed.name,
            mode: parsed.mode,
            product_type: parsed.product_type,
            categories: mappedCategories,
            items: mappedItems
          }

          console.log('Mapped tasting data:', tastingData) // Debug final data

          setTastingData(tastingData)

          // Initialize responses structure with full metadata
          const initialResponses: Record<string, TastingResponse> = {}
          tastingData.items.forEach((item: TastingItem) => {
            tastingData.categories.forEach((category: Category) => {
              const responseKey = `${item.id}-${category.id}`
              const defaultValue = getDefaultValue(category.parameterType)

              console.log('🏗️ INITIALIZING RESPONSE (MAIN):', {
                responseKey,
                itemName: item.name,
                categoryName: category.name,
                parameterType: category.parameterType,
                defaultValue,
                defaultValueType: typeof defaultValue
              })

              initialResponses[responseKey] = {
                itemId: item.id,
                categoryId: category.id,
                categoryName: category.name,
                value: defaultValue,
                parameterType: category.parameterType,
                maxValue: category.maxValue,
                minValue: category.minValue
              }
            })
          })

          console.log('🏗️ INITIALIZED ALL RESPONSES (MAIN):', initialResponses)
          setResponses(initialResponses)

          setLoading(false)
          return
        }
      }

      // Fallback: try to load from completion data if input data not found
      const completionData = sessionStorage.getItem('tasting-completion-data')
      if (completionData) {
        const parsed = JSON.parse(completionData)
        if (parsed.id === params.id && parsed.categories && parsed.items) {
          console.log('Loading from completion data:', parsed) // Debug log
          console.log('Completion Categories:', parsed.categories) // Debug categories
          console.log('Completion Items:', parsed.items) // Debug items

          // Validate data structure
          if (!parsed.categories || !Array.isArray(parsed.categories) || parsed.categories.length === 0) {
            throw new Error('Invalid completion data: No categories found')
          }

          if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
            throw new Error('Invalid completion data: No items found')
          }

          // Map categories to ensure proper camelCase properties
          const mappedCategories: Category[] = parsed.categories.map((cat: RawCategory) => ({
            id: cat.id,
            name: cat.name,
            parameterType: cat.parameter_type || 'subjective_input',
            options: cat.options,
            minValue: cat.min_value,
            maxValue: cat.max_value,
            containsText: cat.contains_text,
            rankOption: cat.rank_option
          }))

          // Map items to ensure proper structure
          const mappedItems = parsed.items.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            category: item.category || parsed.product_type
          }))

          const tastingData: TastingData = {
            id: parsed.id,
            name: parsed.name,
            mode: parsed.mode,
            product_type: parsed.product_type,
            categories: mappedCategories,
            items: mappedItems
          }

          console.log('Mapped completion tasting data:', tastingData) // Debug final data

          setTastingData(tastingData)

          // Initialize responses structure with full metadata
          const initialResponses: Record<string, TastingResponse> = {}
          tastingData.items.forEach((item: TastingItem) => {
            tastingData.categories.forEach((category: Category) => {
              const responseKey = `${item.id}-${category.id}`
              const defaultValue = getDefaultValue(category.parameterType)

              console.log('🏗️ INITIALIZING RESPONSE (COMPLETION):', {
                responseKey,
                itemName: item.name,
                categoryName: category.name,
                parameterType: category.parameterType,
                defaultValue,
                defaultValueType: typeof defaultValue
              })

              initialResponses[responseKey] = {
                itemId: item.id,
                categoryId: category.id,
                categoryName: category.name,
                value: defaultValue,
                parameterType: category.parameterType,
                maxValue: category.maxValue,
                minValue: category.minValue
              }
            })
          })

          console.log('🏗️ INITIALIZED ALL RESPONSES (COMPLETION):', initialResponses)
          setResponses(initialResponses)

          setLoading(false)
          return
        }
      }

      // If no data found, show error
      console.error('No tasting setup data found for ID:', params.id) // Debug log
      toast({
        title: 'Setup Data Missing',
        description: 'Tasting setup data not found. Please return to setup and try again.',
        variant: 'destructive'
      })

      // Small delay before redirect to allow user to see the message
      setTimeout(() => {
        router.push(`/${params.locale}/create`)
      }, 2000)

    } catch (error) {
      console.error('Failed to load tasting data:', error)
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load tasting setup data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getDefaultValue = (parameterType: string) => {
    console.log('Getting default value for parameter type:', parameterType) // Debug
    switch (parameterType) {
      case 'subjective_input':
        return ''
      case 'sliding_scale':
        return 5
      case 'multiple_choice':
        return ''
      case 'exact_answer':
        return ''
      case 'contains_x':
        return ''
      default:
        console.warn('Unknown parameter type for default value:', parameterType)
        return ''
    }
  }

  const updateResponse = (itemId: string, categoryId: string, value: any) => {
    const responseKey = `${itemId}-${categoryId}`
    const category = tastingData?.categories?.find(c => c.id === categoryId)
    const parameterType = category?.parameterType

    console.log('🔄 UPDATE RESPONSE:', {
      itemId,
      categoryId,
      categoryName: category?.name,
      parameterType,
      value,
      valueType: typeof value,
      currentItem: tastingData?.items?.find(i => i.id === itemId)?.name
    })

    setResponses(prev => ({
      ...prev,
      [responseKey]: {
        ...prev[responseKey],
        value
      }
    }))
  }

  const getResponseValue = (itemId: string, categoryId: string) => {
    const responseKey = `${itemId}-${categoryId}`
    return responses[responseKey]?.value
  }

  const saveProgress = async () => {
    if (!tastingData) return

    try {
      setSaving(true)

      // Save responses to localStorage for now
      const progressData = {
        tastingId: tastingData.id,
        responses,
        currentItemIndex,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem(`tasting-progress-${tastingData.id}`, JSON.stringify(progressData))

      toast({
        title: 'Progress Saved',
        description: 'Your tasting progress has been saved.',
      })

    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save progress.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const submitTasting = async () => {
    if (!tastingData) return

    try {
      setSubmitting(true)

      // Validate that all required fields are filled
      const requiredResponses = Object.values(responses).filter(r =>
        r.parameterType === 'subjective_input' || r.parameterType === 'exact_answer'
      )

      const incompleteResponses = requiredResponses.filter(r =>
        !r.value || (typeof r.value === 'string' && r.value.trim() === '')
      )

      if (incompleteResponses.length > 0) {
        toast({
          title: 'Incomplete Form',
          description: `Please fill in all required fields (${incompleteResponses.length} missing).`,
          variant: 'destructive'
        })
        return
      }

      // Prepare submission data in NLP service format
      const formattedResponses = Object.values(responses)

      console.log('📤 SUBMISSION - FORMATTED RESPONSES:', formattedResponses)
      console.log('📤 SUBMISSION - TASTING DATA:', tastingData)

      // Log all responses by category and item for verification
      formattedResponses.forEach((response: any, index: number) => {
        console.log(`📤 SUBMISSION - Response ${index}: Item ${response.itemId}, Category ${response.categoryId} (${response.categoryName}): "${response.value}" (${response.parameterType})`)
      })

      // Log subjective inputs specifically
      const subjectiveInputsOnly = formattedResponses
        .filter(r => r.parameterType === 'subjective_input' && r.value && r.value.trim().length > 0)
        .map(r => r.value.trim())
      console.log('📤 SUBMISSION - SUBJECTIVE INPUTS ONLY:', subjectiveInputsOnly)

      // Log sliding scale values
      const sliderValues = formattedResponses
        .filter(r => r.parameterType === 'sliding_scale')
        .map(r => `${r.categoryName}: ${r.value}`)
      console.log('📤 SUBMISSION - SLIDER VALUES:', sliderValues)

      // Log cleaned subjective responses (without prefixes)
      const cleanedSubjective = formattedResponses
        .filter(r => r.parameterType === 'subjective_input' && r.value && r.value.trim().length > 0)
        .map(r => {
          const cleanedValue = r.value.trim().replace(/^.*?: /, '').trim()
          return `${r.categoryName}: "${cleanedValue}"`
        })
      console.log('📤 SUBMISSION - CLEANED SUBJECTIVE RESPONSES:', cleanedSubjective)

      // Transform responses into NLP service format
      const nlpInputData = {
        productType: tastingData.product_type,
        mode: tastingData.mode,
        subjectiveInputs: formattedResponses
          .filter(r => r.parameterType === 'subjective_input' && r.value && r.value.trim().length > 0)
          .map(r => r.value.trim()),
        preLoadedData: tastingData.items.map(item => {
          const itemResponses = formattedResponses.filter(r => r.itemId === item.id)
          return {
            subjectiveInput: itemResponses
              .filter(r => r.parameterType === 'subjective_input')
              .map(r => r.value)
              .filter(v => v && v.trim().length > 0)
              .join(' '),
            exactAnswer: itemResponses
              .filter(r => r.parameterType === 'exact_answer')
              .map(r => r.value)
              .filter(v => v && v.trim().length > 0)
              .join(' '),
            containsX: itemResponses
              .filter(r => r.parameterType === 'contains_x')
              .map(r => r.value)
              .filter(v => v && v.trim().length > 0)
              .join(' '),
            multipleChoice: itemResponses
              .filter(r => r.parameterType === 'multiple_choice')
              .map(r => r.value)
              .filter(v => v && v.trim().length > 0),
            slidingScale: itemResponses
              .filter(r => r.parameterType === 'sliding_scale')
              .map(r => {
                const category = tastingData.categories.find(c => c.id === r.categoryId)
                const maxValue = category?.maxValue || 10
                const value = parseFloat(r.value) || 0
                const percentage = (value / maxValue) * 100

                if (percentage >= 80) return 'Very High'
                if (percentage >= 60) return 'High'
                if (percentage >= 40) return 'Medium'
                if (percentage >= 20) return 'Low'
                return 'Very Low'
              })
              .filter(v => v)
          }
        }).filter(item =>
          item.subjectiveInput || item.exactAnswer || item.containsX ||
          item.multipleChoice.length > 0 || item.slidingScale
        )
      }

      const submissionData = {
        tastingId: tastingData.id,
        mode: tastingData.mode,
        productType: tastingData.product_type,
        tastingData: tastingData,
        responses: formattedResponses,
        nlpInputData: nlpInputData,
        completedAt: new Date().toISOString()
      }

      console.log('NLP Input Data:', nlpInputData) // Debug NLP data
      console.log('📤 FINAL SUBMISSION DATA:', submissionData) // Debug final data

      // Store for completion screen
      sessionStorage.setItem('tasting-submission-data', JSON.stringify(submissionData))
      // Also store in localStorage for flavorwheels persistence
      localStorage.setItem(`tasting-submission-data-${tastingData.id}`, JSON.stringify(submissionData))

      console.log('💾 STORED IN SESSIONSTORAGE:', JSON.parse(sessionStorage.getItem('tasting-submission-data') || '{}'))

      // Clear progress data
      localStorage.removeItem(`tasting-progress-${tastingData.id}`)

      toast({
        title: 'Tasting Complete!',
        description: 'Processing your flavor analysis...',
      })

      // Navigate to completion screen
      router.push(`/${params.locale}/tastings/${params.id}/completion`)

    } catch (error) {
      console.error('Failed to submit tasting:', error)
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit tasting. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (item: TastingItem, category: Category) => {
    const value = getResponseValue(item.id, category.id)
    const fieldId = `${item.id}-${category.id}`

    // Get the parameter type
    const parameterType = category.parameterType

    console.log('Rendering field:', {
      item: item.name,
      category: category.name,
      parameterType,
      value,
      categoryData: category
    }) // Debug field rendering

    switch (parameterType) {
      case 'subjective_input':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {category.name}
            </Label>
            <Textarea
              id={fieldId}
              value={value || ''}
              onChange={(e) => updateResponse(item.id, category.id, e.target.value)}
              placeholder={`Describe the ${category.name.toLowerCase()}...`}
              rows={3}
              className="w-full"
            />
          </div>
        )

      case 'sliding_scale':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {category.name}: {value || 5}/{category.maxValue || 10}
            </Label>
            <Slider
              value={[value || 5]}
              onValueChange={(newValue) => updateResponse(item.id, category.id, newValue[0])}
              min={category.minValue || 1}
              max={category.maxValue || 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {category.name}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => updateResponse(item.id, category.id, newValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Select ${category.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {(category.options || []).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'exact_answer':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {category.name}
            </Label>
            <Input
              id={fieldId}
              value={value || ''}
              onChange={(e) => updateResponse(item.id, category.id, e.target.value)}
              placeholder={`Enter ${category.name.toLowerCase()}`}
              className="w-full"
            />
          </div>
        )

      case 'contains_x':
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {category.name}
            </Label>
            <Input
              id={fieldId}
              value={value || ''}
              onChange={(e) => updateResponse(item.id, category.id, e.target.value)}
              placeholder={`Text containing: ${category.containsText || 'specific term'}`}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Include the specified term in your response
            </p>
          </div>
        )

      default:
        console.warn('Unknown parameter type:', parameterType, 'for category:', category.name)
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {category.name}
            </Label>
            <Textarea
              id={fieldId}
              value={value || ''}
              onChange={(e) => updateResponse(item.id, category.id, e.target.value)}
              placeholder={`Describe the ${category.name.toLowerCase()}...`}
              rows={3}
              className="w-full"
            />
            <p className="text-xs text-orange-600">
              Unknown field type: {parameterType} - using text input as fallback
            </p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading tasting data...</p>
          </div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!tastingData) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tasting Not Found</h1>
            <p className="text-gray-600 mb-6">The tasting data could not be loaded.</p>
            <Button onClick={() => router.push(`/${params.locale}/create`)}>
              Back to Create
            </Button>
          </div>
        </div>
      </DashboardAppShell>
    )
  }

  const currentItem = tastingData.items[currentItemIndex]
  const progress = ((currentItemIndex + 1) / tastingData.items.length) * 100

  console.log('Current item:', currentItem) // Debug current item
  console.log('All categories:', tastingData.categories) // Debug categories
  console.log('Current item index:', currentItemIndex) // Debug index

  return (
    <DashboardAppShell activeNavItem="create" maxWidth="full">
      <div className="space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">{tastingData.name}</h1>
            <p className="text-sm text-muted-foreground">Fill out your tasting notes</p>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Item {currentItemIndex + 1} of {tastingData.items.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardContent>
        </Card>

        {/* Mock Input Screen */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Review {tastingData?.product_type || 'Lager'} Tasting</h2>
          <p className="text-gray-600">Item: {currentItem?.name || 'Item 1'} ({currentItemIndex + 1}/{tastingData?.items?.length || 2})</p>

          {tastingData?.categories && tastingData.categories.length > 0 ? (
            tastingData.categories.map((category) => (
              <div key={category.id} className="mb-4">
                <label className="block text-gray-700">{category.name}</label>
                {category.parameterType === 'subjective_input' && (
                  <textarea className="w-full border p-2 rounded min-h-[44px] touch-manipulation" placeholder={`Describe the ${category.name.toLowerCase()}...`} />
                )}
                {category.parameterType === 'sliding_scale' && (
                  <div>
                    <input type="range" min="1" max="100" className="w-full min-h-[44px] touch-manipulation" />
                    <span>50</span>
                  </div>
                )}
                {category.parameterType === 'multiple_choice' && (
                  <select className="w-full border p-2 rounded min-h-[44px] touch-manipulation">
                    <option>Select {category.name.toLowerCase()}</option>
                    {(category.options || []).map((option, optIdx) => (
                      <option key={optIdx} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                {category.parameterType === 'exact_answer' && (
                  <input className="w-full border p-2 rounded min-h-[44px] touch-manipulation" placeholder={`Enter ${category.name.toLowerCase()}`} />
                )}
                {category.parameterType === 'contains_x' && (
                  <input className="w-full border p-2 rounded min-h-[44px] touch-manipulation" placeholder={`Text containing: ${category.containsText || 'specific term'}`} />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories found for this tasting.</p>
            </div>
          )}
        </div>

        {/* Mock Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button className="w-full bg-blue-500 text-white p-3 rounded min-h-[44px] touch-manipulation">Save Progress</button>
          <button
            className="w-full bg-green-500 text-white p-3 rounded min-h-[44px] touch-manipulation"
            onClick={() => {
              if (currentItemIndex < (tastingData?.items?.length - 1)) {
                setCurrentItemIndex(currentItemIndex + 1)
              } else {
                submitTasting()
              }
            }}
          >
            {currentItemIndex < (tastingData?.items?.length - 1) ? 'Next Item' : 'Finish Tasting'}
          </button>
        </div>

        {/* Item Navigation Dots */}
        <div className="flex justify-center gap-2">
          {tastingData.items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentItemIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === currentItemIndex
                  ? "bg-blue-500"
                  : index < currentItemIndex
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </DashboardAppShell>
  )
}
