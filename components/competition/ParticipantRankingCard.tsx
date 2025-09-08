'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react'

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
  total_score: number
  average_score: number
  consistency_score: number
  item_scores?: Array<{
    item_id: string
    item_name: string
    score: number
    comments?: string
  }>
}

interface ParticipantRankingCardProps {
  participant: ParticipantResult
  showDetailedScores?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'podium' | 'compact'
}

export function ParticipantRankingCard({
  participant,
  showDetailedScores = false,
  size = 'md',
  variant = 'default'
}: ParticipantRankingCardProps) {
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />
      case 2: return <Medal className="h-6 w-6 text-gray-400" />
      case 3: return <Award className="h-6 w-6 text-amber-600" />
      default: return <Star className="h-5 w-5 text-muted-foreground" />
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

  const getRankingBadge = (ranking: number) => {
    switch (ranking) {
      case 1: return '🥇 Champion'
      case 2: return '🥈 2nd Place'
      case 3: return '🥉 3rd Place'
      default: return `#${ranking}`
    }
  }

  if (variant === 'podium') {
    return (
      <div className="text-center">
        <div className="relative mb-2">
          {getRankingIcon(participant.ranking)}
        </div>
        <Avatar className={`${size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'} mx-auto mb-2`}>
          <AvatarImage src={participant.profile.avatar_url} />
          <AvatarFallback className={size === 'lg' ? 'text-xl' : 'text-lg'}>
            {participant.profile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h4 className={`font-semibold ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {participant.profile.name}
        </h4>
        <p className={`font-bold text-primary ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
          {participant.score}
        </p>
        <Badge variant="secondary" className="mt-1">
          {getRankingBadge(participant.ranking)}
        </Badge>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankingColor(participant.ranking)}`}>
          {participant.ranking}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={participant.profile.avatar_url} />
          <AvatarFallback>
            {participant.profile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium text-sm">{participant.profile.name}</p>
          <p className="text-xs text-muted-foreground">{participant.score} points</p>
        </div>
        {participant.ranking <= 3 && (
          <div className="text-muted-foreground">
            {getRankingIcon(participant.ranking)}
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <Card className={`hover:shadow-sm transition-shadow ${size === 'sm' ? 'p-3' : 'p-4'}`}>
      <CardContent className="p-0">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankingColor(participant.ranking)}`}>
            {participant.ranking}
          </div>
          <Avatar className={`${size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'}`}>
            <AvatarImage src={participant.profile.avatar_url} />
            <AvatarFallback className={size === 'lg' ? 'text-lg' : 'text-base'}>
              {participant.profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                {participant.profile.name}
              </h3>
              {participant.ranking <= 3 && getRankingIcon(participant.ranking)}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <Badge variant="secondary" className="text-xs">
                {participant.total_score} total points
              </Badge>
              <Badge variant="outline" className="text-xs">
                {participant.average_score}/100 avg
              </Badge>
              {size !== 'sm' && (
                <Badge variant="outline" className="text-xs">
                  {participant.consistency_score}% consistency
                </Badge>
              )}
            </div>
            {showDetailedScores && participant.item_scores && (
              <div className="mt-2 space-y-1">
                {participant.item_scores.slice(0, 3).map((itemScore) => (
                  <div key={itemScore.item_id} className="text-xs text-muted-foreground">
                    {itemScore.item_name}: {itemScore.score}/100
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className={`${size === 'lg' ? 'text-2xl' : 'text-xl'} font-bold text-primary`}>
              {participant.score}
            </div>
            <div className="text-xs text-muted-foreground">final score</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}









