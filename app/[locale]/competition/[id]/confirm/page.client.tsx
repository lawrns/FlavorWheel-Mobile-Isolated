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
  ArrowLeft, Users, Calendar, Trophy, Target, CheckCircle,
  Mail, Share, Clock, Eye, EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompetitionConfirmPageProps {
  params: {
    locale: string
    id: string
  }
  searchParams: {
    tasting?: string
  }
}

interface TastingData {
  id: string
  name: string
  description?: string
  mode: 'competition'
  product_type: string
  is_blind: boolean
  categories: Array<{
    id: string
    name: string
    parameterType: string
    rankOption: boolean
    options?: string[]
    minValue?: number
    maxValue?: number
    containsText?: string
  }>
  items: Array<{
    id: string
    name: string
    description?: string
    pre_loaded_data?: any
    image?: string
  }>
}

export default function CompetitionConfirmPageClient({ params, searchParams }: CompetitionConfirmPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [tasting, setTasting] = useState<TastingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [participants, setParticipants] = useState<string[]>([])

  useEffect(() => {
    // Load tasting data from localStorage or API
    const loadTasting = async () => {
      try {
        if (searchParams.tasting) {
          // In a real app, you'd fetch from API
          // For now, we'll use localStorage data
          const storedData = localStorage.getItem(`competition-draft-${params.locale}`)
          if (storedData) {
            const parsed = JSON.parse(storedData)
            setTasting({
              id: searchParams.tasting,
              name: parsed.formData?.name || 'Competition',
              description: parsed.formData?.description || '',
              mode: 'competition',
              product_type: parsed.selectedProductType || 'Wine',
              is_blind: parsed.isBlindTasting || false,
              categories: parsed.categories || [],
              items: parsed.items || []
            })
          }
        }
      } catch (error) {
        console.error('Failed to load tasting data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load competition data.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadTasting()
  }, [params.locale, searchParams.tasting, toast])

  const handleBack = () => {
    router.push(`/${params.locale}/create/competition`)
  }

  const handleStartNow = () => {
    if (!tasting) return

    // Store the complete tasting data for the input screen
    const inputData = {
      ...tasting,
      // Ensure proper data structure for input screen
      categories: tasting.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parameterType: cat.parameterType,
        options: cat.options,
        minValue: cat.minValue,
        maxValue: cat.maxValue,
        containsText: cat.containsText,
        rankOption: cat.rankOption
      })),
      items: tasting.items.map(item => ({
        id: item.id,
        name: item.name,
        image: item.image,
        category: tasting.product_type // Add product type as category for display
      }))
    }

    // Store for input screen
    sessionStorage.setItem('tasting-input-data', JSON.stringify(inputData))

    // Navigate to universal input screen
    router.push(`/${params.locale}/tastings/${tasting.id}/input`)
  }

  const handleScheduleTasting = () => {
    // In a real app, this would open a calendar picker
    const date = new Date()
    date.setDate(date.getDate() + 7) // Default to 1 week from now
    setScheduledDate(date.toISOString().split('T')[0])

    toast({
      title: 'Tasting Scheduled',
      description: `Competition scheduled for ${date.toLocaleDateString()}`,
    })
  }

  const handleInviteFriends = () => {
    // In a real app, this would open email/share dialog
    const shareUrl = `${window.location.origin}/${params.locale}/competition/${tasting?.id}/join`

    if (navigator.share) {
      navigator.share({
        title: `Join ${tasting?.name}`,
        text: `I've invited you to participate in "${tasting?.name}". Click the link to join!`,
        url: shareUrl
      })
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/${params.locale}/competition/${tasting?.id}/join`)
      toast({
        title: 'Link Copied',
        description: 'Invitation link copied to clipboard',
      })
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!tasting) {
    return (
      <DashboardAppShell activeNavItem="create" maxWidth="full">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Competition Not Found</h1>
          <p className="text-card-text-secondary mb-6">The competition you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push(`/${params.locale}/create`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Create
          </Button>
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
            <h1 className="text-2xl font-bold">Competition Created!</h1>
            <p className="text-sm text-card-text-secondary">Review and launch your competition</p>
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>

        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Competition Successfully Created</h3>
                <p className="text-sm text-green-700">Your competition is ready to launch!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competition Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Competition Summary
            </CardTitle>
            <CardDescription>Review your competition details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-lg font-semibold">{tasting.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Product Type</Label>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{tasting.product_type}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Mode</Label>
                <Badge variant="secondary">Competition</Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Privacy</Label>
                <div className="flex items-center gap-2">
                  {tasting.is_blind ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>Blind Tasting</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Open Tasting</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {tasting.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-card-text-secondary">{tasting.description}</p>
              </div>
            )}

            <Separator />

            {/* Categories Summary */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Evaluation Categories</Label>
              <div className="flex flex-wrap gap-2">
                {tasting.categories.map((category) => (
                  <Badge key={category.id} variant="outline" className="flex items-center gap-1">
                    {category.parameterType === 'sliding_scale' && <Target className="h-3 w-3" />}
                    {category.parameterType === 'multiple_choice' && <CheckCircle className="h-3 w-3" />}
                    {category.parameterType === 'exact_answer' && <Trophy className="h-3 w-3" />}
                    {category.name}
                    {category.rankOption && <span className="text-xs">(Ranked)</span>}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Items Summary */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Items to Taste ({tasting.items.length})</Label>
              <div className="space-y-2">
                {tasting.items.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-card-text-secondary">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Pre-loaded ✓
                    </Badge>
                  </div>
                ))}
                {tasting.items.length > 3 && (
                  <p className="text-xs text-card-text-secondary">
                    +{tasting.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="elevated" className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleInviteFriends}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-1">Invite Friends</h3>
                <p className="text-sm text-card-text-secondary">Share with participants</p>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleScheduleTasting}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-1">Schedule Tasting</h3>
                <p className="text-sm text-card-text-secondary">
                  {scheduledDate ? `Scheduled for ${new Date(scheduledDate).toLocaleDateString()}` : 'Set a date & time'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStartNow}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold mb-1">Start Now</h3>
                <p className="text-sm text-card-text-secondary">Begin the competition</p>
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
          <Button onClick={handleStartNow} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
            <Trophy className="h-4 w-4 mr-2" />
            Start Competition
          </Button>
        </div>
      </div>
    </DashboardAppShell>
  )
}
