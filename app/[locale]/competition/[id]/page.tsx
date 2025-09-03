'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, MapPin, Clock, Star, Award, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import Link from 'next/link'

interface Competition {
  id: string
  name: string
  description: string
  type: string
  status: 'upcoming' | 'active' | 'completed'
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  organizer: {
    name: string
    avatar_url?: string
  }
  location?: string
  prize?: string
  rules?: string
  tasting_items: Array<{
    id: string
    name: string
    type: string
  }>
}

interface Participant {
  id: string
  user_id: string
  status: 'joined' | 'completed'
  score?: number
  ranking?: number
  profile: {
    name: string
    avatar_url?: string
  }
}

export default function CompetitionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params.locale as string) || 'en'
  const competitionId = (params.id as string)
  const { user, client: supabase } = useSupabase()
  const { toast } = useToast()

  const [competition, setCompetition] = useState<Competition | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)

  useEffect(() => {
    if (competitionId) {
      loadCompetition()
      loadParticipants()
    }
  }, [competitionId])

  useEffect(() => {
    if (user && participants.length > 0) {
      const participant = participants.find(p => p.user_id === user.id)
      setIsParticipant(!!participant)
    }
  }, [user, participants])

  const loadCompetition = async () => {
    try {
      // This would typically fetch from a competitions table
      // For now, we'll create a mock competition
      const mockCompetition: Competition = {
        id: competitionId,
        name: 'México Spirits Championship 2024',
        description: 'The ultimate test of tequila and mezcal expertise. Judges will evaluate blind samples across multiple categories.',
        type: 'professional',
        status: 'upcoming',
        start_date: '2024-03-15T10:00:00Z',
        end_date: '2024-03-16T18:00:00Z',
        max_participants: 20,
        current_participants: 12,
        organizer: {
          name: 'Consejo Regulador del Tequila',
          avatar_url: undefined
        },
        location: 'Guadalajara, Jalisco',
        prize: '$5,000 + Trophy',
        rules: 'Blind tasting evaluation. Professional judging criteria. All decisions final.',
        tasting_items: [
          { id: '1', name: 'Premium Blanco Tequila', type: 'tequila' },
          { id: '2', name: 'Aged Reposado Mezcal', type: 'mezcal' },
          { id: '3', name: 'Single Village Sotol', type: 'sotol' }
        ]
      }

      setCompetition(mockCompetition)
    } catch (error) {
      console.error('Error loading competition:', error)
      toast({
        title: 'Error',
        description: 'Failed to load competition details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadParticipants = async () => {
    try {
      // Mock participants data
      const mockParticipants: Participant[] = [
        {
          id: '1',
          user_id: 'user1',
          status: 'joined',
          score: 95,
          ranking: 1,
          profile: { name: 'María González', avatar_url: undefined }
        },
        {
          id: '2',
          user_id: 'user2',
          status: 'joined',
          score: 92,
          ranking: 2,
          profile: { name: 'Carlos Rodríguez', avatar_url: undefined }
        },
        {
          id: '3',
          user_id: 'user3',
          status: 'joined',
          score: 89,
          ranking: 3,
          profile: { name: 'Ana López', avatar_url: undefined }
        }
      ]

      setParticipants(mockParticipants)
    } catch (error) {
      console.error('Error loading participants:', error)
    }
  }

  const handleJoinCompetition = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join competitions',
        variant: 'destructive',
      })
      router.push(`/${locale}/login`)
      return
    }

    if (isParticipant) return

    setJoining(true)
    try {
      // Here you would typically add the user to the competition participants
      // For now, we'll simulate this
      await new Promise(resolve => setTimeout(resolve, 1000))

      setIsParticipant(true)
      setCompetition(prev => prev ? {
        ...prev,
        current_participants: prev.current_participants + 1
      } : null)

      toast({
        title: 'Joined competition!',
        description: 'You have successfully joined this competition.',
      })
    } catch (error) {
      console.error('Error joining competition:', error)
      toast({
        title: 'Error',
        description: 'Failed to join competition',
        variant: 'destructive',
      })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="competition">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </DashboardAppShell>
    )
  }

  if (!competition) {
    return (
      <DashboardAppShell activeNavItem="competition">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Competition not found</h2>
              <p className="text-muted-foreground mb-6">
                The competition you're looking for doesn't exist or has been removed.
              </p>
              <Link href={`/${locale}/competition`}>
                <Button>Back to Competitions</Button>
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

  return (
    <DashboardAppShell activeNavItem="competition">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/competition`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to Competitions
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{competition.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">{competition.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-lg font-semibold">
                    {competition.current_participants}/{competition.max_participants}
                  </p>
                </div>
                {!isParticipant && competition.status === 'upcoming' && (
                  <Button
                    onClick={handleJoinCompetition}
                    disabled={joining || competition.current_participants >= competition.max_participants}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {joining ? 'Joining...' : 'Join Competition'}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Competition Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Competition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{competition.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(competition.start_date).toLocaleDateString('en-US', {
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
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{competition.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Prize</p>
                        <p className="text-sm text-muted-foreground">{competition.prize}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Organizer</p>
                        <p className="text-sm text-muted-foreground">{competition.organizer.name}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tasting Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Competition Samples</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {competition.tasting_items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-amber-800">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <Badge variant="secondary" className="text-xs">{item.type}</Badge>
                          </div>
                        </div>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rules */}
              {competition.rules && (
                <Card>
                  <CardHeader>
                    <CardTitle>Competition Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{competition.rules}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants
                      .filter(p => p.score)
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((participant, index) => (
                        <div key={participant.id} className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-amber-800">
                              {index + 1}
                            </span>
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.profile.avatar_url} />
                            <AvatarFallback>
                              {participant.profile.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{participant.profile.name}</p>
                            <p className="text-xs text-muted-foreground">{participant.score} points</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participants ({competition.current_participants})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participants.map((participant) => (
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
            </div>
          </div>
        </div>
      </div>
    </DashboardAppShell>
  )
}

