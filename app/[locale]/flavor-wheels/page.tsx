'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useParams } from 'next/navigation'
import { UnifiedAppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  Target,
  Share2,
  MapPin,
  Users,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Database,
  Globe,
  User,

  ExternalLink,
  Search
} from 'lucide-react'
import { useFlavorWheel } from '@/hooks/use-flavor-wheel'
import { useSupabase } from '@/components/providers/supabase-provider'
import { getTastingResults, type TastingResult } from '@/services/analytics-service'
import { SocialFeed } from '@/components/social-feed'
import { FriendSystem } from '@/components/friend-system'
import { EventCalendar } from '@/components/event-calendar'
import type { FlavorWheelConfig } from '@/services/flavor-analysis-service'
import type { FlavorNode } from '@/lib/flavorwheel/types'
import { transformFlavorDataToNode } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { generateTastingPDF } from '@/services/pdf-service'

import {
  getUserReviews,
  getUserReviewsCount,
  getNearbyEvents,
  getNearbyEventsCount,
  getFriendsTastings,
  getFriendsTastingsCount,
  shareReview,
  joinEvent
} from '@/services/social-service'
import { FilterPanel } from '@/components/flavorwheel/FilterPanel'

// Dynamic import to avoid SSR issues
const FlavorWheel = dynamic(() => import('@/components/flavorwheel/FlavorWheel'), { ssr: false })

// Interface for user reviews - matches social service interface
interface UserReview {
  id: string
  tasting_id: string
  item_id: string
  title: string
  content: string
  rating: number
  submitted_at: string
  tasting?: {
    name: string
    tasting_type: string
  }
  item?: {
    name: string
  }
}

// Interface for nearby events
interface NearbyEvent {
  id: string
  name: string
  scheduled_for: string
  location?: string
  distance?: number
  host: {
    name: string
  }
  tasting_type: string
}

