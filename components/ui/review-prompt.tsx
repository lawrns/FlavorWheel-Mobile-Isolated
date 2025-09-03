'use client'

import React, { useState } from 'react'
import { Star, Plus, X } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Textarea } from './textarea'
import { Label } from './label'
import { PhotoUpload } from './photo-upload'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface ReviewPromptProps {
  tastingId: string
  itemId: string
  itemName: string
  tastingName: string
  onReviewCreated?: () => void
  onClose?: () => void
}

export function ReviewPrompt({
  tastingId,
  itemId,
  itemName,
  tastingName,
  onReviewCreated,
  onClose
}: ReviewPromptProps) {
  const { user, supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_reviews')
        .insert({
          user_id: user.id,
          tasting_id: tastingId,
          item_id: itemId,
          rating,
          title,
          content,
          photo_url: photoUrl || null,
        })

      if (error) throw error

      toast({
        title: 'Review created!',
        description: 'Your review has been published successfully.',
      })

      onReviewCreated?.()
      onClose?.()
    } catch (error) {
      console.error('Error creating review:', error)
      toast({
        title: 'Error',
        description: 'Failed to create review',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleViewAllReviews = () => {
    router.push('/en/review')
    onClose?.()
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span>Write a Review</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience with {itemName} from {tastingName}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating */}
        <div>
          <Label>Rating</Label>
          <div className="flex items-center space-x-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <Label htmlFor="review-title">Title</Label>
          <Input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
          />
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="review-content">Review</Label>
          <Textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your detailed thoughts..."
            rows={4}
          />
        </div>

        {/* Photo Upload */}
        <div>
          <Label>Product Photo (Optional)</Label>
          <PhotoUpload
            currentPhotoUrl={photoUrl}
            userId={user?.id || ''}
            onPhotoUploaded={setPhotoUrl}
            onPhotoRemoved={() => setPhotoUrl('')}
            disabled={!user}
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            className="flex-1"
          >
            {saving ? 'Publishing...' : 'Publish Review'}
          </Button>
          <Button
            variant="outline"
            onClick={handleViewAllReviews}
            className="flex-1"
          >
            View All Reviews
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
