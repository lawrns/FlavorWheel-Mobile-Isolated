'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Star } from 'lucide-react'

interface RankingBadgeProps {
  ranking: number
  showIcon?: boolean
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function RankingBadge({
  ranking,
  showIcon = false,
  variant = 'secondary',
  size = 'md'
}: RankingBadgeProps) {
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return <Trophy className="h-3 w-3" />
      case 2: return <Medal className="h-3 w-3" />
      case 3: return <Award className="h-3 w-3" />
      default: return <Star className="h-3 w-3" />
    }
  }

  const getRankingText = (ranking: number) => {
    switch (ranking) {
      case 1: return '🥇 1st'
      case 2: return '🥈 2nd'
      case 3: return '🥉 3rd'
      default: return `#${ranking}`
    }
  }

  const getRankingColor = (ranking: number) => {
    switch (ranking) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2: return 'bg-gray-100 text-gray-800 border-gray-200'
      case 3: return 'bg-amber-100 text-amber-800 border-amber-200'
      default: return ''
    }
  }

  if (variant === 'default' && ranking <= 3) {
    return (
      <Badge className={`${getRankingColor(ranking)} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {showIcon && getRankingIcon(ranking)}
        <span className={showIcon ? 'ml-1' : ''}>{getRankingText(ranking)}</span>
      </Badge>
    )
  }

  return (
    <Badge variant={variant} className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {showIcon && getRankingIcon(ranking)}
      <span className={showIcon ? 'ml-1' : ''}>{getRankingText(ranking)}</span>
    </Badge>
  )
}









