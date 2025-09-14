'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Activity, MessageCircle, Heart, Star, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ContextualHelp, FloatingHelp } from '@/components/ui/contextual-help'
import { SocialFeed } from '@/components/social-feed'
import { FriendSystem } from '@/components/friend-system'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useStatistics } from '@/hooks/use-statistics'
import { UnifiedAppShell } from '@/components/app-shell'
import Link from 'next/link'

export default function SocialPage() {
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { user } = useSupabase()

  const [activeTab, setActiveTab] = useState('feed')

  // Get dynamic statistics
  const { statistics, loading: statsLoading } = useStatistics({
    refreshInterval: 300000, // Refresh every 5 minutes
    enableRealtime: true
  })

  if (!user) {
    return (
      <UnifiedAppShell variant="dashboard" activeNavItemOverride="social">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-card">
              <h2 className="text-xl font-semibold mb-4">Sign in required</h2>
              <p className="text-card-text-secondary mb-6">
                Please sign in to access the social community features.
              </p>
              <Link href={`/${locale}/login`}>
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </UnifiedAppShell>
    )
  }

  return (
    <UnifiedAppShell variant="dashboard" activeNavItemOverride="social">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Social Community</h1>
                <p className="text-card-text-secondary mt-1">
                  Connect with fellow tasting enthusiasts and share your experiences
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-accent mb-2">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-12 rounded mx-auto"></div>
                    ) : (
                      statistics?.activeUsers || 0
                    )}
                  </div>
                  <div className="text-xs text-card-text-secondary">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-primary mb-2">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-16 rounded mx-auto"></div>
                    ) : (
                      statistics?.totalReviews || 0
                    )}
                  </div>
                  <div className="text-xs text-card-text-secondary">Reviews Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient-warm mb-2">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-12 rounded mx-auto"></div>
                    ) : (
                      statistics?.totalTastings || 0
                    )}
                  </div>
                  <div className="text-xs text-card-text-secondary">Tastings Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Contextual Help */}
          <div className="mb-6">
            <ContextualHelp page="social" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Activity Feed</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Friends</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Discover</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="space-y-6">
              <SocialFeed />
            </TabsContent>

            <TabsContent value="friends" className="space-y-6">
              <FriendSystem />
            </TabsContent>

            <TabsContent value="discover" className="space-y-6">
              {/* Discover Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-card">
                {/* Featured Tastings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>Featured Tastings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                                      <div className="space-y-3">
                    {statsLoading ? (
                      <>
                        <div className="animate-pulse p-3 bg-gray-50 rounded-lg">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="animate-pulse p-3 bg-gray-50 rounded-lg">
                          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                        </div>
                      </>
                    ) : statistics?.trendingSpirits?.length ? (
                      statistics.trendingSpirits.slice(0, 2).map((spirit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{spirit.name}</p>
                            <p className="text-sm text-card-text-secondary">
                              {spirit.reviewCount} reviews • ⭐ {spirit.avgRating.toFixed(1)}
                            </p>
                          </div>
                          <Badge variant={index === 0 ? "default" : "outline"}>
                            {index === 0 ? "Trending" : "Popular"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-card-text-secondary">
                        <p className="text-sm">No trending spirits yet</p>
                        <p className="text-xs">Share reviews to see trends!</p>
                      </div>
                    )}
                  </div>
                  </CardContent>
                </Card>

                {/* Top Contributors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-purple-500" />
                      <span>Top Contributors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statsLoading ? (
                        <>
                          <div className="animate-pulse flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="animate-pulse flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                          </div>
                        </>
                      ) : statistics?.topContributors?.length ? (
                        statistics.topContributors.slice(0, 2).map((contributor, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              <span className={`text-xs font-bold ${
                                index === 0 ? 'text-purple-600' : 'text-blue-600'
                              }`}>
                                {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{contributor.name}</p>
                              <p className="text-sm text-card-text-secondary">
                                {contributor.reviewsCount} reviews
                              </p>
                            </div>
                            <Badge variant="secondary">
                              ⭐ {contributor.avgRating.toFixed(1)}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-card-text-secondary">
                          <p className="text-sm">No contributors yet</p>
                          <p className="text-xs">Be the first to share reviews!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      <span>Trending Topics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#MezcalMonday</span>
                        <span className="text-xs text-card-text-secondary">156 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#TequilaTasting</span>
                        <span className="text-xs text-card-text-secondary">89 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#BlindTasting</span>
                        <span className="text-xs text-card-text-secondary">67 posts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#FlavorWheels</span>
                        <span className="text-xs text-card-text-secondary">43 posts</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Community Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gradient-accent">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded mx-auto"></div>
                        ) : (
                          statistics?.recentActivity?.find(a => a.type === 'review')?.count || 0
                        )}
                      </div>
                      <div className="text-sm text-card-text-secondary">New Reviews Today</div>
                      {statistics?.recentActivity?.find(a => a.type === 'review')?.change && (
                        <div className={`text-xs flex items-center justify-center mt-1 ${
                          statistics.recentActivity.find(a => a.type === 'review')!.change > 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {statistics.recentActivity.find(a => a.type === 'review')!.change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(statistics.recentActivity.find(a => a.type === 'review')!.change)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-primary">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded mx-auto"></div>
                        ) : (
                          statistics?.recentActivity?.find(a => a.type === 'tasting')?.count || 0
                        )}
                      </div>
                      <div className="text-sm text-card-text-secondary">New Tastings Today</div>
                      {statistics?.recentActivity?.find(a => a.type === 'tasting')?.change && (
                        <div className={`text-xs flex items-center justify-center mt-1 ${
                          statistics.recentActivity.find(a => a.type === 'tasting')!.change > 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {statistics.recentActivity.find(a => a.type === 'tasting')!.change > 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(statistics.recentActivity.find(a => a.type === 'tasting')!.change)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-warm">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-8 rounded mx-auto"></div>
                        ) : (
                          statistics?.totalPhotos || 0
                        )}
                      </div>
                      <div className="text-sm text-card-text-secondary">Photos Shared</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gradient-accent">
                        {statsLoading ? (
                          <div className="animate-pulse bg-gray-300 h-8 w-12 rounded mx-auto"></div>
                        ) : (
                          statistics?.communityEngagement || 0
                        )}
                      </div>
                      <div className="text-sm text-card-text-secondary">Community Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating Help Button */}
        <FloatingHelp page="social" />
      </div>
    </UnifiedAppShell>
  )
}
