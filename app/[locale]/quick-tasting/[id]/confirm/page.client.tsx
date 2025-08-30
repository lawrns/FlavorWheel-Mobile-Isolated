'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import {
  ArrowLeft, Zap, Target, CheckCircle
} from 'lucide-react'

interface QuickTastingConfirmPageClientProps {
  params: {
    locale: string
    id: string
  }
}

interface QuickTastingData {
  id: string
  name: string
  product_type: string
  quickNotes: {
    selectedFlavors: Array<{ name: string; intensity: number }>
    aroma?: string
    flavor?: string
    other?: string
  }
}

export default function QuickTastingConfirmPageClient({ params }: QuickTastingConfirmPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [tasting, setTasting] = useState<QuickTastingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTastingData()
  }, [params.id])

  const loadTastingData = async () => {
    try {
      setLoading(true)

      // Load from sessionStorage
      const storedData = sessionStorage.getItem('tasting-completion-data')
      if (storedData) {
        const parsed = JSON.parse(storedData)
        if (parsed.id === params.id) {
          setTasting(parsed)
          return
        }
      }

      // Fallback mock data
      setTasting({
        id: params.id,
        name: 'Quick Tasting Session',
        product_type: 'Coffee',
        quickNotes: {
          selectedFlavors: [
            { name: 'Chocolate', intensity: 7 },
            { name: 'Nutty', intensity: 5 },
            { name: 'Sweet', intensity: 4 }
          ]
        }
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
    router.push(`/${params.locale}/quick-tasting`)
  }

  const handleStartNow = () => {
    if (!tasting) return

    // Store the complete tasting data for the input screen
    const inputData = {
      ...tasting,
      // Ensure proper data structure for input screen
      categories: tasting.categories || [],
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
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Quick Tasting Ready</h1>
            <p className="text-sm text-muted-foreground">Ready to taste in seconds</p>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Tasting Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {tasting.name}
            </CardTitle>
            <CardDescription>Lightning-fast tasting experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Product Type</p>
                <p className="text-sm">{tasting.product_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mode</p>
                <Badge variant="secondary">Quick</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flavor Preview */}
        {tasting.quickNotes.selectedFlavors && tasting.quickNotes.selectedFlavors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detected Flavors</CardTitle>
              <CardDescription>
                Flavors you'll be evaluating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tasting.quickNotes.selectedFlavors.map((flavor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {flavor.name} ({flavor.intensity}/10)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStartNow}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-3 text-green-600" />
              <h3 className="font-semibold mb-1">Start Tasting</h3>
              <p className="text-sm text-muted-foreground">Begin your quick evaluation</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Action Button */}
        <div className="pt-4">
          <Button onClick={handleStartNow} className="w-full bg-green-600 hover:bg-green-700">
            <Zap className="h-4 w-4 mr-2" />
            Start Quick Tasting
          </Button>
        </div>
      </div>
    </DashboardAppShell>
  )
}
