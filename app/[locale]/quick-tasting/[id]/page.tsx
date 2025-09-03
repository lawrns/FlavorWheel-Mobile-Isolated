'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingState } from '@/components/ui/loading-states'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { handleApiError } from '@/lib/error-handling'
import { DashboardAppShell } from '@/components/app-shell'
import Link from 'next/link'

interface QuickTasting {
  id: string
  name: string
  type: string
  created_at: string
  status: 'draft' | 'completed'
  tasting_data: {
    product_name: string
    product_type: string
    aroma_notes: string
    flavor_notes: string
    finish_notes: string
    overall_rating: number
    intensity_ratings: {
      aroma: number
      flavor: number
      finish: number
    }
    photo_url?: string
  }
}

export default function QuickTastingPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const tastingId = (params.id as string)
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const [saveError, setSaveError] = useState<any>(null)

  const [tasting, setTasting] = useState<QuickTasting | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)


  const [formData, setFormData] = useState({
    product_name: '',
    product_type: '',
    aroma_notes: '',
    flavor_notes: '',
    finish_notes: '',
    overall_rating: 5,
    intensity_ratings: {
      aroma: 5,
      flavor: 5,
      finish: 5
    }
  })

  useEffect(() => {
    if (tastingId) {
      loadTasting()
    } else {
      // New tasting
      setTasting({
        id: 'new',
        name: 'New Quick Tasting',
        type: 'quick',
        created_at: new Date().toISOString(),
        status: 'draft',
        tasting_data: {
          product_name: '',
          product_type: '',
          aroma_notes: '',
          flavor_notes: '',
          finish_notes: '',
          overall_rating: 5,
          intensity_ratings: {
            aroma: 5,
            flavor: 5,
            finish: 5
          }
        }
      })
      setLoading(false)
    }
  }, [tastingId])

  const loadTasting = async () => {
    try {
      // Mock data for existing tasting
      const mockTasting: QuickTasting = {
        id: tastingId,
        name: 'Premium Mezcal Tasting',
        type: 'quick',
        created_at: new Date().toISOString(),
        status: 'draft',
        tasting_data: {
          product_name: 'Ocho Vidas Joven',
          product_type: 'mezcal',
          aroma_notes: 'Smoky agave with hints of citrus and earth',
          flavor_notes: 'Bold smokiness balanced with sweet agave notes',
          finish_notes: 'Long, warm finish with lingering smokiness',
          overall_rating: 8,
          intensity_ratings: {
            aroma: 7,
            flavor: 8,
            finish: 6
          }
        }
      }

      setTasting(mockTasting)
      setFormData(mockTasting.tasting_data)
    } catch (error) {
      console.error('Error loading tasting:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tasting',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const tastingData = {
        ...formData,
        completed_at: new Date().toISOString()
      }

      if (tastingId === 'new') {
        // Create new tasting
        const { data, error } = await supabase
          .from('tastings')
          .insert({
            name: `Quick Tasting - ${formData.product_name || 'Unnamed'}`,
            type: 'quick',
            created_by: user.id,
            tasting_data: tastingData
          })
          .select()
          .single()

        if (error) throw error

        toast({
          title: 'Tasting saved!',
          description: 'Your quick tasting has been saved successfully.',
          variant: 'default'
        })
        setSaveError(null)

        router.push(`/${locale}/quick-tasting/${data.id}`)
      } else {
        // Update existing tasting
        const { error } = await supabase
          .from('tastings')
          .update({
            tasting_data: tastingData,
            updated_at: new Date().toISOString()
          })
          .eq('id', tastingId)

        if (error) throw error

        toast({
          title: 'Tasting updated!',
          description: 'Your changes have been saved.',
          variant: 'default'
        })
        setSaveError(null)
      }
    } catch (err) {
      console.error('Error saving tasting:', err)
      const config = await handleApiError(err, {
        operation: 'save_quick_tasting',
        tastingId: tastingId === 'new' ? 'new' : tastingId,
        userId: user?.id
      })
      setSaveError(err)
      toast({
        title: 'Failed to save tasting',
        description: config.userMessage,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUploaded = (url: string) => {
    handleInputChange('photo_url', url)
  }

  const handlePhotoRemoved = () => {
    handleInputChange('photo_url', '')
  }

  const handleShare = async () => {
    if (!tasting) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `My ${formData.product_name} Tasting`,
          text: `Check out my tasting notes for ${formData.product_name}`,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link copied!',
          description: 'The tasting link has been copied to your clipboard.',
          variant: 'default'
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="quick-tasting">
        <LoadingState loading={true} className="min-h-screen" />
      </DashboardAppShell>
    )
  }

  return (
    <DashboardAppShell activeNavItem="quick-tasting">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/quick-tasting`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {tasting?.name || 'Quick Tasting'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Capture your tasting experience
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={!tasting || tastingId === 'new'}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Error Display */}
          {saveError && (
            <ErrorMessage
              error={saveError}
              onRetry={handleSave}
              variant="banner"
              className="mb-6"
            />
          )}

          <div className="space-y-6">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) => handleInputChange('product_name', e.target.value)}
                      placeholder="e.g., Premium Mezcal Joven"
                    />
                  </div>
                  <div>
                    <Label htmlFor="product_type">Product Type</Label>
                    <Select
                      value={formData.product_type}
                      onValueChange={(value) => handleInputChange('product_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mezcal">Mezcal</SelectItem>
                        <SelectItem value="tequila">Tequila</SelectItem>
                        <SelectItem value="sotol">Sotol</SelectItem>
                        <SelectItem value="pulque">Pulque</SelectItem>
                        <SelectItem value="raicilla">Raicilla</SelectItem>
                        <SelectItem value="bacanora">Bacanora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Product Photo (Optional)</Label>
                  <div className="mt-2">
                    <PhotoUpload
                      currentPhotoUrl={formData.photo_url}
                      userId={user?.id || ''}
                      onPhotoUploaded={handlePhotoUploaded}
                      onPhotoRemoved={handlePhotoRemoved}
                      disabled={!user}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tasting Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Notes */}
              <div className="lg:col-span-2 space-y-6">
                {/* Aroma */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aroma</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Intensity</Label>
                      <div className="px-2">
                        <Slider
                          value={[formData.intensity_ratings.aroma]}
                          onValueChange={(value) => handleInputChange('intensity_ratings.aroma', value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Light</span>
                          <span>{formData.intensity_ratings.aroma}/10</span>
                          <span>Intense</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="aroma_notes">Notes</Label>
                      <Textarea
                        id="aroma_notes"
                        value={formData.aroma_notes}
                        onChange={(e) => handleInputChange('aroma_notes', e.target.value)}
                        placeholder="Describe the aromas you detect..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Flavor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Flavor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Intensity</Label>
                      <div className="px-2">
                        <Slider
                          value={[formData.intensity_ratings.flavor]}
                          onValueChange={(value) => handleInputChange('intensity_ratings.flavor', value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Mild</span>
                          <span>{formData.intensity_ratings.flavor}/10</span>
                          <span>Bold</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="flavor_notes">Notes</Label>
                      <Textarea
                        id="flavor_notes"
                        value={formData.flavor_notes}
                        onChange={(e) => handleInputChange('flavor_notes', e.target.value)}
                        placeholder="Describe the flavors on your palate..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Finish */}
                <Card>
                  <CardHeader>
                    <CardTitle>Finish</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Intensity</Label>
                      <div className="px-2">
                        <Slider
                          value={[formData.intensity_ratings.finish]}
                          onValueChange={(value) => handleInputChange('intensity_ratings.finish', value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Short</span>
                          <span>{formData.intensity_ratings.finish}/10</span>
                          <span>Long</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="finish_notes">Notes</Label>
                      <Textarea
                        id="finish_notes"
                        value={formData.finish_notes}
                        onChange={(e) => handleInputChange('finish_notes', e.target.value)}
                        placeholder="Describe the finish and aftertaste..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overall Rating Sidebar */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Overall Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-amber-600 mb-2">
                          {formData.overall_rating}/10
                        </div>
                        <Slider
                          value={[formData.overall_rating]}
                          onValueChange={(value) => handleInputChange('overall_rating', value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="mb-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Intensity Summary</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Aroma</span>
                              <span>{formData.intensity_ratings.aroma}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-amber-600 h-2 rounded-full"
                                style={{ width: `${(formData.intensity_ratings.aroma / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Flavor</span>
                              <span>{formData.intensity_ratings.flavor}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(formData.intensity_ratings.flavor / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Finish</span>
                              <span>{formData.intensity_ratings.finish}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(formData.intensity_ratings.finish / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  )
}