export default function FlavorWheelsPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const { user, client: supabase } = useSupabase()
  const { toast } = useToast()

  // State for wheel configuration
  const [wheelType, setWheelType] = useState<'aroma' | 'flavor' | 'combined' | 'metaphor'>('combined')
  const [scope, setScope] = useState<'personal' | 'universal'>('personal')
  const [wheelData, setWheelData] = useState<FlavorNode | null>(null)

  // State for social features and pill button selection
  const [selectedSection, setSelectedSection] = useState<'reviews' | 'events' | 'friends' | 'create'>('reviews')
  const [userReviews, setUserReviews] = useState<UserReview[]>([])
  const [nearbyEvents, setNearbyEvents] = useState<NearbyEvent[]>([])
  const [friendsActivities, setFriendsActivities] = useState<any[]>([])
  const [loadingSocial, setLoadingSocial] = useState(false)

  // Tasting results state
  const [tastingResults, setTastingResults] = useState<TastingResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWheelData, setSelectedWheelData] = useState<any>(null)
  const [showWheelModal, setShowWheelModal] = useState(false)

  // Filter tasting results based on search query
  const filteredTastingResults = useMemo(() => {
    if (!searchQuery.trim()) return tastingResults

    return tastingResults.filter(result =>
      result.tasting_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.items.some(item =>
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.prose_excerpt && item.prose_excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    )
  }, [tastingResults, searchQuery])

  // Handle wheel modal
  const handleShowWheel = (wheelData: any, itemName: string) => {
    setSelectedWheelData({ ...wheelData, itemName })
    setShowWheelModal(true)
  }

  // Counts for badges
  const [reviewsCount, setReviewsCount] = useState(0)
  const [eventsCount, setEventsCount] = useState(0)
  const [friendsCount, setFriendsCount] = useState(0)

  // Initialize flavor wheel configuration
  const [config, setConfig] = useState<FlavorWheelConfig>({
    wheelType,
    scope,
    userId: user?.id,
    useMultilingualExtraction: true,
  })

  // Use the flavor wheel hook
  const {
    data: flavorData,
    loading,
    error,
    selectedCategory,
    refreshData,
    updateConfig,
  } = useFlavorWheel(config)

  // Update config when wheel type, scope, or selected section changes
  useEffect(() => {
    // Adjust scope based on selected section
    let adjustedScope = scope
    if (selectedSection === 'reviews' || selectedSection === 'friends' || selectedSection === 'create') {
      adjustedScope = 'personal'
    } else if (selectedSection === 'events') {
      adjustedScope = 'universal'
    }

    const newConfig: FlavorWheelConfig = {
      wheelType,
      scope: adjustedScope,
      userId: adjustedScope === 'personal' ? user?.id : undefined,
      useMultilingualExtraction: true,
    }
    setConfig(newConfig)
    updateConfig(newConfig)
  }, [wheelType, scope, selectedSection, user?.id, updateConfig])

  // Transform flavor data to wheel format
  useEffect(() => {
    if (flavorData && flavorData.length > 0) {
      try {
        setWheelData(transformFlavorDataToNode(flavorData))
      } catch (e) {
        console.error('Transform error:', e)
      }
    }
  }, [flavorData])

  // Load social data when user changes
  useEffect(() => {
    if (user) {
      loadSocialData()
      loadTastingResults()
      setupRealtimeSubscriptions()
    }
  }, [user])

  // Refresh tasting results when new tastings are completed
  useEffect(() => {
    if (user) {
      // Set up subscription for new flavor wheels
      const wheelSubscription = supabase
        .channel('flavor_wheels_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'flavor_wheels',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('New flavor wheel created, refreshing results')
            loadTastingResults()
          }
        )
        .subscribe()

      return () => {
        wheelSubscription.unsubscribe()
      }
    }

    return () => {
      // Cleanup subscriptions on unmount
      cleanupSubscriptions()
    }
  }, [user])

  // Real-time subscriptions cleanup
  const subscriptionsRef = useRef<any[]>([])

  const cleanupSubscriptions = () => {
    subscriptionsRef.current.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    })
    subscriptionsRef.current = []
  }

  // Setup real-time subscriptions for live updates
  const setupRealtimeSubscriptions = () => {
    if (!user) return

    // Subscribe to user reviews changes
    const reviewsSubscription = supabase
      .channel(`user_reviews:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_reviews',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Reviews updated:', payload)
          // Refresh social data when reviews change
          loadSocialData()
        }
      )
      .subscribe()

    // Subscribe to tastings changes (affects flavor wheel data)
    const tastingsSubscription = supabase
      .channel(`tastings:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tastings',
          filter: `created_by=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Tastings updated:', payload)
          // Refresh flavor wheel data when tastings change
          refreshData()
        }
      )
      .subscribe()

    // Subscribe to nearby events (public tastings)
    const eventsSubscription = supabase
      .channel('public_tastings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tastings',
        },
        (payload: any) => {
          console.log('New public tasting:', payload)
          // Refresh events when new public tastings are created
          loadSocialData()
        }
      )
      .subscribe()

    // Store subscriptions for cleanup
    subscriptionsRef.current = [reviewsSubscription, tastingsSubscription, eventsSubscription]
  }

  // Load tasting results
  const loadTastingResults = async () => {
    if (!user) return

    console.log('🎯 DEBUGGING: Loading tasting results for user:', user.id)
    setLoadingResults(true)
    try {
      const results = await getTastingResults(user.id)
      console.log('🎯 DEBUGGING: Loaded tasting results:', results.length, 'results')
      console.log('🎯 DEBUGGING: Sample result:', results[0])
      console.log('🎯 DEBUGGING: All results:', results)
      setTastingResults(results)
    } catch (error) {
      console.error('🎯 DEBUGGING: Error loading tasting results:', error)
    } finally {
      setLoadingResults(false)
    }
  }

  // Load user reviews and nearby events with error handling and offline fallback
  const loadSocialData = async () => {
    if (!user) return

    setLoadingSocial(true)
    let hasErrors = false

    try {
      // Load user reviews using social service with individual error handling
      try {
        const reviews = await getUserReviews(user.id, 10)
        const reviewsCount = await getUserReviewsCount(user.id)
        setUserReviews(reviews as UserReview[])
        setReviewsCount(reviewsCount)
      } catch (reviewError) {
        console.error('Error loading user reviews:', reviewError)
        hasErrors = true
        setUserReviews([])
        setReviewsCount(0)
      }

      // Load nearby events using geolocation with error handling
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords
                const events = await getNearbyEvents(latitude, longitude, 50, 10)
                const eventsCount = await getNearbyEventsCount(latitude, longitude, 50)
                setNearbyEvents(events as unknown as NearbyEvent[])
                setEventsCount(eventsCount)
              } catch (eventError) {
                console.error('Error loading nearby events:', eventError)
                setNearbyEvents([])
                setEventsCount(0)
              }
            },
            (geoError) => {
              console.error('Geolocation error:', geoError)
              // Fallback: load events without location filtering
              setNearbyEvents([])
              setEventsCount(0)
            }
          )
        } else {
          // Fallback for browsers without geolocation
          setNearbyEvents([])
          setEventsCount(0)
        }
      } catch (eventError) {
        console.error('Error in event loading process:', eventError)
        setNearbyEvents([])
        setEventsCount(0)
      }

      // Load friends' tastings using social service with error handling
      try {
        const friendsTastings = await getFriendsTastings(user.id, 10)
        const friendsCount = await getFriendsTastingsCount(user.id)
        setFriendsActivities(friendsTastings)
        setFriendsCount(friendsCount)
      } catch (friendsError) {
        console.error('Error loading friends tastings:', friendsError)
        hasErrors = true
        setFriendsActivities([])
        setFriendsCount(0)
      }

    } catch (error) {
      console.error('Critical error loading social data:', error)
      hasErrors = true

      // Show user-friendly error message only for critical errors
      toast({
        title: 'Error de conexión',
        description: 'Algunos datos sociales no se pudieron cargar. La aplicación seguirá funcionando.',
        variant: 'destructive',
      })
    } finally {
      setLoadingSocial(false)

      // Cache successful data for offline fallback
      if (!hasErrors && user) {
        try {
          localStorage.setItem(`user_reviews_${user.id}`, JSON.stringify(userReviews))
          localStorage.setItem('nearby_events', JSON.stringify(nearbyEvents))
        } catch (cacheError) {
          console.error('Error caching data:', cacheError)
        }
      }
    }
  }

  // Handle sharing functionality with PDF generation
  const handleShareReview = async (review: UserReview) => {
    try {
      // Generate PDF for the review
      const mockTasting = {
        id: review.tasting_id,
        name: review.tasting?.name || 'Tasting',
        description: '',
        type: review.tasting?.tasting_type || 'general',
        created_at: review.submitted_at,
      }

      const mockTastingNote = {
        id: review.id,
        user_id: user?.id || '',
        tasting_id: review.tasting_id,
        item_id: review.item_id,
        notes: review.content,
        overall_rating: review.rating,
        submitted_at: review.submitted_at,
      }

      const pdfBlob = await generateTastingPDF(mockTasting as any, mockTastingNote as any, {
        includeFlavorWheel: true,
      })

      // Create a shareable URL
      const pdfUrl = URL.createObjectURL(pdfBlob)

      if (navigator.share) {
        try {
          await navigator.share({
            title: `My Review: ${review.tasting?.name} - FlavorWheel`,
            text: `Descubre mi reseña de ${review.item?.name}`,
            url: `${window.location.origin}/${locale}/flavor-wheels?shared=${review.id}`,
          })
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        // Fallback: download PDF and copy link
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `reseña-${review.tasting?.name}-${review.item?.name}.pdf`
        link.click()

        await navigator.clipboard.writeText(`${window.location.origin}/${locale}/flavor-wheels?shared=${review.id}`)
        toast({
          title: '¡PDF descargado y enlace copiado!',
          description: 'El PDF se ha descargado y el enlace se copió al portapapeles',
        })
      }
    } catch (error) {
      console.error('Error sharing review:', error)
      toast({
        title: 'Error al compartir',
        description: 'No se pudo generar el PDF para compartir',
        variant: 'destructive',
      })
    }
  }

  // Handle joining events
  const handleJoinEvent = async (event: any) => {
    if (!user) return

    try {
      const success = await joinEvent(event.id, user.id)

      if (success) {
        toast({
          title: 'Joined event!',
          description: 'You will receive notifications about the event',
        })

        // Refresh events
        loadSocialData()
      } else {
        throw new Error('Failed to join event')
      }
    } catch (error) {
      console.error('Error joining event:', error)
      toast({
        title: 'Error joining',
        description: 'Could not join the event',
        variant: 'destructive',
      })
    }
  }

  return (
    <UnifiedAppShell variant="dashboard" activeNavItemOverride="flavor-wheels">
      <ErrorBoundary>
        <div className="min-h-screen bg-fx-bg">
        {/* Header - Mobile Optimized */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
          <div className="w-full px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="min-w-0">
                <h1 className="fx-text-lg sm:fx-text-2xl font-bold text-foreground truncate">Flavor Wheels</h1>
                <p className="fx-text-xs sm:fx-text-sm text-fx-text-muted">Explore and analyze your personalized flavor profiles</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={refreshData} disabled={loading} className="fx-text-xs sm:fx-text-sm min-h-[44px]">
                  <RefreshCw className={`mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">↻</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile-First Responsive Design */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Top Pill Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-6">
            <Button
              variant={selectedSection === 'reviews' ? 'default' : 'outline'}
              size="sm"
              className={`w-full sm:w-auto rounded-full px-3 sm:px-4 py-2 fx-text-xs sm:fx-text-sm transition-all duration-normal ease-standard ${
                selectedSection === 'reviews'
                  ? 'bg-fx-primary hover:bg-fx-primary-hover text-fx-text-inverse'
                  : 'bg-fx-bg border-fx-border-subtle text-fx-text-primary hover:bg-fx-bg-subtle'
              }`}
              onClick={() => setSelectedSection('reviews')}
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Your Reviews</span>
              <span className="sm:hidden">Reviews</span>
              <Badge
                variant="secondary"
                className="ml-1 sm:ml-2 bg-fx-accent/10 text-fx-accent border-fx-accent/20 text-xs px-1"
              >
                {reviewsCount}
              </Badge>
            </Button>

            <Button
              variant={selectedSection === 'events' ? 'default' : 'outline'}
              size="sm"
              className={`w-full sm:w-auto rounded-full px-3 sm:px-4 py-2 fx-text-xs sm:fx-text-sm transition-all duration-normal ease-standard ${
                selectedSection === 'events'
                  ? 'bg-fx-primary hover:bg-fx-primary-hover text-fx-text-inverse'
                  : 'bg-fx-bg border-fx-border-subtle text-fx-text-primary hover:bg-fx-bg-subtle'
              }`}
              onClick={() => setSelectedSection('events')}
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nearby Events</span>
              <span className="sm:hidden">Events</span>
              <Badge
                variant="secondary"
                className="ml-1 sm:ml-2 bg-fx-accent/10 text-fx-accent border-fx-accent/20 text-xs px-1"
              >
                {eventsCount}
              </Badge>
            </Button>

            <Button
              variant={selectedSection === 'friends' ? 'default' : 'outline'}
              size="sm"
              className={`w-full sm:w-auto rounded-full px-3 sm:px-4 py-2 fx-text-xs sm:fx-text-sm transition-all duration-normal ease-standard ${
                selectedSection === 'friends'
                  ? 'bg-fx-primary hover:bg-fx-primary-hover text-fx-text-inverse'
                  : 'bg-fx-bg border-fx-border-subtle text-fx-text-primary hover:bg-fx-bg-subtle'
              }`}
              onClick={() => setSelectedSection('friends')}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Friends&apos; Tastings</span>
              <span className="sm:hidden">Friends</span>
              <Badge
                variant="secondary"
                className="ml-1 sm:ml-2 bg-fx-accent/10 text-fx-accent border-fx-accent/20 text-xs px-1"
              >
                {friendsCount}
              </Badge>
            </Button>

            <Button
              variant={selectedSection === 'create' ? 'default' : 'outline'}
              size="sm"
              className={`w-full sm:w-auto rounded-full px-3 sm:px-4 py-2 fx-text-xs sm:fx-text-sm transition-all duration-normal ease-standard ${
                selectedSection === 'create'
                  ? 'bg-fx-primary hover:bg-fx-primary-hover text-fx-text-inverse'
                  : 'bg-fx-bg border-fx-border-subtle text-fx-text-primary hover:bg-fx-bg-subtle'
              }`}
              onClick={() => setSelectedSection('create')}
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Create Wheel</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>

          <div className="w-full space-y-6">
            {/* Social Content Views - Mobile Optimized */}
            <div className="w-full">
              {selectedSection === 'reviews' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 fx-text-base sm:fx-text-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-fx-primary" />
                      <span>Your Reviews</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 sm:space-y-3">
                      {loadingSocial ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-fx-border-subtle border-t-fx-primary"></div>
                        </div>
                      ) : userReviews.length > 0 ? (
                        userReviews.map((review) => (
                          <div key={review.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-fx-bg-subtle rounded-lg hover:bg-fx-bg-subtle transition-colors space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {review.item?.name || 'Unnamed Product'}
                              </p>
                              <p className="text-xs text-fx-text-muted">
                                {review.tasting?.name} • {new Date(review.submitted_at).toLocaleDateString('en-US')}
                              </p>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`fx-text-xs sm:fx-text-sm ${
                                        i < Math.floor(review.rating / 2)
                                          ? 'text-fx-accent'
                                          : 'text-fx-text-muted'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                                <span className="text-xs text-fx-text-muted ml-1">
                                  {review.rating}/10
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShareReview(review)}
                              className="w-full sm:w-auto sm:ml-3 flex-shrink-0 min-h-[44px]"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm text-fx-text-muted mb-3">No reviews yet</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/${locale}/create`)}
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            Create your first tasting
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedSection === 'events' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 fx-text-base sm:fx-text-lg">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-fx-accent" />
                      <span>Nearby Events</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 sm:space-y-3">
                      {loadingSocial ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-fx-border-subtle border-t-fx-accent"></div>
                        </div>
                      ) : nearbyEvents.length > 0 ? (
                        nearbyEvents.map((event) => (
                          <div key={event.id} className="p-3 sm:p-4 bg-fx-bg-subtle rounded-lg hover:bg-fx-bg-subtle transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                              <p className="font-medium text-sm truncate">{event.name}</p>
                              <Badge variant="secondary" className="text-xs flex-shrink-0 w-fit">
                                {event.distance?.toFixed(1)} km
                              </Badge>
                            </div>
                            <p className="text-xs text-fx-text-muted mb-3">
                              {new Date(event.scheduled_for).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2 min-w-0">
                                <MapPin className="h-3 w-3 text-fx-accent flex-shrink-0" />
                                <span className="text-xs text-fx-text-muted truncate">
                                  {typeof event.location === 'object' && (event.location as any)?.address || 'Location TBD'}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="bg-fx-accent hover:bg-fx-accent-hover text-fx-text-inverse w-full sm:w-auto flex-shrink-0 min-h-[44px]"
                                onClick={() => handleJoinEvent(event)}
                              >
                                Join
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm text-fx-text-muted mb-3">No events nearby</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/${locale}/events/create`)}
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            Host an event
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedSection === 'friends' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 fx-text-base sm:fx-text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-fx-secondary" />
                      <span>Friends&apos; Tastings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 sm:space-y-3">
                      {loadingSocial ? (
                        <div className="flex items-center justify-center py-6 sm:py-8">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-fx-border-subtle border-t-fx-secondary"></div>
                        </div>
                      ) : friendsActivities.length > 0 ? (
                        friendsActivities.map((activity) => (
                          <div key={activity.id} className="p-3 sm:p-4 bg-fx-bg-subtle rounded-lg hover:bg-fx-bg-subtle transition-colors">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                                <AvatarImage src={activity.user_profile?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {activity.user_profile?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">
                                  {activity.user_profile?.name || 'Anonymous User'}
                                </p>
                                <p className="text-sm text-fx-text-muted truncate">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-fx-text-muted">
                                  {new Date(activity.created_at).toLocaleDateString('en-US')} • {activity.item_count} items
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/${locale}/tastings/${activity.id}`)}
                                className="flex-shrink-0 min-h-[44px]"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <p className="text-sm text-fx-text-muted mb-3">Follow friends to see their tastings</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/${locale}/social`)}
                            className="w-full sm:w-auto min-h-[44px]"
                          >
                            Find friends
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedSection === 'create' && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 fx-text-base sm:fx-text-lg">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-fx-primary" />
                      <span>Create Flavor Wheel</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Generate a personalized flavor wheel from your tasting notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-fx-primary mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-fx-text-primary mb-1">
                          Flavor Wheel Creation
                        </h3>
                        <p className="text-xs text-fx-text-muted mb-4">
                          This feature is available in the mobile app for optimal experience
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/${locale}/create-wheel`)}
                          className="w-full sm:w-auto min-h-[44px]"
                        >
                          Open Mobile Creator
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tasting Results Section */}
            <div className="w-full mt-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-fx-accent" />
                      <span className="fx-text-base sm:fx-text-lg">Your Tasting Results</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {filteredTastingResults.length}
                    </Badge>
                  </CardTitle>
                  <p className="fx-text-xs sm:fx-text-sm text-fx-text-muted">
                    View your completed tastings with generated flavor wheels
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Search Input */}
                  <div className="mb-4">
                    <Input
                      placeholder="Search tastings or items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Loading State */}
                  {loadingResults && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-fx-border-subtle border-t-fx-primary"></div>
                    </div>
                  )}

                  {/* Results Display */}
                  {!loadingResults && filteredTastingResults.length > 0 && (
                    <div className="space-y-4">
                      {filteredTastingResults.map((result) => (
                        result.group_id ? (
                          // Multi-item tasting (grouped)
                          <Accordion key={result.id} type="single" collapsible>
                            <AccordionItem value={result.id}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="text-left">
                                    <h3 className="font-semibold text-sm sm:text-base">
                                      {result.tasting_name}
                                    </h3>
                                    <p className="text-xs text-fx-text-muted">
                                      {new Date(result.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })} • {result.items.length} items
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Group
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-3 pt-2">
                                  {result.items.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-3 bg-fx-bg-subtle">
                                      <div className="flex items-start space-x-3">
                                        {item.picture_url && (
                                          <img
                                            src={item.picture_url}
                                            alt={item.item_name}
                                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-sm">{item.item_name}</h4>
                                          {item.prose_excerpt && (
                                            <p className="text-xs text-fx-text-muted mt-1">
                                              {item.prose_excerpt}
                                            </p>
                                          )}
                                          <div className="flex items-center space-x-2 mt-2">
                                            <Badge variant="secondary" className="text-xs">
                                              {item.wheel_type}
                                            </Badge>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="text-xs min-h-[44px]"
                                              onClick={() => handleShowWheel(item.wheel_data, item.item_name)}
                                            >
                                              View Wheel
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          // Single item tasting
                          <Card key={result.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                {result.items[0]?.picture_url && (
                                  <img
                                    src={result.items[0].picture_url}
                                    alt={result.items[0].item_name}
                                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm sm:text-base">
                                    {result.tasting_name}
                                  </h3>
                                  <p className="text-sm text-fx-text-muted">
                                    {result.items[0]?.item_name}
                                  </p>
                                  <p className="text-xs text-fx-text-muted">
                                    {new Date(result.date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  {result.items[0]?.prose_excerpt && (
                                    <p className="text-xs text-fx-text-muted mt-2">
                                      {result.items[0].prose_excerpt}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-2 mt-3">
                                    <Badge variant="secondary" className="text-xs">
                                      {result.items[0]?.wheel_type}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs min-h-[44px]"
                                      onClick={() => handleShowWheel(result.items[0]?.wheel_data, result.items[0]?.item_name)}
                                    >
                                      View Wheel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loadingResults && filteredTastingResults.length === 0 && (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-fx-text-muted mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-fx-text-primary mb-1">
                        {searchQuery ? 'No matching results' : 'No tasting results yet'}
                      </h3>
                      <p className="text-xs text-fx-text-muted mb-4">
                        {searchQuery
                          ? 'Try adjusting your search terms'
                          : 'Complete some tastings to see your flavor wheel results here'
                        }
                      </p>

                      {/* Debug information */}
                      {process.env.NODE_ENV === 'development' && !searchQuery && (
                        <div className="text-xs text-fx-text-muted mb-4 p-2 bg-fx-bg-subtle rounded">
                          <p>Debug: User ID: {user?.id}</p>
                          <p>Loading: {loadingResults ? 'Yes' : 'No'}</p>
                          <p>Total Results: {tastingResults.length}</p>
                          <p>Filtered Results: {filteredTastingResults.length}</p>
                        </div>
                      )}
                      {!searchQuery && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/${locale}/create`)}
                          className="min-h-[44px]"
                        >
                          Create a tasting
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Flavor Wheel Section - Mobile Optimized */}
            <div className="w-full mt-6">

              {/* Enhanced Interactive Flavor Wheel - Mobile Optimized */}
              <Card className="min-h-[60vh] sm:min-h-[70vh] md:min-h-[600px]">
                <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
                  <CardTitle className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-fx-accent" />
                      <span className="fx-text-base sm:fx-text-lg">Interactive Flavor Wheel</span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${scope === 'personal' ? 'bg-fx-accent/10 text-fx-accent border-fx-accent/20' : 'bg-fx-secondary/10 text-fx-secondary border-fx-secondary/20'}`}
                      >
                        {wheelType === 'aroma' && 'Aroma'}
                        {wheelType === 'flavor' && 'Flavor'}
                        {wheelType === 'combined' && 'Combined'}
                        {wheelType === 'metaphor' && 'Metaphor'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scope === 'personal' ? (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            Personal
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            Universal
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardTitle>
                  <p className="fx-text-xs sm:fx-text-sm text-fx-text-muted">
                    {scope === 'personal'
                      ? 'Based on your tastings and personal preferences'
                      : 'Aggregated data from the entire community'
                    }
                  </p>
                </CardHeader>
                <CardContent className="h-[50vh] sm:h-[60vh] md:h-[500px] flex items-center justify-center p-1 sm:p-2 md:p-6">
                  {/* Error State */}
                  {error && (
                    <Alert variant="destructive" className="max-w-md">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Error:</strong> {error}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshData}
                          className="mt-2 w-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reintentar
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Loading State */}
                  {loading && !error && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-fx-border-subtle border-t-fx-primary"></div>
                      <h3 className="mb-2 fx-text-lg font-semibold text-fx-text-primary">
                        Generando rueda de sabores...
                      </h3>
                      <p className="max-w-md text-fx-text-secondary">
                        Analizando tus datos de cata para crear tu perfil personalizado.
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !error && (!flavorData || flavorData.length === 0) && (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="mb-4 h-16 w-16 text-fx-text-muted" />
                      <h3 className="mb-2 fx-text-lg font-semibold text-fx-text-primary">
                        {scope === 'personal' ? 'No hay datos personales' : 'No hay datos universales'}
                      </h3>
                      <p className="mb-6 max-w-md text-fx-text-secondary">
                        {scope === 'personal'
                          ? 'Participa en algunas catas para generar tu rueda personalizada.'
                          : 'Los datos universales aún no están disponibles.'
                        }
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button onClick={() => router.push(`/${locale}/create`)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Crear Cata
                        </Button>
                        {scope === 'personal' && (
                          <Button variant="outline" onClick={() => setScope('universal')}>
                            <Globe className="mr-2 h-4 w-4" />
                            Ver Datos Universales
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Demographic Filters Panel */}
                  {!loading && !error && wheelData && (
                    <div className="mb-6">
                      <FilterPanel
                        config={config}
                        onConfigChange={(cfg) => setConfig(cfg)}
                      />
                    </div>
                  )}

                  {/* Enhanced Flavor Wheel Display - Responsive & Mobile Optimized */}
                  {!loading && !error && wheelData && (
                    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                      {/* Mobile-optimized container with proper scaling */}
                      <div className="w-full h-full max-w-full max-h-full flex items-center justify-center px-2 sm:px-4">
                        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl aspect-square flex items-center justify-center">
                          <FlavorWheel
                            data={wheelData}
                            title="Rueda de Sabores"
                            reduceMotion={false}
                          />
                        </div>
                      </div>

                      {/* Data Quality Indicator */}
                      {flavorData && flavorData.length > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge
                            variant={flavorData.length >= 5 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {flavorData.length} categorías
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Data Quality Alert - Positioned below wheel */}
                  {!loading && !error && flavorData && flavorData.length > 0 && flavorData.length < 5 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Alert className="border-fx-border-subtle bg-fx-bg-subtle/90 backdrop-blur">
                        <AlertTriangle className="h-4 w-4 text-fx-accent" />
                        <AlertDescription className="text-fx-text-primary text-sm">
                          <strong>Datos limitados:</strong> Tu rueda se basa en {flavorData.length} categoría{flavorData.length > 1 ? 's' : ''}.
                          Participa en más catas para análisis más detallados.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Success Quality Alert */}
                  {!loading && !error && flavorData && flavorData.length >= 5 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Alert className="border-green-200 bg-green-50/90 backdrop-blur">
                        <Target className="h-4 w-4 text-fx-accent" />
                        <AlertDescription className="text-green-800 text-sm">
                          <strong>Datos completos:</strong> Tu rueda incluye {flavorData.length} categorías.
                          ¡Excelente base para análisis detallado!
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


          </div>
        </div>

      </div>

      {/* Flavor Wheel Modal */}
      <Dialog open={showWheelModal} onOpenChange={setShowWheelModal}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle>
              Flavor Wheel - {selectedWheelData?.itemName || 'Tasting Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedWheelData && (
              <div className="space-y-4">
                {/* Render the flavor wheel visualization */}
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    {/* Use the existing FlavorWheel component */}
                    <FlavorWheel
                      data={selectedWheelData}
                    />
                  </div>
                </div>

                {/* Additional wheel information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Wheel Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Categories:</span>
                          <span>{selectedWheelData?.children?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Descriptors:</span>
                          <span>
                            {selectedWheelData?.children?.reduce((acc: number, cat: any) =>
                              acc + (cat.children?.length || 0), 0) || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dominant Flavors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedWheelData?.children?.slice(0, 3).map((category: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color || '#8B5CF6' }}
                            />
                            <span className="text-sm">{category.name}</span>
                            <span className="text-xs text-fx-text-muted ml-auto">
                              {Math.round((category.value || 0) * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </ErrorBoundary>
    </UnifiedAppShell>
  )
}
