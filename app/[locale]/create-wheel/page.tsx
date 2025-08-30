/**
 * FlavorWheel Mobile-Only Creation Interface
 *
 * PRODUCTION NOTES:
 * - Mobile-exclusive experience optimized for 390x800 portrait devices
 * - Uses linear task execution to prevent recursion issues
 * - Implements professional NLP-powered flavor analysis
 * - Full-height sunburst visualization with touch-optimized interactions
 *
 * ANTI-RECURSION MEASURES:
 * - All async operations use linear await patterns
 * - No nested component recursion in data processing
 * - ResizeObserver uses simple dimension updates only
 * - D3 hierarchy processing handled by Sunburst component internally
 *
 * @version 1.0.0
 * @author FlavorWheel Team
 * @created 2025-01-20
 */
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Target, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sunburst } from '@/components/flavorwheel/Sunburst'
import { DashboardAppShell } from '@/components/app-shell'

// WheelNode interface matching Sunburst component
interface WheelNode {
  id?: string
  name: string
  weight?: number
  value?: number
  intensity?: number
  confidence?: number
  color?: string
  category?: string
  children?: WheelNode[]
  meta?: {
    path: string[]
    hiddenChildren?: WheelNode[]
  }
  matchType?: 'exact' | 'fuzzy' | 'jaro-winkler' | 'levenshtein' | 'semantic'
  similarity?: number
  modifiers?: Array<{
    modifier: string
    intensity_value: number
    modifier_type: 'intensifier' | 'hedge' | 'negation'
  }>
}

interface ExtractedTerm {
  variant: string
  canonical: string
  keyword_id: string
  category: string
  subcategory?: string
  weight: number
  span: { start: number; end: number }
  matchType: 'exact' | 'fuzzy'
  similarity?: number
}

interface FlavorExtractionResult {
  success: boolean
  wheelData: WheelNode
  extractedTerms: ExtractedTerm[]
  statistics: {
    totalTerms: number
    uniqueCategories: number
    averageConfidence: number
  }
  processingTimeMs: number
}

