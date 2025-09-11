'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import {
  ArrowLeft, Users, Calendar, BookOpen, Target, CheckCircle,
  Mail, Share, Clock, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudyConfirmPageClientProps {
  params: {
    locale: string
    id: string
  }
}

interface TastingData {
  id: string
  name: string
  description?: string
  mode: 'study'
  product_type: string
  is_blind: boolean
  categories: Array<{
    id: string
    name: string
    parameterType?: string
    parameter_type?: string
    options?: any
    minValue?: number
    min_value?: number
    maxValue?: number
    max_value?: number
    containsText?: boolean
    contains_text?: boolean
    rankOption?: boolean
    rank_option?: boolean
  }>
  items: Array<{
    id: string
    name: string
    description?: string
    image?: string
  }>
}

export default function StudyConfirmPageClient({ params }: StudyConfirmPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [tasting, setTasting] = useState<TastingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTastingData()
  }, [params.id])

  const loadTastingData = async () => {
    try {
      setLoading(true)

      // For now, create mock data based on stored tasting data
      const storedData = sessionStorage.getItem('tasting-completion-data')
      console.log('🔍 STUDY CONFIRM - SESSIONSTORAGE COMPLETION DATA:', storedData)

      if (storedData) {
        const parsed = JSON.parse(storedData)
        console.log('🔍 STUDY CONFIRM - PARSED COMPLETION DATA:', parsed)

        if (parsed.id === params.id) {
          console.log('🔍 STUDY CONFIRM - CATEGORIES FROM COMPLETION DATA:', parsed.categories)

          // Log each category's parameter type
          parsed.categories.forEach((cat: any, index: number) => {
            console.log(`🔍 STUDY CONFIRM CATEGORY ${index}: ${cat.name}`, {
              id: cat.id,
              name: cat.name,
              parameterType: cat.parameterType,
              parameter_type: cat.parameter_type,
              allKeys: Object.keys(cat)
            })
          })

          // Transform the data for confirmation display
          setTasting({
            id: parsed.id,
            name: parsed.name,
            description: parsed.description,
            mode: 'study',
            product_type: parsed.product_type,
            is_blind: parsed.is_blind || false,
            categories: parsed.categories || [],
            items: parsed.items || []
          })
          return
        }
      }

      // Fallback mock data - this should not happen in normal flow
      setTasting({
        id: params.id,
        name: 'Study Tasting Session',
        description: 'A flexible tasting session for learning and exploration',
        mode: 'study',
        product_type: 'Unknown Product',
        is_blind: false,
        categories: [],
        items: []
      })

      toast({
        title: 'Setup Data Missing',
        description: 'Please go back and complete the tasting setup.',
        variant: 'destructive'
      })

    } catch (error) {
      console.error('Failed to load tasting data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tasting data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/${params.locale}/create/study`)
  }

  const handleStartNow = () => {
    if (!tasting) return

    console.log('🚀 STUDY CONFIRM - handleStartNow called')
    console.log('🚀 STUDY CONFIRM - ORIGINAL TASTING CATEGORIES:', tasting.categories)

    // Store the complete tasting data for the input screen
    const inputData = {
      ...tasting,
      // Ensure proper data structure for input screen - convert snake_case to camelCase
      categories: tasting.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parameterType: cat.parameterType || cat.parameter_type || 'subjective_input',
        options: cat.options,
        minValue: cat.minValue || cat.min_value,
        maxValue: cat.maxValue || cat.max_value,
        containsText: cat.containsText || cat.contains_text,
        rankOption: cat.rankOption || cat.rank_option
      })),
      items: tasting.items.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        category: tasting.product_type // Add product type as category for display
      }))
    }

    // Store for input screen
    console.log('🚀 STUDY CONFIRM - INPUT DATA BEING STORED:', inputData)
    console.log('🚀 STUDY CONFIRM - INPUT CATEGORIES:', inputData.categories)

    sessionStorage.setItem('tasting-input-data', JSON.stringify(inputData))

    // Verify what was stored
    const storedInputVerification = sessionStorage.getItem('tasting-input-data')
    console.log('🚀 STUDY CONFIRM - VERIFICATION OF STORED INPUT DATA:', JSON.parse(storedInputVerification || '{}'))

    // Navigate to universal input screen
    router.push(`/${params.locale}/tastings/${tasting.id}/input`)
  }

  const handleScheduleTasting = () => {
    // In a real app, this would open a calendar picker
    const date = new Date()
    date.setDate(date.getDate() + 7) // Default to 1 week from now

    toast({
      title: 'Feature Coming Soon',
      description: 'Tasting scheduling will be available soon!',
    })
  }

  const handleInviteFriends = () => {
    const shareUrl = `${window.location.origin}/${params.locale}/study/${params.id}/join`

    if (navigator.share) {
      navigator.share({
        title: `Join my tasting: ${tasting?.name}`,
        text: 'Join me for an interactive tasting experience!',
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: 'Link Copied',
        description: 'Invitation link copied to clipboard',
      })
    }
  }

  const getParameterTypeIcon = (type: string) => {
    switch (type) {
      case 'subjective_input': return '📝'
      case 'sliding_scale': return '📊'
      case 'multiple_choice': return '🔘'
      case 'exact_answer': return '🎯'
      case 'contains_x': return '🔍'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading tasting details...</p>
          </div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!tasting) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tasting Not Found</h1>
            <p className="text-gray-600 mb-6">The tasting could not be found.</p>
            <Button onClick={() => router.push(`/${params.locale}/create`)}>
              Back to Create
            </Button>
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
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Study Tasting Ready</h1>
            <p className="text-sm text-muted-foreground">Review your setup before starting</p>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Tasting Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {tasting.name}
            </CardTitle>
            <CardDescription>{tasting.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Product Type</Label>
                <p className="text-sm">{tasting.product_type}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Mode</Label>
                <Badge variant="secondary">Study</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Items</Label>
                <p className="text-sm">{tasting.items.length} items to taste</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Categories</Label>
                <p className="text-sm">{tasting.categories.length} evaluation categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evaluation Categories</CardTitle>
            <CardDescription>
              These are the aspects you&apos;ll be evaluating for each item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasting.categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getParameterTypeIcon(category.parameterType ?? category.parameter_type ?? 'subjective_input')}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-gray-600">
                        {(category.parameterType ?? category.parameter_type ?? '').replace('_', ' ').toUpperCase()}
                        {category.rankOption && ' (Ranked)'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.parameterType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Items Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items to Taste</CardTitle>
            <CardDescription>
              You&apos;ll be evaluating these {tasting.items.length} items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tasting.items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleInviteFriends}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">Invite Friends</h3>
                <p className="text-sm text-muted-foreground">Share with others</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleScheduleTasting}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-1">Schedule Tasting</h3>
                <p className="text-sm text-muted-foreground">Plan for later</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStartNow}>
            <CardContent className="pt-6">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">Start Now</h3>
                <p className="text-sm text-muted-foreground">Begin your study</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button onClick={handleBack} variant="outline" className="w-full sm:w-auto">
            Back to Edit
          </Button>
          <div className="flex-1" />
          <Button onClick={handleStartNow} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            <BookOpen className="h-4 w-4 mr-2" />
            Start Study Tasting
          </Button>
        </div>
      </div>
    </DashboardAppShell>
  )
}
