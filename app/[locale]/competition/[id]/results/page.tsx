'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Medal, Award, Crown, Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { DashboardAppShell } from '@/components/app-shell'
import Link from 'next/link'
import { competitionPreloadingService } from '@/services/competition-preloading-service'

interface CompetitionResult {
  id: string
  name: string
  description: string
  type: string
  status: 'completed'
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
  tasting_items: Array<{
    id: string
    name: string
    type: string
  }>
}

interface ParticipantResult {
  id: string
  user_id: string
  status: 'completed'
  score: number
  ranking: number
  profile: {
    name: string
    avatar_url?: string
  }
  item_scores: Array<{
    item_id: string
    item_name: string
    score: number
    comments?: string
  }>
  total_score: number
  average_score: number
  consistency_score: number
}

export default function CompetitionResultsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const competitionId = (params.id as string)
  const { client: supabase } = useSupabase()
  const { toast } = useToast()

  const [competition, setCompetition] = useState<CompetitionResult | null>(null)
  const [participants, setParticipants] = useState<ParticipantResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (competitionId) {
      loadCompetitionResults()
    }
  }, [competitionId])

  const loadCompetitionResults = async () => {
    try {
      // Try to get preloaded competition data first
      const preloadedData = await competitionPreloadingService.preloadCompetition(competitionId)

      if (preloadedData) {
        // Convert preloaded data to results format
        const competitionData: CompetitionResult = {
          id: preloadedData.id,
          name: preloadedData.name,
          description: `Competition results with ${preloadedData.participants.length} participants evaluating ${preloadedData.items.length} items.`,
          type: 'competition',
          status: 'completed',
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          max_participants: preloadedData.settings.max_participants,
          current_participants: preloadedData.participants.length,
          organizer: {
            name: 'Competition Organizer',
            avatar_url: undefined
          },
          location: 'Online',
          prize: 'Recognition',
          tasting_items: preloadedData.items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type
          }))
        }

        // Convert participants to results format with proper ranking
        const participantsData: ParticipantResult[] = preloadedData.participants
          .filter(p => p.status === 'completed')
          .map((participant, index) => ({
            id: participant.id,
            user_id: participant.user_id,
            status: 'completed',
            score: participant.scores?.total || 0,
            ranking: index + 1,
            profile: participant.profile,
            total_score: participant.scores?.total || 0,
            average_score: participant.scores?.average || 0,
            consistency_score: participant.scores?.consistency || 0,
            item_scores: Object.entries(participant.scores?.item_scores || {}).map(([itemId, score]) => ({
              item_id: itemId,
              item_name: preloadedData.items.find(item => item.id === itemId)?.name || 'Unknown Item',
              score: score,
              comments: ''
            }))
          }))

        setCompetition(competitionData)
        setParticipants(participantsData)
        console.log('Loaded competition results using preloaded data:', participantsData.length, 'participants')
        return
      }

      // Fallback to mock competition results data
      const mockCompetition: CompetitionResult = {
        id: competitionId,
        name: 'México Spirits Championship 2024',
        description: 'The ultimate test of tequila and mezcal expertise. Judges will evaluate blind samples across multiple categories.',
        type: 'professional',
        status: 'completed',
        start_date: '2024-03-15T10:00:00Z',
        end_date: '2024-03-16T18:00:00Z',
        max_participants: 20,
        current_participants: 15,
        organizer: {
          name: 'Consejo Regulador del Tequila',
          avatar_url: undefined
        },
        location: 'Guadalajara, Jalisco',
        prize: '$5,000 + Trophy',
        tasting_items: [
          { id: '1', name: 'Premium Blanco Tequila', type: 'tequila' },
          { id: '2', name: 'Aged Reposado Mezcal', type: 'mezcal' },
          { id: '3', name: 'Single Village Sotol', type: 'sotol' }
        ]
      }

      const mockParticipants: ParticipantResult[] = [
        {
          id: '1',
          user_id: 'user1',
          status: 'completed',
          score: 95,
          ranking: 1,
          profile: { name: 'María González', avatar_url: undefined },
          total_score: 285,
          average_score: 95,
          consistency_score: 92,
          item_scores: [
            { item_id: '1', item_name: 'Premium Blanco Tequila', score: 96, comments: 'Excellent clarity and minerality' },
            { item_id: '2', item_name: 'Aged Reposado Mezcal', score: 94, comments: 'Perfect balance of smoke and fruit' },
            { item_id: '3', item_name: 'Single Village Sotol', score: 95, comments: 'Outstanding complexity and terroir' }
          ]
        },
        {
          id: '2',
          user_id: 'user2',
          status: 'completed',
          score: 92,
          ranking: 2,
          profile: { name: 'Carlos Rodríguez', avatar_url: undefined },
          total_score: 276,
          average_score: 92,
          consistency_score: 88,
          item_scores: [
            { item_id: '1', item_name: 'Premium Blanco Tequila', score: 93, comments: 'Very clean with good acidity' },
            { item_id: '2', item_name: 'Aged Reposado Mezcal', score: 91, comments: 'Good smokiness, slightly less fruit' },
            { item_id: '3', item_name: 'Single Village Sotol', score: 92, comments: 'Excellent herbal notes' }
          ]
        },
        {
          id: '3',
          user_id: 'user3',
          status: 'completed',
          score: 89,
          ranking: 3,
          profile: { name: 'Ana López', avatar_url: undefined },
          total_score: 267,
          average_score: 89,
          consistency_score: 85,
          item_scores: [
            { item_id: '1', item_name: 'Premium Blanco Tequila', score: 90, comments: 'Good but not exceptional' },
            { item_id: '2', item_name: 'Aged Reposado Mezcal', score: 88, comments: 'Solid performance' },
            { item_id: '3', item_name: 'Single Village Sotol', score: 89, comments: 'Good overall balance' }
          ]
        },
        {
          id: '4',
          user_id: 'user4',
          status: 'completed',
          score: 87,
          ranking: 4,
          profile: { name: 'José Martínez', avatar_url: undefined },
          total_score: 261,
          average_score: 87,
          consistency_score: 82,
          item_scores: [
            { item_id: '1', item_name: 'Premium Blanco Tequila', score: 88, comments: 'Decent but average' },
            { item_id: '2', item_name: 'Aged Reposado Mezcal', score: 86, comments: 'Good smokiness' },
            { item_id: '3', item_name: 'Single Village Sotol', score: 87, comments: 'Solid performance' }
          ]
        },
        {
          id: '5',
          user_id: 'user5',
          status: 'completed',
          score: 85,
          ranking: 5,
          profile: { name: 'Elena Sánchez', avatar_url: undefined },
          total_score: 255,
          average_score: 85,
          consistency_score: 80,
          item_scores: [
            { item_id: '1', item_name: 'Premium Blanco Tequila', score: 86, comments: 'Good but not outstanding' },
            { item_id: '2', item_name: 'Aged Reposado Mezcal', score: 84, comments: 'Average performance' },
            { item_id: '3', item_name: 'Single Village Sotol', score: 85, comments: 'Consistent scoring' }
          ]
        }
      ]

      setCompetition(mockCompetition)
      setParticipants(mockParticipants)
    } catch (error) {
      console.error('Error loading competition results:', error)
      toast({
        title: 'Error',
        description: 'Failed to load competition results',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Award className="h-6 w-6 text-amber-600" />
      default: return <Trophy className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600'
      default: return 'bg-muted'
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
                The competition results you&apos;re looking for don&apos;t exist.
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

  return (
    <DashboardAppShell activeNavItem="competition">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/${locale}/competition/${competitionId}`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to Competition
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Competition Results</h1>
                  <p className="text-muted-foreground">{competition.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-100 text-green-800">Completed</Badge>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
            </TabsList>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top 3 Podium */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                        Final Rankings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {participants.map((participant, index) => (
                          <div key={participant.id} className="flex items-center space-x-4 p-4 rounded-lg border hover:shadow-sm transition-shadow">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankingColor(participant.ranking)}`}>
                              {participant.ranking}
                            </div>
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={participant.profile.avatar_url} />
                              <AvatarFallback className="text-lg">
                                {participant.profile.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">{participant.profile.name}</h3>
                                {participant.ranking <= 3 && getRankingIcon(participant.ranking)}
                              </div>
                              <div className="flex items-center space-x-4 mt-1">
                                <Badge variant="secondary">
                                  {participant.total_score} total points
                                </Badge>
                                <Badge variant="outline">
                                  {participant.average_score}/100 average
                                </Badge>
                                <Badge variant="outline">
                                  {participant.consistency_score}% consistency
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {participant.score}
                              </div>
                              <div className="text-sm text-muted-foreground">final score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top 3 Special Display */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Podium</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {participants.slice(0, 3).map((participant, index) => (
                        <div key={participant.id} className="text-center">
                          <div className="relative mb-2">
                            {getRankingIcon(participant.ranking)}
                          </div>
                          <Avatar className="h-16 w-16 mx-auto mb-2">
                            <AvatarImage src={participant.profile.avatar_url} />
                            <AvatarFallback className="text-xl">
                              {participant.profile.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold">{participant.profile.name}</h4>
                          <p className="text-2xl font-bold text-primary">{participant.score}</p>
                          <Badge variant="secondary" className="mt-1">
                            {participant.ranking === 1 ? '🥇 Champion' :
                             participant.ranking === 2 ? '🥈 2nd Place' :
                             '🥉 3rd Place'}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Detailed Results Tab */}
            <TabsContent value="detailed" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Individual Item Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        {competition.tasting_items.map(item => (
                          <TableHead key={item.id} className="text-center">
                            {item.name}
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Rank</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            {participant.profile.name}
                          </TableCell>
                          {competition.tasting_items.map(item => {
                            const itemScore = participant.item_scores.find(score => score.item_id === item.id)
                            return (
                              <TableCell key={item.id} className="text-center">
                                <div>
                                  <div className="font-semibold">{itemScore?.score || 0}</div>
                                  <div className="text-xs text-muted-foreground max-w-24 truncate">
                                    {itemScore?.comments}
                                  </div>
                                </div>
                              </TableCell>
                            )
                          })}
                          <TableCell className="text-center font-bold">
                            {participant.total_score}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={participant.ranking <= 3 ? "default" : "secondary"}>
                              #{participant.ranking}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.max(...participants.map(p => p.score))}
                    </div>
                    <p className="text-xs text-muted-foreground">Perfect score: 100</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(participants.reduce((sum, p) => sum + p.score, 0) / participants.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all participants</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Score Range</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.max(...participants.map(p => p.score)) - Math.min(...participants.map(p => p.score))}
                    </div>
                    <p className="text-xs text-muted-foreground">Highest to lowest</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">100%</div>
                    <p className="text-xs text-muted-foreground">All participants completed</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium truncate">
                          {participant.profile.name}
                        </div>
                        <div className="flex-1">
                          <Progress value={participant.score} className="h-3" />
                        </div>
                        <div className="w-12 text-right text-sm font-medium">
                          {participant.score}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Awards Tab */}
            <TabsContent value="awards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {participants.slice(0, 3).map((participant, index) => (
                  <Card key={participant.id} className={`border-2 ${
                    index === 0 ? 'border-yellow-400 bg-yellow-50/50' :
                    index === 1 ? 'border-gray-400 bg-gray-50/50' :
                    'border-amber-400 bg-amber-50/50'
                  }`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        {getRankingIcon(participant.ranking)}
                      </div>
                      <CardTitle className="text-xl">
                        {participant.ranking === 1 ? '🥇 Champion' :
                         participant.ranking === 2 ? '🥈 2nd Place' :
                         '🥉 3rd Place'}
                      </CardTitle>
                      <p className="text-lg font-semibold">{participant.profile.name}</p>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <div className="text-3xl font-bold text-primary">
                        {participant.score}/100
                      </div>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="mr-2">
                          Total: {participant.total_score}
                        </Badge>
                        <Badge variant="outline">
                          Consistency: {participant.consistency_score}%
                        </Badge>
                      </div>
                      {participant.ranking === 1 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800">
                            🏆 Winner of {competition.prize}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Competition Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{participants.length}</div>
                      <div className="text-sm text-muted-foreground">Participants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{competition.tasting_items.length}</div>
                      <div className="text-sm text-muted-foreground">Items Evaluated</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Date(competition.end_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{competition.location}</div>
                      <div className="text-sm text-muted-foreground">Location</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardAppShell>
  )
}