export default function CreateWheelPage() {
  const [tastingNotes, setTastingNotes] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionResult, setExtractionResult] = useState<FlavorExtractionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<WheelNode | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sunburstContainerRef = useRef<HTMLDivElement>(null)
  const [sunburstDimensions, setSunburstDimensions] = useState({ width: 390, height: 350 })

  // Mobile-only enforcement via CSS and ResizeObserver for dynamic scaling
  useEffect(() => {
    // Add mobile-only styles to document head
    const style = document.createElement('style')
    style.textContent = `
      @media (min-width: 768px) {
        .mobile-only-page {
          display: none !important;
        }
        .desktop-message {
          display: flex !important;
        }
      }
      @media (max-width: 767px) {
        .desktop-message {
          display: none !important;
        }
      }
      /* Ultra-compact layout - Minimal vertical space for simultaneous wheel + descriptors viewing */
      .sunburst-container {
        width: 100%;
        height: 45vh;
        min-height: 350px;
        max-height: 500px;
      }
      @media (max-width: 390px) {
        .sunburst-container {
          height: 40vh;
          min-height: 320px;
        }
      }
      @media (max-height: 700px) {
        .sunburst-container {
          height: 35vh;
          min-height: 300px;
        }
      }
      /* Balanced aspect ratio for compact layout - wheel + descriptors viewing */
      .sunburst-container .flavor-sunburst {
        aspect-ratio: 1/1;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // ResizeObserver for dynamic sunburst scaling
  useEffect(() => {
    if (!sunburstContainerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        // Ultra-compact layout - minimize vertical space for simultaneous viewing
        // Use available container space efficiently with minimal height
        const optimizedWidth = Math.min(width, 390)
        const optimizedHeight = Math.min(height, Math.max(300, optimizedWidth * 0.9))

        setSunburstDimensions({
          width: optimizedWidth,
          height: optimizedHeight
        })
      }
    })

    resizeObserver.observe(sunburstContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [extractionResult])

  const handleExtractFlavors = async () => {
    if (!tastingNotes.trim()) {
      setError('Please provide comprehensive tasting notes before initiating the analysis.')
      return
    }

    setIsExtracting(true)
    setError(null)

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: tastingNotes,
          language: 'en',
          productTypes: ['wine', 'coffee', 'spirits']
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      console.log('🔍 API Response:', result) // Debug logging

      // Handle both camelCase and snake_case API responses
      const wheelData = result.wheelData || result.wheel_data
      const extractedTerms = result.extractedTerms || result.extracted_terms

      if (result.success && wheelData) {
        // Validate wheel data structure
        if (!wheelData.name) {
          console.warn('⚠️ Wheel data missing name, using fallback')
          wheelData.name = 'Flavor Analysis'
        }

        // Normalize the response format for our component
        const normalizedResult = {
          success: result.success,
          wheelData: wheelData,
          extractedTerms: extractedTerms || [],
          statistics: result.statistics || {
            totalTerms: extractedTerms?.length || 0,
            uniqueCategories: wheelData.children?.length || 0,
            averageConfidence: 0.5
          },
          processingTimeMs: result.processing_time_ms || result.processingTimeMs || 0
        }

        console.log('✅ Extraction successful:', {
          termsFound: normalizedResult.extractedTerms.length,
          categories: normalizedResult.statistics.uniqueCategories,
          hasChildren: !!wheelData.children?.length,
          sampleTerms: normalizedResult.extractedTerms.slice(0, 3).map((t: any) => ({ variant: t.variant, canonical: t.canonical, category: t.category }))
        })

        setExtractionResult(normalizedResult)
      } else {
        // More detailed error information
        const errorMsg = result.error || result.details || 'Failed to extract flavors from your notes'
        console.error('❌ Extraction failed:', {
          success: result.success,
          hasWheelData: !!wheelData,
          error: result.error,
          details: result.details,
          availableKeys: Object.keys(result)
        })
        throw new Error(errorMsg)
      }
    } catch (err) {
      console.error('Extraction error:', err)
      // Mobile-friendly error messages
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Network connection issue. Please check your internet connection and try again.')
        } else if (err.message.includes('500')) {
          setError('Server processing error. Please try again with different tasting notes.')
        } else {
          setError(`Analysis failed: ${err.message}`)
        }
      } else {
        setError('An unexpected error occurred during the flavor analysis. Please try again.')
      }
    } finally {
      setIsExtracting(false)
    }
  }

  const handleNodeClick = (node: WheelNode) => {
    // Mobile haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Short vibration for touch feedback
    }
    setSelectedNode(node)
    setIsDialogOpen(true)
  }

  const clearResults = () => {
    setExtractionResult(null)
    setError(null)
    setTastingNotes('')
  }

  return (
    <DashboardAppShell activeNavItem="review" maxWidth="full" className="[&>div>main]:p-0 [&>div>main]:max-w-none">
      {/* Desktop message - hidden on mobile */}
      <div className="desktop-message hidden min-h-screen items-center justify-center bg-gradient-to-br from-surface-secondary to-surface-muted p-8">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 text-6xl">📱</div>
          <h1 className="mb-4 text-2xl font-bold text-text-primary">Mobile-Optimized Experience</h1>
          <p className="text-text-secondary">
            The FlavorWheel creation interface is specifically designed for mobile devices to provide
            an immersive, touch-optimized experience. Please access this application from your
            smartphone or tablet for optimal functionality.
          </p>
        </div>
      </div>

      {/* Mobile-only content */}
      <div className="mobile-only-page min-h-screen bg-gradient-to-br from-surface-secondary via-surface-primary to-surface-muted w-full">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-border-subtle sticky top-0 z-40 w-full">
          <div className="px-4 py-4 max-w-md mx-auto w-full">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-brand to-elegant-brown">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Create Flavor Profile</h1>
                <p className="text-sm text-text-secondary">Advanced NLP-powered flavor analysis and visualization</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 pb-safe pb-24 space-y-4 relative max-w-md mx-auto w-full" ref={containerRef}>
          {/* Mobile-optimized loading overlay */}
          {isExtracting && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-brand mx-auto mb-3" />
                <p className="text-sm font-medium text-text-primary">Processing Analysis...</p>
                <p className="text-xs text-text-secondary mt-1">This may take a few moments</p>
              </div>
            </div>
          )}
          {/* Compact Input Section */}
          <Card className="border-border-subtle bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Target className="h-4 w-4 text-primary-brand" />
                <span className="text-text-primary">Sensory Analysis Input</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Enter comprehensive tasting notes for professional flavor profile generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Input comprehensive tasting notes including aromatic descriptors, flavor characteristics, mouthfeel sensations, and finish impressions for professional analysis..."
                value={tastingNotes}
                onChange={(e) => setTastingNotes(e.target.value)}
                className="min-h-[100px] resize-none border-border-subtle focus:border-primary-brand focus:ring-primary-brand text-sm"
                disabled={isExtracting}
              />

              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleExtractFlavors}
                  disabled={isExtracting || !tastingNotes.trim()}
                  className="w-full bg-gradient-to-r from-primary-brand to-elegant-brown hover:from-primary-brand/90 hover:to-elegant-brown/90 text-white font-medium py-3 min-h-[48px] touch-manipulation"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Professional Profile
                    </>
                  )}
                </Button>

                {extractionResult && (
                  <Button
                    onClick={clearResults}
                    variant="outline"
                    size="sm"
                    className="w-full border-border-subtle text-text-secondary hover:bg-surface-secondary"
                  >
                    Start New Analysis
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section - Placeholder for now, will be enhanced in next tasks */}
          {extractionResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Professional Flavor Wheel Visualization */}
              <Card className="border-border-subtle bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-text-primary">Professional Flavor Wheel</CardTitle>
                  <CardDescription className="text-sm">
                    Interactive sensory analysis visualization • Touch-optimized interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Full-Height Vertical Rectangle Container - Optimized for 390x800 */}
                  <div
                    ref={sunburstContainerRef}
                    className="sunburst-container w-full flex items-center justify-center bg-gradient-to-br from-surface-secondary via-surface-primary to-surface-muted rounded-lg overflow-hidden relative"
                  >
                    <Sunburst
                      data={extractionResult.wheelData}
                      width={sunburstDimensions.width}
                      height={sunburstDimensions.height}
                      innerRadius={Math.min(40, sunburstDimensions.width * 0.1)}
                      outerRadius={Math.min(sunburstDimensions.width, sunburstDimensions.height) * 0.45}
                      onNodeClick={handleNodeClick}
                      className="w-full h-full"
                      enableZoom={true}
                      responsive={true}
                      fullDetailMode={true}
                    />

                    {/* Professional interface guidance */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-3 py-2 rounded-full text-center backdrop-blur-sm">
                      <span className="opacity-80">Touch segments for analysis • Pinch to zoom • Drag to navigate</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flavor Descriptors Section */}
              <Card className="border-border-subtle bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-text-primary">Extracted Flavor Descriptors</CardTitle>
                  <CardDescription className="text-sm">
                    Individual flavor terms identified from your tasting notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {extractionResult.extractedTerms && extractionResult.extractedTerms.length > 0 ? (
                      extractionResult.extractedTerms.map((term, index) => {
                        // Get the display term - prefer variant over canonical
                        const displayTerm = typeof term === 'string' ? term : term.variant || term.canonical || 'Unknown'

                        // Dynamic color mapping that matches wheel segment colors exactly
                        const getWheelMatchingColor = (termName: string, category?: string) => {
                          // Enhanced color palette matching the Sunburst wheel colors
                          const WHEEL_PALETTE = {
                            // Core English categories
                            'fruity': '#E5413A', 'fruit': '#E5413A', 'floral': '#E85A9E', 'sweet': '#F2853D',
                            'spices': '#8F4E39', 'spice': '#8F4E39', 'green': '#5BA66F', 'vegetative': '#5BA66F',
                            'roasted': '#B07C4A', 'chemical': '#6AA9B7', 'other': '#3FA1C9', 'earthy': '#8B4513',
                            'woody': '#D2691E', 'smoky': '#696969', 'herbal': '#228B22', 'savory': '#CD853F',
                            'umami': '#CD853F', 'sour': '#FFD700', 'bitter': '#8B4513', 'salty': '#B0C4DE',
                            // Spanish flavor mappings
                            'dulce': '#F2853D', 'chocolate': '#8F4E39', 'ahumado': '#B07C4A', 'humo': '#B07C4A',
                            'malta': '#D2691E', 'vainilla': '#F4A460', 'especias': '#8F4E39', 'frutal': '#E5413A',
                            'fruta': '#E5413A', 'verde': '#5BA66F', 'nuez': '#8F4E39', 'tostado': '#B07C4A',
                            'cacao': '#8F4E39', 'azucar': '#F2853D', 'tierra': '#8B4513', 'cuero': '#A0522D',
                            'madera': '#D2691E', 'mineral': '#708090', 'especiado': '#8F4E39', 'amargo': '#8B4513',
                            'acido': '#FFD700', 'salado': '#B0C4DE',
                            // Wine-specific categories
                            'red_fruit': '#DC143C', 'dark_fruit': '#8B0000', 'citrus': '#FFA500', 'stone_fruit': '#FF6347',
                            'tropical': '#FF8C00', 'berry': '#8B008B', 'apple': '#32CD32', 'pear': '#9ACD32',
                            'peach': '#FFCCCB', 'apricot': '#FBCEB1', 'cherry': '#DE3163', 'plum': '#8E4585',
                            'grape': '#6F2DA8', 'orange': '#FFA500', 'lemon': '#FFFF00', 'lime': '#00FF00',
                            'grapefruit': '#FF69B4', 'tea': '#228B22', 'green_tea': '#228B22'
                          }

                          // Find matching color by term name or category
                          const searchTerm = (termName || '').toLowerCase().replace(/[^a-z0-9]/g, '')
                          const searchCategory = (category || '').toLowerCase().replace(/[^a-z0-9]/g, '')

                          let matchedColor = '#3FA1C9' // default

                          // Try exact match on term name first
                          for (const [key, color] of Object.entries(WHEEL_PALETTE)) {
                            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
                            if (searchTerm === normalizedKey || searchTerm.includes(normalizedKey) || normalizedKey.includes(searchTerm)) {
                              matchedColor = color
                              break
                            }
                          }

                          // Try category match if no term match
                          if (matchedColor === '#3FA1C9' && searchCategory) {
                            for (const [key, color] of Object.entries(WHEEL_PALETTE)) {
                              const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
                              if (searchCategory === normalizedKey || searchCategory.includes(normalizedKey) || normalizedKey.includes(searchCategory)) {
                                matchedColor = color
                                break
                              }
                            }
                          }

                          // Convert hex to Tailwind-compatible classes
                          const hexToTailwind = (hex: string) => {
                            const colorMap = {
                              '#E5413A': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', hover: 'hover:bg-red-200', dot: 'bg-red-500' },
                              '#E85A9E': { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200', hover: 'hover:bg-pink-200', dot: 'bg-pink-500' },
                              '#F2853D': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:bg-orange-200', dot: 'bg-orange-500' },
                              '#8F4E39': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', hover: 'hover:bg-amber-200', dot: 'bg-amber-600' },
                              '#5BA66F': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', hover: 'hover:bg-green-200', dot: 'bg-green-500' },
                              '#B07C4A': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', hover: 'hover:bg-yellow-200', dot: 'bg-yellow-600' },
                              '#6AA9B7': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200', hover: 'hover:bg-cyan-200', dot: 'bg-cyan-500' },
                              '#8B4513': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', hover: 'hover:bg-amber-200', dot: 'bg-amber-700' },
                              '#D2691E': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:bg-orange-200', dot: 'bg-orange-600' },
                              '#696969': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', hover: 'hover:bg-gray-200', dot: 'bg-gray-500' },
                              '#228B22': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', hover: 'hover:bg-green-200', dot: 'bg-green-600' },
                              '#FFD700': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', hover: 'hover:bg-yellow-200', dot: 'bg-yellow-500' },
                              '#FFA500': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', hover: 'hover:bg-orange-200', dot: 'bg-orange-500' },
                              '#708090': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', hover: 'hover:bg-slate-200', dot: 'bg-slate-500' }
                            }
                            return (colorMap as any)[hex] || { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', hover: 'hover:bg-blue-200', dot: 'bg-blue-400' }
                          }

                          return hexToTailwind(matchedColor)
                        }

                        const termCategory = typeof term === 'object' ? term.category : undefined
                        const colorScheme = getWheelMatchingColor(displayTerm, termCategory)

                        return (
                          <button
                            key={typeof term === 'object' ? `${term.keyword_id}-${index}` : index}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} ${colorScheme.hover} transition-all duration-200 touch-manipulation`}
                            onClick={() => {
                              // Find the corresponding node in the wheel data
                              const findNodeByTerm = (node: WheelNode, searchTerm: string): WheelNode | null => {
                                if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                                  return node
                                }
                                if (node.children) {
                                  for (const child of node.children) {
                                    const found = findNodeByTerm(child, searchTerm)
                                    if (found) return found
                                  }
                                }
                                return null
                              }

                              const foundNode = findNodeByTerm(extractionResult.wheelData, displayTerm)
                              if (foundNode) {
                                setSelectedNode(foundNode)
                                setIsDialogOpen(true)
                              }
                            }}
                            title={typeof term === 'object' && term.category ? `${displayTerm} (${term.category}${term.subcategory ? ` - ${term.subcategory}` : ''})` : displayTerm}
                          >
                            <span className={`w-2 h-2 ${colorScheme.dot} rounded-full mr-2`}></span>
                            {displayTerm}
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No individual flavor terms extracted. Try providing more detailed tasting notes.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Arc Details Dialog - Ready for Sunburst integration */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedNode?.name || 'Sensory Component Analysis'}
              </DialogTitle>
              <DialogDescription>
                Comprehensive analysis of this flavor profile element
              </DialogDescription>
            </DialogHeader>

            {selectedNode && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Classification</h4>
                  <Badge variant="secondary" className="text-sm">
                    {selectedNode.category || 'General Descriptor'}
                  </Badge>
                </div>

                {selectedNode.intensity && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Intensity Level</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-brand h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(selectedNode.intensity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {selectedNode.intensity}/10
                      </span>
                    </div>
                  </div>
                )}

                {selectedNode.children && selectedNode.children.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Related Descriptors</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.children.slice(0, 6).map((child, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {child.name}
                        </Badge>
                      ))}
                      {selectedNode.children.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedNode.children.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </DashboardAppShell>
  )
}
