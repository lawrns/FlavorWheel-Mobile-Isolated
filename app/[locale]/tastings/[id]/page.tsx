'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Calendar, MapPin, Share2, Edit, Star, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import Link from 'next/link'

interface TastingSession {
  id: string
  name: string
  description: string
  type: string
  status: 'upcoming' | 'active' | 'completed'
  start_date: string
  created_by: string
  organizer: {
    name: string
    avatar_url?: string
  }
  participants: Array<{
    id: string
    user_id: string
    status: 'joined' | 'completed'
    profile: {
      name: string
      avatar_url?: string
    }
  }>
  tasting_items: Array<{
    id: string
    name: string
    type: string
    completed_count: number
  }>
  location?: string
  max_participants?: number
}

export default function TastingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const tastingId = (params.id as string)
  const { user, supabase } = useSupabase()
  const { toast } = useToast()

  const [tasting, setTasting] = useState<TastingSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    if (tastingId) {
      loadTasting()
    }
  }, [tastingId])

  useEffect(() => {
    if (user && tasting?.participants) {
      const participant = tasting.participants.find(p => p.user_id === user.id)
      setIsParticipant(!!participant)
    }
  }, [user, tasting])

  const loadTasting = async () => {
    try {
      // Mock tasting data
      const mockTasting: TastingSession = {
        id: tastingId,
        name: 'México Spirits Discovery Session',
        description: 'Join us for an exploration of authentic Mexican spirits. We\'ll taste through a selection of premium mezcals and tequilas, learning about their unique characteristics and production methods.',
        type: 'educational',
        status: 'upcoming',
        start_date: '2024-02-15T18:00:00Z',
        created_by: 'organizer1',
        organizer: {
          name: 'María González',
          avatar_url: undefined
        },
        participants: [
          {
            id: '1',
            user_id: 'user1',
            status: 'joined',
            profile: { name: 'Carlos Rodríguez', avatar_url: undefined }
          },
          {
            id: '2',
            user_id: 'user2',
            status: 'joined',
            profile: { name: 'Ana López', avatar_url: undefined }
          },
          {
            id: '3',
            user_id: 'user3',
            status: 'completed',
            profile: { name: 'José Martínez', avatar_url: undefined }
          }
        ],
        tasting_items: [
          { id: '1', name: 'Espadín Mezcal', type: 'mezcal', completed_count: 8 },
          { id: '2', name: 'Tobalá Mezcal', type: 'mezcal', completed_count: 6 },
          { id: '3', name: 'Blanco Tequila', type: 'tequila', completed_count: 7 },
          { id: '4', name: 'Reposado Tequila', type: 'tequila', completed_count: 5 }
        ],
        location: 'Casa de los Amigos, Condesa, Mexico City',
        max_participants: 12
      }

      setTasting(mockTasting)
    } catch (error) {
      console.error('Error loading tasting:', error)
      toast({
        title: 'Error',
        description: 'Failed to load tasting details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTasting = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join tastings',
        variant: 'destructive',
      })
      router.push(`/${locale}/login`)
      return
    }

    if (isParticipant) return

    setJoining(true)
    try {
      // Here you would typically add the user to the tasting participants
      // For now, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsParticipant(true)
      setTasting(prev => prev ? {
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: Date.now().toString(),
            user_id: user.id,
            status: 'joined',
            profile: {
              name: user.user_metadata?.name || 'New Participant',
              avatar_url: user.user_metadata?.avatar_url
            }
          }
        ]
      } : null)

      toast({
        title: 'Joined tasting!',
        description: 'You have successfully joined this tasting session.',
      })
    } catch (error) {
      console.error('Error joining tasting:', error)
      toast({
        title: 'Error',
        description: 'Failed to join tasting',
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  const handleShare = async () => {
    if (!tasting) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: tasting.name,
          text: tasting.description,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: 'Link copied!',
          description: 'The tasting link has been copied to your clipboard.',
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="tastings">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!tasting) {
    return (
      <DashboardAppShell activeNavItem="tastings">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-card">
              <h2 className="text-xl font-semibold mb-4">Tasting not found</h2>
              <p className="text-card-text-secondary mb-6">
                The tasting session you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link href={`/${locale}/tastings`}>
                <Button>Back to Tastings</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardAppShell>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completionRate = tasting.tasting_items.length > 0
    ? Math.round((tasting.tasting_items.reduce((sum, item) => sum + item.completed_count, 0) / tasting.tasting_items.length) / tasting.participants.length * 100)
    : 0

  return (
    <DashboardAppShell activeNavItem="tastings">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/tastings`}
                  className="text-card-text-secondary hover:text-foreground"
                >
                  ← Back to Tastings
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{tasting.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(tasting.status)}>
                      {tasting.status.charAt(0).toUpperCase() + tasting.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{tasting.type}</Badge>
                    <div className="flex items-center text-sm text-card-text-secondary">
                      <Users className="h-4 w-4 mr-1" />
                      {tasting.participants.length}/{tasting.max_participants || '∞'} participants
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {!isParticipant && tasting.status === 'upcoming' && (
                  <Button
                    onClick={handleJoinTasting}
                    disabled={joining}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {joining ? 'Joining...' : 'Join Tasting'}
                  </Button>
                )}
                {isParticipant && (
                  <Badge className="bg-green-100 text-green-800">Participating</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-card">
            {/* Tasting Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Tasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-text-secondary mb-4">{tasting.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-card-text-secondary" />
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-card-text-secondary">
                          {new Date(tasting.start_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-card-text-secondary" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-card-text-secondary">{tasting.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-card-text-secondary" />
                      <div>
                        <p className="text-sm font-medium">Organizer</p>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={tasting.organizer.avatar_url} />
                            <AvatarFallback>
                              {tasting.organizer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-card-text-secondary">{tasting.organizer.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-card-text-secondary" />
                      <div>
                        <p className="text-sm font-medium">Completion Rate</p>
                        <p className="text-sm text-card-text-secondary">{completionRate}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasting Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasting Lineup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasting.tasting_items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-amber-800">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-card-text-secondary">
                            {item.completed_count}/{tasting.participants.length} completed
                          </p>
                          <Progress
                            value={(item.completed_count / tasting.participants.length) * 100}
                            className="w-24 mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participants ({tasting.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasting.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.profile.avatar_url} />
                          <AvatarFallback>
                            {participant.profile.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{participant.profile.name}</p>
                          <Badge
                            variant={participant.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {participant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              {isParticipant && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href={`/${locale}/tastings/${tastingId}/input`}>
                      <Button className="w-full" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Enter Tasting Notes
                      </Button>
                    </Link>
                    <Link href={`/${locale}/tastings/${tastingId}/completion`}>
                      <Button className="w-full" variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* Tasting Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Tasting Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Completion</span>
                        <span>{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} />
                    </div>
                    <div className="text-sm text-card-text-secondary">
                      <p>{tasting.tasting_items.filter(item => item.completed_count > 0).length} of {tasting.tasting_items.length} items tasted</p>
                      <p>{tasting.participants.filter(p => p.status === 'completed').length} of {tasting.participants.length} participants finished</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  )
}

