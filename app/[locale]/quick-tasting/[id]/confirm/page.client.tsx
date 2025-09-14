'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import { TastingSharing } from '@/components/tasting-sharing'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  ArrowLeft, Zap, Target, CheckCircle, Share2
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
  categories?: any[]
  items?: any[]
}

export default function QuickTastingConfirmPageClient({ params }: QuickTastingConfirmPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [tasting, setTasting] = useState<QuickTastingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSharingDialog, setShowSharingDialog] = useState(false)

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
      items: ((tasting.items || []) as any[]).map((item: any) => ({
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
            <p className="text-sm text-card-text-secondary">Loading tasting details...</p>
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
            <p className="text-sm text-card-text-secondary">Ready to taste in seconds</p>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Mock Confirmation Screen */}
        <div className="bg-white p-4 rounded-lg shadow flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Confirm Quick Tasting</h2>
          <div>
            <p><strong>Mode:</strong> Quick</p>
            <p><strong>Product:</strong> {tasting.product_type || 'Coffee'}</p>
            <p><strong>Items:</strong> Quick Tasting Session</p>
            <p><strong>Categories:</strong> Aroma, Flavor, Texture</p>
          </div>

          {/* Flavor Preview */}
          {tasting.quickNotes.selectedFlavors && tasting.quickNotes.selectedFlavors.length > 0 && (
            <div>
              <p><strong>Detected Flavors:</strong></p>
              <div className="flex flex-wrap gap-2 mt-2">
                {tasting.quickNotes.selectedFlavors.map((flavor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {flavor.name} ({flavor.intensity}/10)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700">Invite Friends</label>
            <input className="w-full border p-2 rounded min-h-[44px] touch-manipulation" placeholder="Enter emails" />
          </div>
          <div>
            <label className="block text-gray-700">Schedule</label>
            <input type="date" className="w-full border p-2 rounded min-h-[44px] touch-manipulation" />
          </div>
          <button
            className="w-full bg-blue-500 text-white p-3 rounded min-h-[44px] touch-manipulation"
            onClick={handleStartNow}
          >
            Start Now
          </button>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-green-500 text-white p-3 rounded"
              onClick={() => setShowSharingDialog(true)}
            >
              <Share2 className="h-4 w-4 inline mr-2" />
              Share
            </button>
            <button
              className="flex-1 bg-gray-500 text-white p-3 rounded"
              onClick={handleBack}
            >
              Back to Edit
            </button>
          </div>
        </div>

        {/* Sharing Dialog */}
        <Dialog open={showSharingDialog} onOpenChange={setShowSharingDialog}>
          <DialogContent className="max-w-md">
            {tasting && (
              <TastingSharing
                tastingId={tasting.id}
                tastingName={tasting.name}
                locale={params.locale}
                onClose={() => setShowSharingDialog(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardAppShell>
  )
}
