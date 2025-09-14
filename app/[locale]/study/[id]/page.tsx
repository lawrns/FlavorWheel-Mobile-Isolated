'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, Star, Award, CheckCircle, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { errorHandler } from '@/lib/error-handling'
import { DashboardAppShell } from '@/components/app-shell'
import Link from 'next/link'

interface StudySession {
  id: string
  name: string
  description: string
  type: 'educational' | 'personal' | 'guided'
  difficulty: 'beginner' | 'intermediate' | 'professional'
  estimated_duration: number // in minutes
  progress: number // 0-100
  status: 'not_started' | 'in_progress' | 'completed'
  current_step: number
  total_steps: number
  created_at: string
  tasting_items: Array<{
    id: string
    name: string
    type: string
    completed: boolean
    notes?: string
    rating?: number
    photo_url?: string
  }>
}

export default function StudySessionPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const sessionId = (params.id as string)
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  const [session, setSession] = useState<StudySession | null>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadStudySession()
    }
  }, [sessionId])

  const loadStudySession = async () => {
    try {
      // Mock study session data
      const mockSession: StudySession = {
        id: sessionId,
        name: 'Mastering Mexican Spirits',
        description: 'A comprehensive study of tequila, mezcal, and other Mexican spirits with detailed tasting notes and cultural context.',
        type: 'educational',
        difficulty: 'intermediate',
        estimated_duration: 120,
        progress: 35,
        status: 'in_progress',
        current_step: 2,
        total_steps: 8,
        created_at: new Date().toISOString(),
        tasting_items: [
          {
            id: '1',
            name: 'Blanco Tequila Basics',
            type: 'tequila',
            completed: true,
            notes: 'Fresh agave notes with citrus undertones',
            rating: 8
          },
          {
            id: '2',
            name: 'Joven Mezcal Profile',
            type: 'mezcal',
            completed: false,
            notes: '',
            rating: 0
          },
          {
            id: '3',
            name: 'Aged Reposado Comparison',
            type: 'tequila',
            completed: false,
            notes: '',
            rating: 0
          }
        ]
      }

      setSession(mockSession)
      const currentItem = mockSession.tasting_items.find(item => !item.completed)
      setCurrentItem(currentItem || mockSession.tasting_items[0])
      if (currentItem) {
        setNotes(currentItem.notes || '')
        setRating(currentItem.rating || 0)
        setPhotoUrl(currentItem.photo_url || '')
      }
    } catch (error) {
      // Error handling replaced with proper error boundary
      errorHandler.logError(error, { source: 'study-page', action: 'load-study-session' })
      toast({
        title: 'Error',
        description: 'Failed to load study session',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProgress = async () => {
    if (!session || !currentItem) return

    setSaving(true)
    try {
      // Update the current item with notes, rating, and photo
      const updatedItems = session.tasting_items.map(item =>
        item.id === currentItem.id
          ? { ...item, notes, rating, photo_url: photoUrl, completed: rating > 0 }
          : item
      )

      // Calculate new progress
      const completedItems = updatedItems.filter(item => item.completed).length
      const newProgress = Math.round((completedItems / session.total_steps) * 100)

      setSession(prev => prev ? {
        ...prev,
        tasting_items: updatedItems,
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : 'in_progress'
      } : null)

      toast({
        title: 'Progress saved!',
        description: 'Your tasting notes have been saved successfully.',
      })
    } catch (error) {
      // Error handling replaced with proper error boundary
      errorHandler.logError(error, { source: 'study-page', action: 'save-progress' })
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNextItem = () => {
    if (!session) return

    const currentIndex = session.tasting_items.findIndex(item => item.id === currentItem?.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < session.tasting_items.length) {
      const nextItem = session.tasting_items[nextIndex]
      setCurrentItem(nextItem)
      setNotes(nextItem.notes || '')
      setRating(nextItem.rating || 0)
      setPhotoUrl(nextItem.photo_url || '')
    }
  }

  const handlePreviousItem = () => {
    if (!session) return

    const currentIndex = session.tasting_items.findIndex(item => item.id === currentItem?.id)
    const prevIndex = currentIndex - 1

    if (prevIndex >= 0) {
      const prevItem = session.tasting_items[prevIndex]
      setCurrentItem(prevItem)
      setNotes(prevItem.notes || '')
      setRating(prevItem.rating || 0)
      setPhotoUrl(prevItem.photo_url || '')
    }
  }

  const handlePhotoUploaded = (url: string) => {
    setPhotoUrl(url)
  }

  const handlePhotoRemoved = () => {
    setPhotoUrl('')
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="study">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!session) {
    return (
      <DashboardAppShell activeNavItem="study">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-card">
              <h2 className="text-xl font-semibold mb-4">Study session not found</h2>
              <p className="text-card-text-secondary mb-6">
                The study session you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link href={`/${locale}/study`}>
                <Button>Back to Study</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardAppShell>
    )
  }

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return [...Array(10)].map((_, i) => (
      <button
        key={i}
        onClick={interactive ? () => setRating(i + 1) : undefined}
        className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
        disabled={!interactive}
      >
        <Star
          className={`h-6 w-6 ${
            i < currentRating
              ? 'text-fx-flavor-sweet fill-current'
              : 'text-fx-border-subtle'
          }`}
        />
      </button>
    ))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'professional': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardAppShell activeNavItem="study">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/study`}
                  className="text-card-text-secondary hover:text-foreground"
                >
                  ← Back to Study
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{session.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getDifficultyColor(session.difficulty)}>
                      {session.difficulty}
                    </Badge>
                    <Badge variant="outline">{session.type}</Badge>
                    <div className="flex items-center text-sm text-card-text-secondary">
                      <Clock className="h-4 w-4 mr-1" />
                      {session.estimated_duration} min
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-card-text-secondary mb-2">Progress</div>
                <div className="flex items-center space-x-2">
                  <Progress value={session.progress} className="w-24" />
                  <span className="text-sm font-medium">{session.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-card">
            {/* Study Progress */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Study Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{session.progress}%</span>
                      </div>
                      <Progress value={session.progress} />
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600 mb-1">
                        {session.current_step}/{session.total_steps}
                      </div>
                      <div className="text-sm text-card-text-secondary">Steps Completed</div>
                    </div>

                    <div className="space-y-2">
                      {session.tasting_items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            currentItem?.id === item.id
                              ? 'border-amber-300 bg-amber-50'
                              : item.completed
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setCurrentItem(item)
                            setNotes(item.notes || '')
                            setRating(item.rating || 0)
                            setPhotoUrl(item.photo_url || '')
                          }}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            item.completed
                              ? 'bg-green-100'
                              : currentItem?.id === item.id
                                ? 'bg-amber-100'
                                : 'bg-gray-100'
                          }`}>
                            {item.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-xs font-medium text-gray-600">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Tasting Item */}
            <div className="lg:col-span-2 space-y-6">
              {currentItem && (
                <>
                  {/* Current Item Header */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{currentItem.name}</span>
                        <Badge variant="secondary">{currentItem.type}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Rating */}
                        <div>
                          <Label className="text-base font-semibold mb-3 block">
                            Overall Rating (1-10)
                          </Label>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {renderStars(rating, true)}
                            </div>
                            <span className="text-sm text-card-text-secondary ml-2">
                              {rating}/10
                            </span>
                          </div>
                        </div>

                        {/* Tasting Notes */}
                        <div>
                          <Label htmlFor="notes" className="text-base font-semibold mb-3 block">
                            Tasting Notes
                          </Label>
                          <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe the aroma, flavor, finish, and any other observations..."
                            rows={6}
                            className="resize-none"
                          />
                        </div>

                        {/* Product Photo */}
                        <div>
                          <Label className="text-base font-semibold mb-3 block">
                            Product Photo (Optional)
                          </Label>
                          <PhotoUpload
                            currentPhotoUrl={photoUrl}
                            userId={user?.id || ''}
                            onPhotoUploaded={handlePhotoUploaded}
                            onPhotoRemoved={handlePhotoRemoved}
                            disabled={!user}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4">
                          <Button
                            variant="outline"
                            onClick={handlePreviousItem}
                            disabled={session.tasting_items.findIndex(item => item.id === currentItem.id) === 0}
                          >
                            Previous
                          </Button>

                          <div className="flex space-x-3">
                            <Button
                              onClick={handleSaveProgress}
                              disabled={saving}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              {saving ? 'Saving...' : 'Save Progress'}
                            </Button>

                            <Button
                              onClick={handleNextItem}
                              disabled={session.tasting_items.findIndex(item => item.id === currentItem.id) === session.tasting_items.length - 1}
                              variant="outline"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Study Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-card-text-secondary">
                        <p>• Take your time to observe each characteristic before rating</p>
                        <p>• Consider the balance between different flavor components</p>
                        <p>• Note how the spirit evolves from first sip to finish</p>
                        <p>• Compare this sample with your previous tastings</p>
                        <p>• Consider the production method and aging process</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  )
}

