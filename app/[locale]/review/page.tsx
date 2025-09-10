'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, MessageCircle, ThumbsUp, Filter, Plus, Search, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { PhotoUpload } from '@/components/ui/photo-upload'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { UnifiedAppShell } from '@/components/app-shell'
import Link from 'next/link'

interface Review {
  id: string
  user_id: string
  tasting_id: string
  item_id: string
  rating: number
  title: string
  content: string
  photo_url?: string
  created_at: string
  updated_at: string
  helpful_count: number
  // New comprehensive review fields
  salt_level?: number
  umami_level?: number
  spiciness_level?: number
  acidity_level?: number
  sweetness_level?: number
  texture_rating?: string
  typicity_score?: number
  complexity_score?: number
  review_data?: any
  user_profile: {
    name: string
    avatar_url?: string
  }
  tasting: {
    name: string
    type: string
  }
  item: {
    name: string
    type?: string
  }
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  const [reviews, setReviews] = useState<Review[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMyReviews, setLoadingMyReviews] = useState(false)
  const [creatingReview, setCreatingReview] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showCreateReview, setShowCreateReview] = useState(false)

  // New review form state - comprehensive review fields
  const [newReview, setNewReview] = useState({
    tasting_id: '',
    item_id: '',
    rating: 5,
    title: '',
    content: '',
    photo_url: '',
    // New comprehensive fields from specification
    salt_level: 0,
    umami_level: 0,
    spiciness_level: 0,
    acidity_level: 0,
    sweetness_level: 0,
    texture_rating: 'medium',
    typicity_score: 50,
    complexity_score: 50
  })

  const [availableTastings, setAvailableTastings] = useState<any[]>([])
  const [availableItems, setAvailableItems] = useState<any[]>([])
  const [selectedTasting, setSelectedTasting] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadReviews()
      loadMyReviews()
      loadAvailableTastings()
    }
  }, [user])

  useEffect(() => {
    if (selectedTasting) {
      loadAvailableItems(selectedTasting.id)
    }
  }, [selectedTasting])

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select(`
          *,
          user_profile:profiles(name, avatar_url),
          tasting:tastings(name, type),
          item:tasting_items(name, type)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // Handle specific database errors gracefully
        if (error.message.includes('relation "user_reviews" does not exist') ||
            error.message.includes('does not exist')) {
          console.warn('user_reviews table does not exist, showing empty state')
          setReviews([])
          toast({
            title: 'Reviews Not Available',
            description: 'Review functionality is being set up. Please check back later.',
            variant: 'default',
          })
          return
        }
        throw error
      }
      setReviews(data || [])
    } catch (error) {
      console.error('Error loading reviews:', error)
      setReviews([]) // Set empty array as fallback
      toast({
        title: 'Error Loading Reviews',
        description: 'Unable to load reviews. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMyReviews = async () => {
    if (!user) return

    setLoadingMyReviews(true)
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select(`
          *,
          tasting:tastings(name, type),
          item:tasting_items(name, type)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Handle specific database errors gracefully
        if (error.message.includes('relation "user_reviews" does not exist') ||
            error.message.includes('does not exist')) {
          console.warn('user_reviews table does not exist, showing empty state')
          setMyReviews([])
          toast({
            title: 'Reviews Not Available',
            description: 'Review functionality is being set up. Please check back later.',
            variant: 'default',
          })
          return
        }
        throw error
      }
      setMyReviews(data || [])
    } catch (error) {
      console.error('Error loading my reviews:', error)
      setMyReviews([]) // Set empty array as fallback
      toast({
        title: 'Error Loading Reviews',
        description: 'Unable to load reviews. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoadingMyReviews(false)
    }
  }

  const loadAvailableTastings = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tastings')
        .select('id, name, type, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAvailableTastings(data || [])
    } catch (error) {
      console.error('Error loading tastings:', error)
    }
  }

  const loadAvailableItems = async (tastingId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasting_items')
        .select('id, name, type')
        .eq('tasting_id', tastingId)
        .order('name')

      if (error) throw error
      setAvailableItems(data || [])
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  const handleCreateReview = async () => {
    if (!user) return

    setCreatingReview(true)
    try {
      const { error } = await supabase
        .from('user_reviews')
        .insert({
          user_id: user.id,
          tasting_id: newReview.tasting_id,
          item_id: newReview.item_id,
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
          photo_url: newReview.photo_url || null,
          // New comprehensive review fields
          salt_level: newReview.salt_level,
          umami_level: newReview.umami_level,
          spiciness_level: newReview.spiciness_level,
          acidity_level: newReview.acidity_level,
          sweetness_level: newReview.sweetness_level,
          texture_rating: newReview.texture_rating,
          typicity_score: newReview.typicicty_score,
          complexity_score: newReview.complexity_score,
          review_data: {
            created_at: new Date().toISOString(),
            version: '2.0',
            comprehensive: true
          }
        })

      if (error) throw error

      toast({
        title: 'Review created!',
        description: 'Your review has been published successfully.',
      })

      setShowCreateReview(false)
      setNewReview({
        tasting_id: '',
        item_id: '',
        rating: 5,
        title: '',
        content: '',
        photo_url: '',
        // Reset new comprehensive fields
        salt_level: 0,
        umami_level: 0,
        spiciness_level: 0,
        acidity_level: 0,
        sweetness_level: 0,
        texture_rating: 'medium',
        typicity_score: 50,
        complexity_score: 50
      })
      setSelectedTasting(null)
      setAvailableItems([])

      loadReviews()
      loadMyReviews()
    } catch (error) {
      console.error('Error creating review:', error)
      toast({
        title: 'Error',
        description: 'Failed to create review',
        variant: 'destructive',
      })
    } finally {
      setCreatingReview(false)
    }
  }

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('user_reviews')
        .update({ helpful_count: supabase.raw('helpful_count + 1') })
        .eq('id', reviewId)

      if (error) throw error

      // Update local state
      setReviews(reviews.map(review =>
        review.id === reviewId
          ? { ...review, helpful_count: review.helpful_count + 1 }
          : review
      ))

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.',
      })
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Error',
        description: 'Failed to record your vote. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleTastingSelect = (tastingId: string) => {
    const tasting = availableTastings.find(t => t.id === tastingId)
    setSelectedTasting(tasting)
    setNewReview(prev => ({ ...prev, tasting_id: tastingId, item_id: '' }))
  }

  const handleItemSelect = (itemId: string) => {
    setNewReview(prev => ({ ...prev, item_id: itemId }))
  }

  const handlePhotoUploaded = (url: string) => {
    setNewReview(prev => ({ ...prev, photo_url: url }))
  }

  const handlePhotoRemoved = () => {
    setNewReview(prev => ({ ...prev, photo_url: '' }))
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchQuery === '' ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.item?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' || review.item?.type === filterType

    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      case 'helpful':
        return b.helpful_count - a.helpful_count
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const ReviewCard = ({ review, showActions = true }: { review: Review, showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user_profile?.avatar_url} />
            <AvatarFallback>
              {review.user_profile?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">
                  {review.user_profile?.name || 'Anonymous'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {review.tasting?.name}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm font-medium">{review.rating}/5</span>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
              <p className="text-muted-foreground mb-3">{review.content}</p>

              {/* Photo display */}
              {review.photo_url && (
                <div className="mb-3">
                  <img
                    src={review.photo_url}
                    alt="Product"
                    className="w-full max-w-sm h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Comprehensive Review Details */}
              {(review.salt_level || review.umami_level || review.spiciness_level ||
                review.acidity_level || review.sweetness_level || review.texture_rating ||
                review.typicicty_score || review.complexity_score) && (
                <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Tasting Profile</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {review.salt_level !== undefined && review.salt_level > 0 && (
                      <div>Salt: {review.salt_level}/100</div>
                    )}
                    {review.umami_level !== undefined && review.umami_level > 0 && (
                      <div>Umami: {review.umami_level}/100</div>
                    )}
                    {review.spiciness_level !== undefined && review.spiciness_level > 0 && (
                      <div>Spicy: {review.spiciness_level}/100</div>
                    )}
                    {review.acidity_level !== undefined && review.acidity_level > 0 && (
                      <div>Acidity: {review.acidity_level}/100</div>
                    )}
                    {review.sweetness_level !== undefined && review.sweetness_level > 0 && (
                      <div>Sweet: {review.sweetness_level}/100</div>
                    )}
                    {review.texture_rating && (
                      <div>Texture: {review.texture_rating}</div>
                    )}
                    {review.typicicty_score !== undefined && (
                      <div>Typicity: {review.typicicty_score}/100</div>
                    )}
                    {review.complexity_score !== undefined && (
                      <div>Complexity: {review.complexity_score}/100</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>📍 {review.item?.name}</span>
                <span>🏷️ {review.item?.type || 'General'}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpfulVote(review.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful_count})
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sign in required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view and create reviews.
            </p>
            <Link href={`/${locale}/login`}>
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <UnifiedAppShell variant="dashboard" activeNavItemOverride="review">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reviews</h1>
                <p className="text-muted-foreground mt-1">
                  Share your tasting experiences and discover insights from the community
                </p>
              </div>
              <Dialog open={showCreateReview} onOpenChange={setShowCreateReview}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Tasting Selection */}
                    <div>
                      <Label>Select Tasting Session</Label>
                      <Select
                        value={newReview.tasting_id}
                        onValueChange={handleTastingSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a tasting session" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTastings.map((tasting) => (
                            <SelectItem key={tasting.id} value={tasting.id}>
                              {tasting.name} ({tasting.type}) - {new Date(tasting.created_at).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Item Selection */}
                    {selectedTasting && availableItems.length > 0 && (
                      <div>
                        <Label>Select Item</Label>
                        <Select
                          value={newReview.item_id}
                          onValueChange={handleItemSelect}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an item to review" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Rating */}
                    <div>
                      <Label>Overall Rating</Label>
                      <div className="flex items-center space-x-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= newReview.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comprehensive Review Fields */}
                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold mb-4 block">Detailed Tasting Profile</Label>

                      {/* Basic Tastes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Salt Level: {newReview.salt_level}/100</Label>
                          <Slider
                            value={[newReview.salt_level]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, salt_level: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Umami Level: {newReview.umami_level}/100</Label>
                          <Slider
                            value={[newReview.umami_level]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, umami_level: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Spiciness Level: {newReview.spiciness_level}/100</Label>
                          <Slider
                            value={[newReview.spiciness_level]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, spiciness_level: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Acidity Level: {newReview.acidity_level}/100</Label>
                          <Slider
                            value={[newReview.acidity_level]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, acidity_level: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Sweetness Level: {newReview.sweetness_level}/100</Label>
                          <Slider
                            value={[newReview.sweetness_level]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, sweetness_level: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {/* Texture Selection */}
                      <div className="mb-4">
                        <Label>Texture/Mouthfeel</Label>
                        <Select
                          value={newReview.texture_rating}
                          onValueChange={(value) => setNewReview(prev => ({ ...prev, texture_rating: value }))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select texture" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="watery">Watery</SelectItem>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="full">Full</SelectItem>
                            <SelectItem value="heavy">Heavy</SelectItem>
                            <SelectItem value="syrupy">Syrupy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quality Scores */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Typicity (How representative): {newReview.typicicty_score}/100</Label>
                          <Slider
                            value={[newReview.typicicty_score]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, typicity_score: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Complexity: {newReview.complexity_score}/100</Label>
                          <Slider
                            value={[newReview.complexity_score]}
                            onValueChange={(value) => setNewReview(prev => ({ ...prev, complexity_score: value[0] }))}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <Label htmlFor="review-title">Title</Label>
                      <Input
                        id="review-title"
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your experience"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <Label htmlFor="review-content">Review</Label>
                      <Textarea
                        id="review-content"
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your detailed thoughts..."
                        rows={4}
                      />
                    </div>

                    {/* Photo Upload */}
                    <div>
                      <Label>Product Photo (Optional)</Label>
                      <PhotoUpload
                        currentPhotoUrl={newReview.photo_url}
                        userId={user?.id || ''}
                        onPhotoUploaded={handlePhotoUploaded}
                        onPhotoRemoved={handlePhotoRemoved}
                        disabled={!user}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleCreateReview}
                      className="w-full"
                      disabled={!newReview.tasting_id || !newReview.item_id || !newReview.title.trim() || creatingReview}
                    >
                      {creatingReview ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-muted/30 border-t-primary rounded-full animate-spin"></div>
                          Publishing Review...
                        </div>
                      ) : (
                        'Publish Review'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Tabs defaultValue="all-reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
              <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="all-reviews" className="space-y-6">
              {/* Filters and Search */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mezcal">Mezcal</SelectItem>
                      <SelectItem value="tequila">Tequila</SelectItem>
                      <SelectItem value="sotol">Sotol</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
                      <p>Try adjusting your search or filters, or be the first to write a review!</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-reviews" className="space-y-6">
              <div className="space-y-4">
                {loadingMyReviews ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    <span className="ml-2 text-muted-foreground">Loading your reviews...</span>
                  </div>
                ) : myReviews.length > 0 ? (
                  myReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showActions={false} />
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                      <p>Share your first tasting experience by writing a review!</p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowCreateReview(true)}
                      >
                        Write Your First Review
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </UnifiedAppShell>
  )
}

