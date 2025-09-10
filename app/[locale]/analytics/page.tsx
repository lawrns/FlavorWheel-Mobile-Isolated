'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, Star, Calendar, Target, Award, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useToast } from '@/hooks/use-toast'
import { UnifiedAppShell } from '@/components/app-shell'

interface AnalyticsData {
  totalTastings: number
  totalReviews: number
  averageRating: number
  favoriteBeverage: string
  tastingFrequency: number
  streakDays: number
  achievements: number
  regionsExplored: number
  flavorPreferences: Array<{ name: string; count: number }>
  monthlyProgress: Array<{ month: string; tastings: number; reviews: number }>
  tastingTypes: Array<{ type: string; count: number }>
}

export default function AnalyticsPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { user, client: supabase } = useSupabase()
  const { toast } = useToast()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, timeRange])

  const loadAnalytics = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user tastings
      if (!supabase) {
        throw new Error('Database connection not available')
      }

      const { data: tastings, error: tastingsError } = await supabase
        .from('tastings')
        .select(`
          *,
          tasting_items (
            *,
            mexican_beverages (
              type,
              region
            )
          ),
          user_reviews (*)
        `)
        .eq('created_by', user.id)
        .order('date', { ascending: false })

      if (tastingsError) throw tastingsError

      // Get user profile for preferences
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Calculate analytics
      const totalTastings = tastings?.length || 0
      const allReviews = tastings?.flatMap(t => t.user_reviews) || []
      const totalReviews = allReviews.length
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum, review) => sum + (review.overall_rating || 0), 0) / totalReviews
        : 0

      // Favorite beverage type
      const beverageCounts = tastings?.reduce((acc, tasting) => {
        tasting.tasting_items?.forEach((item: { mexican_beverages?: { type?: string } }) => {
          const type = item.mexican_beverages?.type || 'unknown'
          acc[type] = (acc[type] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>) || {}

      const favoriteBeverage = (Object.entries(beverageCounts) as [string, number][])
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

      // Regions explored
      const regionsExplored = new Set(
        tastings?.flatMap(tasting =>
          tasting.tasting_items?.map((item: { mexican_beverages?: { region?: string } }) => item.mexican_beverages?.region).filter(Boolean)
        )
      ).size

      // Flavor preferences (mock data for now)
      const flavorPreferences = [
        { name: 'Smoky', count: 12 },
        { name: 'Citrus', count: 8 },
        { name: 'Earthy', count: 6 },
        { name: 'Sweet', count: 4 },
        { name: 'Spicy', count: 3 }
      ]

      // Monthly progress (last 6 months)
      const monthlyProgress = generateMonthlyProgress(tastings || [])

      // Tasting types
      const tastingTypes = tastings?.reduce((acc, tasting) => {
        const type = tasting.type || 'general'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      setAnalytics({
        totalTastings,
        totalReviews,
        averageRating,
        favoriteBeverage,
        tastingFrequency: Math.round(totalTastings / 30), // per month
        streakDays: calculateStreak(tastings || []),
        achievements: calculateAchievements(tastings || [], allReviews),
        regionsExplored,
        flavorPreferences,
        monthlyProgress,
        tastingTypes: (Object.entries(tastingTypes) as [string, number][]).map(([type, count]) => ({ type, count }))
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyProgress = (tastings: Array<{ created_at: string; user_reviews?: any[] }>) => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })

      const monthTastings = tastings.filter(tasting => {
        const tastingDate = new Date(tasting.created_at)
        return tastingDate.getMonth() === date.getMonth() &&
               tastingDate.getFullYear() === date.getFullYear()
      })

      const reviews = monthTastings.flatMap(t => t.user_reviews || [])
      months.push({
        month: monthName,
        tastings: monthTastings.length,
        reviews: reviews.length
      })
    }

    return months
  }

  const calculateStreak = (tastings: Array<{ date: string }>) => {
    if (!tastings.length) return 0

    const sortedTastings = tastings.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const tasting of sortedTastings) {
      const tastingDate = new Date(tasting.date)
      tastingDate.setHours(0, 0, 0, 0)

      if (tastingDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (tastingDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    return streak
  }

  const calculateAchievements = (tastings: Array<any>, reviews: Array<any>) => {
    let achievements = 0

    // First tasting
    if (tastings.length > 0) achievements++

    // 5 tastings
    if (tastings.length >= 5) achievements++

    // 10 tastings
    if (tastings.length >= 10) achievements++

    // First review
    if (reviews.length > 0) achievements++

    // 5 reviews
    if (reviews.length >= 5) achievements++

    // 10 reviews
    if (reviews.length >= 10) achievements++

    // Average rating > 4
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length
      if (avgRating >= 4) achievements++
    }

    return achievements
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sign in required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="analytics">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </DashboardAppShell>
    )
  }

  return (
    <UnifiedAppShell variant="dashboard" activeNavItemOverride="analytics">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Track your tasting journey and discover insights about your preferences
                </p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Total Tastings</p>
                          <p className="text-2xl font-bold">{analytics.totalTastings}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Star className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                          <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Regions Explored</p>
                          <p className="text-2xl font-bold">{analytics.regionsExplored}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Award className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-muted-foreground">Achievements</p>
                          <p className="text-2xl font-bold">{analytics.achievements}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="flavors">Flavors</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Monthly Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analytics.monthlyProgress.map((month, index) => (
                            <div key={month.month} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{month.month}</span>
                                <span>{month.tastings} tastings, {month.reviews} reviews</span>
                              </div>
                              <Progress value={(month.tastings / Math.max(...analytics.monthlyProgress.map(m => m.tastings))) * 100} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Tasting Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Favorite Beverage</span>
                            <Badge variant="secondary">{analytics.favoriteBeverage}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Tasting Frequency</span>
                            <span className="text-sm">{analytics.tastingFrequency}/month</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Current Streak</span>
                            <span className="text-sm">{analytics.streakDays} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Total Reviews</span>
                            <span className="text-sm">{analytics.totalReviews}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="flavors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Flavor Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.flavorPreferences.map((flavor, index) => (
                          <div key={flavor.name} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{flavor.name}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={(flavor.count / Math.max(...analytics.flavorPreferences.map(f => f.count))) * 100} className="w-24" />
                              <span className="text-sm text-muted-foreground w-8">{flavor.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Tasting Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.tastingTypes.map((type, index) => (
                            <div key={type.type} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{type.type}</span>
                              <Badge variant="outline">{type.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Goals & Milestones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Next Achievement</span>
                              <span>{10 - analytics.achievements} to go</span>
                            </div>
                            <Progress value={(analytics.achievements / 10) * 100} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Monthly Goal</span>
                              <span>{Math.max(0, 8 - analytics.tastingFrequency)} tastings</span>
                            </div>
                            <Progress value={Math.min(100, (analytics.tastingFrequency / 8) * 100)} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'First Sip', description: 'Complete your first tasting', earned: analytics.totalTastings > 0 },
                      { name: 'Tasting Enthusiast', description: 'Complete 5 tastings', earned: analytics.totalTastings >= 5 },
                      { name: 'Flavor Expert', description: 'Complete 10 tastings', earned: analytics.totalTastings >= 10 },
                      { name: 'First Review', description: 'Write your first review', earned: analytics.totalReviews > 0 },
                      { name: 'Review Master', description: 'Write 5 reviews', earned: analytics.totalReviews >= 5 },
                      { name: 'Critic', description: 'Write 10 reviews', earned: analytics.totalReviews >= 10 },
                      { name: 'Quality Seeker', description: 'Average rating above 4 stars', earned: analytics.averageRating >= 4 },
                      { name: 'Explorer', description: 'Try beverages from 3 regions', earned: analytics.regionsExplored >= 3 },
                    ].map((achievement, index) => (
                      <motion.div
                        key={achievement.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`transition-all ${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Award className={`h-5 w-5 ${achievement.earned ? 'text-green-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <h4 className={`font-semibold text-sm ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                                  {achievement.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </UnifiedAppShell>
  )
}

