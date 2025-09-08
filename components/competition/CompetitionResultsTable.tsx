'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award } from 'lucide-react'

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
}

interface CompetitionItem {
  id: string
  name: string
  type: string
}

interface CompetitionResultsTableProps {
  participants: ParticipantResult[]
  items: CompetitionItem[]
  getItemScore?: (participantId: string, itemId: string) => number
}

export function CompetitionResultsTable({
  participants,
  items,
  getItemScore
}: CompetitionResultsTableProps) {
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2: return <Medal className="h-4 w-4 text-gray-400" />
      case 3: return <Award className="h-4 w-4 text-amber-600" />
      default: return null
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Participant</TableHead>
            {items.map(item => (
              <TableHead key={item.id} className="text-center min-w-24">
                <div className="text-xs">
                  <div className="font-medium truncate max-w-20" title={item.name}>
                    {item.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {item.type}
                  </div>
                </div>
              </TableHead>
            ))}
            <TableHead className="text-center">Total</TableHead>
            <TableHead className="text-center">Average</TableHead>
            <TableHead className="text-center">Consistency</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants
            .sort((a, b) => a.ranking - b.ranking)
            .map((participant) => (
              <TableRow key={participant.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      participant.ranking === 1 ? 'bg-yellow-500 text-white' :
                      participant.ranking === 2 ? 'bg-gray-400 text-white' :
                      participant.ranking === 3 ? 'bg-amber-600 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {participant.ranking}
                    </div>
                    {getRankingIcon(participant.ranking)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.profile.avatar_url} />
                      <AvatarFallback>
                        {participant.profile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{participant.profile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Score: {participant.score}/100
                      </div>
                    </div>
                  </div>
                </TableCell>
                {items.map(item => {
                  const score = getItemScore ? getItemScore(participant.id, item.id) : 0
                  return (
                    <TableCell key={item.id} className="text-center">
                      <div className="font-medium">{score}</div>
                      <div className="text-xs text-muted-foreground">/100</div>
                    </TableCell>
                  )
                })}
                <TableCell className="text-center">
                  <div className="font-bold text-primary">{participant.total_score}</div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {participant.average_score}/100
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {participant.consistency_score}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}









