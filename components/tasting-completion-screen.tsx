'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import { SunburstChart, MobileSunburstChart, useResponsiveSunburst } from '@/components/sunburst-chart'
import { processTastingForFlavorWheel, FlavorWheelViews, SunburstData } from '@/services/keyword-extraction-service'
import { buildFlavorHierarchy } from '@/services/flavor-analysis-service'
import { supabase } from '@/lib/supabase'
import {
  ArrowLeft, Trophy, Share, Download, Eye, Users,
  Sparkles, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TastingData {
  id: string
  name: string
  mode: 'study' | 'competition' | 'quick'
  product_type: string
  categories?: any[]
  items?: any[]
  subjectiveInputs?: string[]
  preLoadedData?: any[]
  quickNotes?: any
}

interface TastingCompletionScreenProps {
  tastingData: TastingData
  onBack?: () => void
}

export function TastingCompletionScreen({
  tastingData,
  onBack
}: TastingCompletionScreenProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [flavorWheels, setFlavorWheels] = useState<FlavorWheelViews | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'aroma' | 'flavor' | 'combined' | 'metaphor'>('combined')
  const [activeScope, setActiveScope] = useState<'personal' | 'universal'>('personal')
  const [hasGeneratedWheels, setHasGeneratedWheels] = useState(false)
  const [hierarchyData, setHierarchyData] = useState<SunburstData | null>(null)
  const [isClientReady, setIsClientReady] = useState(false)
  const dimensions = useResponsiveSunburst()

  useEffect(() => {
    // Set client ready state
    setIsClientReady(true)
    console.log('🎯 CLIENT READY - Hydration complete')
  }, [])

  useEffect(() => {
    // Prevent hydration mismatches - only run on client side
    if (!isClientReady) {
      console.log('🎯 USEEFFECT SKIPPED - Client not ready')
      return
    }

    // Prevent multiple triggers by using a more specific dependency and flag
    const shouldGenerate = tastingData &&
                           tastingData.id &&
                           !hasGeneratedWheels

    if (shouldGenerate) {
      console.log('🎯 USEEFFECT TRIGGERED - Generating flavor wheels for:', tastingData.id)
      console.log('🎯 USEEFFECT - Tasting data available:', !!tastingData)
      console.log('🎯 USEEFFECT - Has ID:', !!tastingData.id)
      console.log('🎯 USEEFFECT - Not yet generated:', !hasGeneratedWheels)

      // Delay execution to prevent hydration conflicts
      const timeoutId = setTimeout(() => {
        generateFlavorWheels()
        setHasGeneratedWheels(true)
      }, 100)

      return () => clearTimeout(timeoutId)
    } else if (hasGeneratedWheels) {
      console.log('🎯 USEEFFECT SKIPPED - Already generated for:', tastingData?.id)
    }
  }, [tastingData?.id, hasGeneratedWheels])

  const generateFlavorWheels = async () => {
    console.log('🎨 GENERATE FLAVOR WHEELS - STARTED')
    console.log('🎨 GENERATE FLAVOR WHEELS - TASTING DATA:', tastingData)
    console.log('🎨 GENERATE FLAVOR WHEELS - SUBJECTIVE INPUTS RECEIVED:', tastingData.subjectiveInputs)

    try {
      setLoading(true)
      setError(null)

      // Load responses from sessionStorage - try both keys for compatibility
      const submissionData = sessionStorage.getItem('tasting-submission-data')
      const sessionInputData = sessionStorage.getItem('tasting-input-data')
      let responses = []
      let parsedData = null

      if (submissionData) {
        parsedData = JSON.parse(submissionData)
        responses = parsedData.responses || []
        console.log('🎨 LOADED RESPONSES FROM tasting-submission-data:', responses)
      } else if (sessionInputData) {
        parsedData = JSON.parse(sessionInputData)
        responses = parsedData.responses || []
        console.log('🎨 LOADED RESPONSES FROM tasting-input-data:', responses)
      }

      console.log('🎨 PARSED SUBMISSION DATA:', parsedData)

      // Collect all subjective responses with actual user values
      let collectedSubjectiveInputs = []

      if (responses && responses.length > 0 && tastingData.items && tastingData.categories) {
        // Use actual responses from sessionStorage
        tastingData.items.forEach(item => {
          tastingData.categories.forEach(category => {
            if (category.parameterType === 'subjective_input') {
              const responseKey = `${item.id}-${category.id}`
              const response = responses.find(r => r.itemId === item.id && r.categoryId === category.id)

              if (response && response.value && response.value.trim().length > 0) {
                const cleanedValue = response.value.trim()
                const formattedInput = `${category.name}: ${cleanedValue}`
                // Clean the value for processing by removing category prefixes
                const pureValue = cleanedValue.replace(/^.*?: /, '').trim()
                collectedSubjectiveInputs.push(pureValue)
                console.log(`🎨 COLLECTED RESPONSE - ${responseKey}: ${formattedInput}`)
                console.log(`🎨 CLEANED RESPONSE FOR PROCESSING: "${pureValue}"`)
              }
            }
          })
        })
      } else if (tastingData.subjectiveInputs && tastingData.subjectiveInputs.length > 0) {
        // Fallback to existing subjectiveInputs - clean any prefixes
        collectedSubjectiveInputs = tastingData.subjectiveInputs.map(input => {
          const cleaned = input.replace(/^.*?: /, '').trim()
          console.log(`🎨 CLEANED FALLBACK INPUT: "${input}" -> "${cleaned}"`)
          return cleaned
        })
      } else {
        // Last resort fallback
        collectedSubjectiveInputs = ['Aroma: default notes', 'Flavor: default notes']
      }

      console.log('🎨 FINAL COLLECTED SUBJECTIVE INPUTS (CLEANED):', collectedSubjectiveInputs)
      console.log('🎨 SUBJECTIVE INPUTS COUNT:', collectedSubjectiveInputs.length)
      console.log('🎨 COMBINED TEXT FOR PROCESSING:', collectedSubjectiveInputs.join(' '))

      // Validate that we have sufficient data
      const hasSubjectiveInputs = collectedSubjectiveInputs && collectedSubjectiveInputs.some(input => input && input.trim().length > 0)
      console.log('🎨 GENERATE FLAVOR WHEELS - HAS SUBJECTIVE INPUTS:', hasSubjectiveInputs)
      const hasPreLoadedData = tastingData.preLoadedData && tastingData.preLoadedData.some(item => {
        // Check if any category in the item has data
        return Object.values(item).some(value => {
          if (typeof value === 'string') return value.trim().length > 0
          if (Array.isArray(value)) return value.length > 0
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v =>
              typeof v === 'string' ? v.trim().length > 0 :
              Array.isArray(v) ? v.length > 0 :
              typeof v === 'number' ? true : false
            )
          }
          return false
        })
      })
      const hasQuickNotes = tastingData.quickNotes && (
        tastingData.quickNotes.aroma?.trim() ||
        tastingData.quickNotes.flavor?.trim() ||
        tastingData.quickNotes.other?.trim() ||
        (tastingData.quickNotes.selectedFlavors && tastingData.quickNotes.selectedFlavors.length > 0)
      )

      if (!hasSubjectiveInputs && !hasPreLoadedData && !hasQuickNotes) {
        throw new Error('No tasting data available for flavor wheel generation. Please ensure you have filled out descriptive fields.')
      }

      // Prepare input data for NLP processing
      const inputData = {
        productType: tastingData.product_type,
        mode: tastingData.mode,
        subjectiveInputs: collectedSubjectiveInputs,
        preLoadedData: tastingData.preLoadedData || [],
        quickNotes: tastingData.quickNotes
      }

      console.log('🎨 GENERATE FLAVOR WHEELS - FINAL INPUT DATA:', inputData)
      console.log('🎨 SUBJECTIVE INPUTS FOR PROCESSING:', collectedSubjectiveInputs)

      // Process tasting data for flavor wheels
      const wheels = await processTastingForFlavorWheel(inputData)
      console.log('🎨 GENERATE FLAVOR WHEELS - RESULT:', wheels)

      // Build hierarchical structure for rendering
      let builtHierarchyData = null
      if (wheels && wheels.personal && wheels.personal.combined) {
        builtHierarchyData = wheels.personal.combined
        console.log('🎨 USING EXISTING HIERARCHY - Combined wheel:', builtHierarchyData)
        console.log('🎨 HIERARCHY - Categories found:', builtHierarchyData.children?.length || 0)
      } else {
        // Always try to build hierarchy from collected subjective inputs
        console.log('🎨 BUILDING HIERARCHY FROM SUBJECTIVE INPUTS')
        try {
          // Extract keywords from the cleaned subjective inputs
          const keywords = collectedSubjectiveInputs
            .join(' ')
            .split(',')
            .map(term => term.trim().toLowerCase())
            .filter(term => term.length > 2) // Filter out very short terms
            .filter((term, index, arr) => arr.indexOf(term) === index) // Remove duplicates
            .slice(0, 15) // Limit to prevent overload

          console.log('🎨 EXTRACTED KEYWORDS FOR HIERARCHY:', keywords)

          if (keywords.length > 0) {
            builtHierarchyData = buildFlavorHierarchy(keywords, tastingData.product_type)
            console.log('🎨 BUILT HIERARCHY SUCCESSFULLY:', builtHierarchyData)
          } else {
            console.warn('⚠️ No keywords extracted for hierarchy building')
          }
        } catch (hierarchyError) {
          console.warn('⚠️ Failed to build hierarchy:', hierarchyError)
        }
      }

      setFlavorWheels(wheels)
      setHierarchyData(builtHierarchyData)

      // Persist flavor wheel data for Flavorwheels section
      if (wheels) {
        try {
          const wheelData = {
            tastingId: tastingData.id,
            name: tastingData.name,
            productType: tastingData.product_type,
            mode: tastingData.mode,
            flavorWheelData: wheels,
            hierarchyData: builtHierarchyData,
            subjectiveInputs: collectedSubjectiveInputs || tastingData.subjectiveInputs,
            categories: tastingData.categories,
            items: tastingData.items,
            createdAt: new Date().toISOString(),
            keywords: [], // Would be populated from the extraction service
            viewTypes: ['aroma', 'flavor', 'combined', 'metaphor'],
            scopes: ['personal', 'universal'],
            totalDescriptors: builtHierarchyData?.children?.length || 0,
            wheelType: 'personal flavor wheel',
            // Multi-type wheel support
            wheelTypes: {
              personal: {
                aroma: builtHierarchyData,
                flavor: builtHierarchyData,
                combined: builtHierarchyData,
                metaphor: builtHierarchyData
              },
              universal: {
                aroma: builtHierarchyData,
                flavor: builtHierarchyData,
                combined: builtHierarchyData,
                metaphor: builtHierarchyData
              }
            },
            // Category-specific wheels (aroma, texture, etc.)
            categoryWheels: tastingData.categories?.reduce((acc, category) => {
              if (category.parameterType === 'subjective_input') {
                // Create a wheel just for this category's inputs
                const categoryInputs = collectedSubjectiveInputs.filter(input =>
                  input.toLowerCase().includes(category.name.toLowerCase())
                )
                if (categoryInputs.length > 0) {
                  acc[category.name.toLowerCase()] = {
                    name: `${category.name} Wheel`,
                    data: builtHierarchyData,
                    inputs: categoryInputs
                  }
                }
              }
              return acc
            }, {}),
            // Prepare for Supabase integration
            supabaseReady: {
              user_id: 'current_user_id', // Would be populated from auth
              tasting_id: tastingData.id,
              wheel_type: 'personal',
              data: wheels,
              metadata: {
                product_type: tastingData.product_type,
                descriptors_count: builtHierarchyData?.children?.length || 0,
                categories_count: tastingData.categories?.length || 0
              }
            }
          }

          // Store in localStorage for immediate access
          localStorage.setItem(`flavor-wheel-${tastingData.id}`, JSON.stringify(wheelData))
          console.log('💾 FLAVOR WHEEL PERSISTED TO LOCALSTORAGE:', `flavor-wheel-${tastingData.id}`)

          // Sync to Supabase for cross-device access
          try {
            const { error: supabaseError } = await supabase
              .from('flavor_wheels')
              .upsert({
                tasting_id: tastingData.id,
                user_id: tastingData.created_by,
                wheel_data: wheelData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (supabaseError) {
              console.warn('⚠️ Failed to sync flavor wheel to Supabase:', supabaseError)
            } else {
              console.log('✅ FLAVOR WHEEL SYNCED TO SUPABASE')
            }
          } catch (syncError) {
            console.warn('⚠️ Failed to sync flavor wheel to Supabase:', syncError)
          }

        } catch (storageError) {
          console.warn('⚠️ Failed to persist flavor wheel data:', storageError)
        }
      }

      toast({
        title: 'Flavor Wheel Generated!',
        description: 'Your personalized flavor analysis is ready.',
      })

    } catch (err: any) {
      console.error('Failed to generate flavor wheels:', err)

      let errorMessage = 'Failed to generate flavor wheels from tasting data.'
      let errorTitle = 'Generation Error'

      // Provide specific error messages based on error type
      console.log('🎨 GENERATE FLAVOR WHEELS - ERROR:', err.message)

      if (err.message.includes('Insufficient tasting data') || err.message.includes('No tasting data available')) {
        errorTitle = 'Insufficient Data'
        errorMessage = 'Please provide more detailed tasting notes or flavor selections to generate a meaningful flavor wheel. Include descriptive terms like "herbal", "fruity", or "spicy".'
      } else if (err.message.includes('too short')) {
        errorTitle = 'Description Too Short'
        errorMessage = 'Please provide more detailed tasting descriptions (minimum 10 characters).'
      } else if (err.message.includes('too long')) {
        errorTitle = 'Description Too Long'
        errorMessage = 'Please shorten your tasting descriptions (maximum 10,000 characters).'
      } else if (err.message.includes('No flavor descriptors')) {
        errorTitle = 'No Flavor Terms Found'
        errorMessage = 'Please include flavor-related terms in your descriptions (e.g., fruity, floral, spicy, earthy).'
      } else if (err.message.includes('Unable to generate')) {
        errorTitle = 'Generation Failed'
        errorMessage = 'Could not create a flavor wheel from the provided data. Try adding more specific flavor descriptions.'
      }

      setError(errorMessage)
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewInFlavorwheels = () => {
    router.push('/en/flavorwheels')
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tastings/${tastingData.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tasting: ${tastingData.name}`,
          text: `Check out my ${tastingData.product_type} tasting with flavor wheel analysis!`,
          url: shareUrl
        })
      } catch (err) {
        // User cancelled or share failed
        copyToClipboard(shareUrl)
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Link Copied',
      description: 'Tasting link copied to clipboard',
    })
  }

  const handleExport = () => {
    // Export functionality would be implemented with pdf-service.ts
    toast({
      title: 'Export Feature',
      description: 'PDF export coming soon!',
    })
  }

  const getCurrentWheelData = (): SunburstData | null => {
    // Try to use the processed flavor wheels first
    if (flavorWheels && flavorWheels[activeScope] && flavorWheels[activeScope][activeView]) {
      console.log('🎨 USING PROCESSED WHEEL DATA:', flavorWheels[activeScope][activeView])
      return flavorWheels[activeScope][activeView]
    }

    // Fallback to hierarchy data if available
    if (hierarchyData) {
      console.log('🎨 USING HIERARCHY FALLBACK DATA:', hierarchyData)
      return hierarchyData
    }

    console.log('🎨 NO WHEEL DATA AVAILABLE')
    return null
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const ChartComponent = isMobile ? MobileSunburstChart : SunburstChart

  // Show loading screen during hydration to prevent flash
  if (!isClientReady) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your tasting results...</p>
          </div>
        </div>
      </DashboardAppShell>
    )
  }

  return (
    <DashboardAppShell activeNavItem="create" maxWidth="full">
      <div className="space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack || (() => router.back())}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Tasting Complete!</h1>
            <p className="text-sm text-muted-foreground">Your flavor wheel is ready</p>
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">
                  {tastingData.name} - Complete!
                </h3>
                <p className="text-sm text-green-700">
                  Flavor analysis generated from your tasting data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responses Summary */}
        {tastingData.detailedResponses && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Tasting Responses
              </CardTitle>
              <CardDescription>
                Summary of your tasting notes and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(tastingData.detailedResponses || {}).map(([itemId, itemResponses]: [string, any]) => {
                  const item = tastingData.items?.find(i => i.id === itemId)
                  console.log('🎨 RENDERING ITEM:', { itemId, item, itemResponses })

                  return (
                    <div key={itemId} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {item?.name || `Item ${itemId}`}
                      </h4>
                      <div className="grid gap-3">
                        {Object.entries(itemResponses || {}).map(([categoryId, response]: [string, any]) => {
                          const category = tastingData.categories?.find(c => c.id === categoryId)
                          console.log('🎨 RENDERING CATEGORY:', { categoryId, response, category })

                          return (
                            <div key={categoryId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex-1">
                                <span className="font-medium">{response.categoryName || category?.name || categoryId}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {response.parameterType?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                </Badge>
                              </div>
                              <div className="text-right">
                                {response.parameterType === 'sliding_scale' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                      {response.originalValue || response.value}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {response.value || 'N/A'}
                                    </Badge>
                                  </div>
                                ) : response.parameterType === 'multiple_choice' ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {Array.isArray(response.value) ? response.value.join(', ') : response.value || 'N/A'}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-gray-600 max-w-xs truncate">
                                    {response.value || 'Not provided'}
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flavor Wheel Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Flavor Wheel Analysis
            </CardTitle>
            <CardDescription>
              Interactive sunburst visualization of your tasting results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Generating your flavor wheel...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <p className="text-sm text-red-600 mb-4">{error}</p>
                  <Button onClick={generateFlavorWheels} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {flavorWheels && !loading && !error && (
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* Scope Toggle */}
                  <div className="flex gap-2">
                    <Button
                      variant={activeScope === 'personal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveScope('personal')}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Personal
                    </Button>
                    <Button
                      variant={activeScope === 'universal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveScope('universal')}
                      className="flex items-center gap-1"
                    >
                      <Users className="h-4 w-4" />
                      Universal
                    </Button>
                  </div>

                  {/* View Toggle */}
                  <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                      <TabsTrigger value="aroma" className="text-xs">Aroma</TabsTrigger>
                      <TabsTrigger value="flavor" className="text-xs">Flavor</TabsTrigger>
                      <TabsTrigger value="combined" className="text-xs">Combined</TabsTrigger>
                      <TabsTrigger value="metaphor" className="text-xs">Metaphor</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Chart */}
                <div className="flex justify-center">
                  <ChartComponent
                    data={getCurrentWheelData() || { name: 'No Data', children: [] }}
                    width={dimensions.width}
                    height={dimensions.height}
                    onSegmentClick={(node) => {
                      toast({
                        title: node.name,
                        description: node.value ? `Value: ${node.value}` : 'Category',
                      })
                    }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {getCurrentWheelData()?.children?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Categories</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {getCurrentWheelData()?.children?.reduce((sum, cat) =>
                        sum + (cat.children?.length || 0), 0) || 0}
                    </div>
                    <div className="text-xs text-gray-600">Descriptors</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {tastingData.mode}
                    </div>
                    <div className="text-xs text-gray-600">Mode</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {tastingData.product_type}
                    </div>
                    <div className="text-xs text-gray-600">Product</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button onClick={handleViewInFlavorwheels} variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View in Flavorwheels
          </Button>

          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Additional Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-semibold mb-1">Tasting Saved!</h3>
              <p className="text-sm text-muted-foreground">
                Your tasting data and flavor wheel have been saved to your profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardAppShell>
  )
}

// Hook for managing tasting completion
export function useTastingCompletion() {
  const [completionData, setCompletionData] = useState<{
    tasting: any
    flavorWheels: FlavorWheelViews | null
    loading: boolean
    error: string | null
  }>({
    tasting: null,
    flavorWheels: null,
    loading: false,
    error: null
  })

  const generateCompletion = async (tastingData: TastingData) => {
    try {
      setCompletionData(prev => ({ ...prev, loading: true, error: null }))

      const inputData = {
        productType: tastingData.product_type,
        mode: tastingData.mode,
        subjectiveInputs: tastingData.subjectiveInputs || [],
        preLoadedData: tastingData.preLoadedData || [],
        quickNotes: tastingData.quickNotes
      }

      const flavorWheels = await processTastingForFlavorWheel(inputData)

      setCompletionData({
        tasting: tastingData,
        flavorWheels,
        loading: false,
        error: null
      })

      return { tasting: tastingData, flavorWheels }
    } catch (error: any) {
      setCompletionData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to generate completion data'
      }))
      throw error
    }
  }

  return {
    ...completionData,
    generateCompletion
  }
}
