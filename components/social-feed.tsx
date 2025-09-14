'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { useRealtimeContext } from '@/components/providers/realtime-provider'
import { supabase } from '@/lib/supabase'
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar as HiCalendar,
  Trophy as HiTrophy,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ActivityItem {
  id: string
  type: 'tasting_completed' | 'achievement_earned' | 'event_created' | 'review_shared'
  userId: string
  userName: string
  userAvatar?: string
  content: string
  metadata?: {
    tastingName?: string
    achievementIcon?: string
    eventId?: string
    rating?: number
  }
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  visibility: 'public' | 'friends' | 'private'
}

interface SocialFeedProps {
  filter?: 'all' | 'friends' | 'following'
  userId?: string
}

export function SocialFeed({ filter = 'all', userId }: SocialFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  useRealtimeContext()
  const { toast } = useToast()

  useEffect(() => {
    loadActivities()
    subscribeToUpdates()
  }, [filter, page])

  const loadActivities = async () => {
    try {
      // Load real activities from Supabase
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          *,
          user:profiles!activities_user_id_fkey(id, name, avatar_url)
        `
        )
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading activities:', error)
        // Fallback to mock data if database query fails
      }

      // Transform Supabase data to component format
      const realActivities: ActivityItem[] =
        data?.map((activity: any) => ({
          id: activity.id,
          type: activity.type as ActivityItem['type'],
          userId: activity.user_id,
          userName: activity.user?.name || 'Usuario',
          userAvatar: activity.user?.avatar_url || '/avatars/default.jpg',
          content: activity.content,
          metadata: activity.metadata || {},
          timestamp: activity.created_at,
          likes: activity.likes_count || 0,
          comments: activity.comments_count || 0,
          isLiked: false, // TODO: Check if current user liked this activity
          visibility: activity.visibility,
        })) || []

      // If we have real data, use it; otherwise use mock data
      const mockActivities: ActivityItem[] =
        realActivities.length > 0
          ? realActivities
          : [
              {
                id: '1',
                type: 'tasting_completed',
                userId: 'user1',
                userName: 'María González',
                userAvatar: '/avatars/default.jpg',
                content: 'Completó una cata de Mezcal Espadín y detectó notas ahumadas intensas',
                metadata: {
                  tastingName: 'Mezcal Tradicional Oaxaqueño',
                  rating: 4.5,
                },
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 12,
                comments: 3,
                isLiked: false,
                visibility: 'public',
              },
              {
                id: '2',
                type: 'achievement_earned',
                userId: 'user2',
                userName: 'Carlos Mendoza',
                userAvatar: '/avatars/carlos.jpg',
                content: '¡Obtuvo la certificación de Tequila Master!',
                metadata: {
                  achievementIcon: '🏆',
                },
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                likes: 25,
                comments: 8,
                isLiked: true,
                visibility: 'public',
              },
              {
                id: '3',
                type: 'event_created',
                userId: 'user3',
                userName: 'Ana Ruiz',
                userAvatar: '/avatars/ana.jpg',
                content: 'Organizó una cata ciega de Tequilas Reposados para mañana',
                metadata: {
                  eventId: 'event123',
                  tastingName: 'Cata Ciega: Reposados Premium',
                },
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                likes: 8,
                comments: 5,
                isLiked: false,
                visibility: 'friends',
              },
            ]

      setActivities(prev => (page === 1 ? mockActivities : [...prev, ...mockActivities]))
    } catch (error) {
      console.error('Error loading activities:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las actividades',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    // Subscribe to real-time activity updates
    // Implementation with Supabase realtime
  }

  const handleLike = async (activityId: string) => {
    try {
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? {
                ...activity,
                isLiked: !activity.isLiked,
                likes: activity.isLiked ? activity.likes - 1 : activity.likes + 1,
              }
            : activity
        )
      )

      // API call to update like status
      // await updateActivityLike(activityId, !isLiked)
    } catch (error) {
      console.error('Error updating like:', error)
    }
  }

  const handleShare = async (activity: ActivityItem) => {
    const shareText = `${activity.userName} ${activity.content} en FlavorWheel México 🌵`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FlavorWheel México',
          text: shareText,
          url: `${window.location.origin}/activity/${activity.id}`,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText)
      toast({
        title: '¡Copiado!',
        description: 'Actividad copiada al portapapeles',
      })
    }
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'tasting_completed':
        return '🥃'
      case 'achievement_earned':
        return '🏆'
      case 'event_created':
        return '📅'
      case 'review_shared':
        return '⭐'
      default:
        return '🌵'
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'tasting_completed':
        return 'bg-blue-50 border-blue-200'
      case 'achievement_earned':
        return 'bg-yellow-50 border-yellow-200'
      case 'event_created':
        return 'bg-green-50 border-green-200'
      case 'review_shared':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-card-text-secondary"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-card-text-secondary"></div>
                  <div className="h-3 w-1/2 rounded bg-card-text-secondary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <Card
          key={activity.id}
          className={`${getActivityColor(activity.type)} transition-all hover:shadow-md`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="min-w-(0) flex-1">
                {/* Activity Header */}
                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <span className="text-sm font-medium">{activity.userName}</span>
                  <span className="text-xs text-card-text-tertiary">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>

                {/* Activity Content */}
                <p className="mb-3 text-sm text-card-text-secondary">{activity.content}</p>

                {/* Activity Metadata */}
                {activity.metadata && (
                  <div className="mb-3">
                    {activity.metadata.tastingName && (
                      <Badge variant="outline" className="text-xs">
                        {activity.metadata.tastingName}
                      </Badge>
                    )}
                    {activity.metadata.rating && (
                      <div className="mt-1 flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs">{activity.metadata.rating}/5</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(activity.id)}
                    className={`flex items-center space-x-1 ${
                      activity.isLiked ? 'text-error' : 'text-card-text-tertiary'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${activity.isLiked ? 'fill-current' : ''}`} />
                    <span>{activity.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 text-card-text-tertiary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{activity.comments}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(activity)}
                    className="flex items-center space-x-1 text-gray-500"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartir</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={() => setPage(prev => prev + 1)} disabled={loading}>
          {loading ? 'Cargando...' : 'Ver más actividades'}
        </Button>
      </div>
    </div>
  )
}
