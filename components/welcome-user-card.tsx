'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { User, BarChart3, LogOut, Settings, Trophy, Users, Wine, Star, Calendar, MapPin, Edit, Share2 } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { SignInModal } from '@/components/sign-in-modal'
import { StatTile, LevelStatTile } from '@/components/ui/stat-tile'
import { HeroGradient } from '@/components/ui/hero-gradient'

// Mock user profile data - replace with actual API calls
interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  joinDate: string
  level: number
  experience: number
  nextLevelExp: number
  stats: {
    totalTastings: number
    averageRating: number
    friendsCount: number
    eventsAttended: number
  }
  achievements: Array<{
    id: string
    name: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
}

export function WelcomeUserCard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Load mock profile data for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      const mockProfile: UserProfile = {
        id: user.id || '1',
        name: user.name || 'María González',
        email: user.email || 'maria@example.com',
        avatar: user.avatar || '/avatars/default.jpg',
        bio: 'Apasionada por los mezcales tradicionales de Oaxaca',
        location: 'Ciudad de México, México',
        joinDate: '2024-03-15',
        level: 8,
        experience: 2340,
        nextLevelExp: 3000,
        stats: {
          totalTastings: 47,
          averageRating: 4.2,
          friendsCount: 23,
          eventsAttended: 12,
        },
        achievements: [
          { id: '1', name: 'Primera Cata', icon: '🥃', rarity: 'common' },
          { id: '2', name: 'Explorador de Mezcal', icon: '🌵', rarity: 'rare' },
          { id: '3', name: 'Maestro Catador', icon: '🏆', rarity: 'epic' },
        ],
      }
      setUserProfile(mockProfile)
    }
  }, [isAuthenticated, user])

  const handleStartTasting = () => {
    if (isAuthenticated) {
      toast({
        title: 'Welcome to FlavorWheel México!',
        description: 'Starting your tasting experience...',
      })
      // Redirect to main tasting dashboard
      router.push('/es')
    } else {
      // Redirect to auth if not logged in
      router.push('/auth')
    }
  }

  const handleJoinNow = () => {
    router.push('/en/auth')
  }

  const handleSignIn = () => {
    setShowSignInModal(true)
  }

  const handleOverview = () => {
    router.push('/en/analytics')
  }

  const handleSettings = () => {
    // TODO: Open settings modal
    toast({
      title: 'Settings',
      description: 'Settings panel coming soon',
    })
  }

  const handleAchievements = () => {
    router.push('/en/progress')
  }

  const handleInviteFriends = () => {
    // TODO: Open share prompt
    toast({
      title: 'Invite Friends',
      description: 'Share feature coming soon',
    })
  }

  const handleSignOut = async () => {
    try {
      await logout()
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out',
      })
      router.push('/en/landing')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Enhanced loading state with better UX
  if (isLoading) {
    return (
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-2xl bg-[var(--card-background)] p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="mb-2 h-5 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                <div className="flex gap-2">
                  <div className="h-10 flex-1 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                  <div className="h-10 w-20 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
                <div className="h-5 w-16 animate-pulse rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="mx-auto mb-[60px] max-w-[500px] px-4 sm:px-0">
          {isAuthenticated && user && userProfile ? (
            // Enhanced authenticated user panel with profile features
            <HeroGradient variant="subtle" className="rounded-lg">
              <Card className="bg-surface-card-solid bg-grain-texture border-border-subtle bg-blend-overlay">
                <CardContent className="p-4 sm:p-6">
                  {/* Profile Header */}
                  <div className="flex flex-col items-center space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={userProfile.avatar} />
                        <AvatarFallback className="text-lg">
                          {userProfile.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -bottom-1 -right-1 bg-mexican-green text-white text-xs px-2 py-0.5">
                        Nivel {userProfile.level}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        ¡Bienvenido, {userProfile.name}!
                      </h3>
                      {userProfile.bio && (
                        <p className="text-gray-600 text-sm mb-2">{userProfile.bio}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {userProfile.location && (
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {userProfile.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          Miembro desde {new Date(userProfile.joinDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })}
                        </div>
                      </div>

                      {/* Level Progress */}
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700">
                            Nivel {userProfile.level}
                          </span>
                          <span className="text-gray-500">
                            {userProfile.experience} / {userProfile.nextLevelExp} EXP
                          </span>
                        </div>
                        <Progress 
                          value={(userProfile.experience / userProfile.nextLevelExp) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>

                    <div className="flex space-x-1 sm:space-x-2">
                      <Button 
                        onClick={() => router.push('/en/profile')} 
                        variant="outline" 
                        size="sm"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Perfil
                      </Button>
                      <Button 
                        onClick={handleSignOut} 
                        variant="outline" 
                        size="sm"
                      >
                        <LogOut className="mr-1 h-3 w-3" />
                        Salir
                      </Button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                    <StatTile
                      title="Catas"
                      value={userProfile.stats.totalTastings}
                      subtitle="Completadas"
                      icon={Wine}
                      variant="primary"
                      size="sm"
                    />
                    <StatTile
                      title="Rating"
                      value={`${userProfile.stats.averageRating}/5.0`}
                      subtitle="Promedio"
                      icon={Star}
                      variant="secondary"
                      size="sm"
                    />
                    <StatTile
                      title="Amigos"
                      value={userProfile.stats.friendsCount}
                      subtitle="Conexiones"
                      icon={Users}
                      variant="accent"
                      size="sm"
                    />
                    <StatTile
                      title="Eventos"
                      value={userProfile.stats.eventsAttended}
                      subtitle="Asistidos"
                      icon={Calendar}
                      variant="default"
                      size="sm"
                    />
                  </div>

                  {/* Recent Achievements */}
                  <div className="mt-3 sm:mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Logros Recientes</h4>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {userProfile.achievements.slice(0, 3).map((achievement) => (
                        <Badge
                          key={achievement.id}
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          <span>{achievement.icon}</span>
                          {achievement.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </HeroGradient>
           ) : (
             // Non-authenticated user welcome - consistent layout structure
             <Card className="rounded-2xl bg-[#FFF5E1] shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <div className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--mexican-green)] to-[var(--mexican-amber)]">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3
                  className="mb-2 text-lg font-bold text-text-primary"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Welcome to Flavatix!
                </h3>
                <p
                  className="mb-4 text-sm text-text-secondary"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  Discover authentic Mexican flavors
                </p>
                <div className="mx-auto flex w-full max-w-[280px] justify-center">
                  <Button
                    onClick={handleSignIn}
                    className="w-full rounded-full bg-black py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-800"
                    aria-label="Sign in with existing account"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
            </Card>
          )}
        </div>
      </motion.div>
      
      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />
    </div>
  )
}
