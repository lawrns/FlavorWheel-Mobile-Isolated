'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { DashboardAppShell } from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTastingDetail } from '@/hooks/use-tastings'
import { ArrowLeft, Users, LogIn, Share2, Calendar, Clock, Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { TastingSharing } from '@/components/tasting-sharing'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SchedulingModalProps {
  onClose: () => void
  onSchedule: () => void
  selectedDate: Date | null
  selectedTime: string
  onDateChange: (date: Date | null) => void
  onTimeChange: (time: string) => void
}

function SchedulingModal({
  onClose,
  onSchedule,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange
}: SchedulingModalProps) {
  const today = new Date()

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Tasting
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <CalendarComponent
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => onDateChange(date || null)}
              disabled={(date) => date < today}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onSchedule}
              className="flex-1"
              disabled={!selectedDate || !selectedTime}
            >
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function TastingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data, loading, error, refresh } = useTastingDetail(id)
  const [joining, setJoining] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showSharing, setShowSharing] = useState(false)
  const [showScheduling, setShowScheduling] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null)
  const [scheduledTime, setScheduledTime] = useState<string>('')
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  const joinTasting = async () => {
    setJoining(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/tastings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'No se pudo unir')
      setMessage('Te has unido a la cata')
      await refresh()
    } catch (e: any) {
      setMessage(e?.message || 'Error al unirse a la cata')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <DashboardAppShell activeNavItem="tastings" maxWidth="md">
        <div className="mx-auto max-w-2xl p-4">
          <div className="mb-4 h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </div>
      </DashboardAppShell>
    )
  }

  if (error || !data) {
    const isAuthError = error?.includes('sign in') || error?.includes('Session expired') || error?.includes('Authentication')

    return (
      <DashboardAppShell activeNavItem="tastings" maxWidth="md">
        <div className="mx-auto max-w-2xl p-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-4">
            <p className="text-sm text-red-600">Could not load tasting.</p>
            <p className="text-xs text-muted-foreground">{error}</p>

            <div className="flex gap-2">
              <Button onClick={refresh} variant="outline" size="sm">
                Try Again
              </Button>

              {isAuthError && (
                <Button
                  onClick={() => router.push(`/${params.locale}/auth/signin`)}
                  size="sm"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  size="sm"
                >
                  Refresh Page
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardAppShell>
    )
  }

  const isCompleted = !!data.completed_at
  const isCreator = true // For now, assume user is creator since they just created it

  const startTasting = () => {
    // Check if tasting is scheduled for future
    if (scheduledDate && scheduledTime) {
      const scheduledDateTime = new Date(`${scheduledDate.toDateString()} ${scheduledTime}`)
      const now = new Date()

      if (scheduledDateTime > now) {
        toast({
          title: 'Tasting not yet available',
          description: `This tasting is scheduled for ${scheduledDateTime.toLocaleString()}`,
          variant: 'destructive'
        })
        return
      }
    }

    toast({
      title: 'Starting tasting...',
      description: 'Redirecting to the tasting interface.'
    })

    const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
    router.push(`/${currentLocale}/participate?tasting=${id}`)
  }

  const copyInviteLink = async () => {
    const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'
    const inviteUrl = `${window.location.origin}/${currentLocale}/tastings/${id}`

    try {
      await navigator.clipboard.writeText(inviteUrl)
      toast({
        title: 'Link copied!',
        description: 'Invitation link copied to clipboard'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not copy link to clipboard',
        variant: 'destructive'
      })
    }
  }

  const scheduleForLater = () => {
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: 'Please select date and time',
        description: 'Both date and time are required to schedule the tasting',
        variant: 'destructive'
      })
      return
    }

    const scheduledDateTime = new Date(`${scheduledDate.toDateString()} ${scheduledTime}`)

    toast({
      title: 'Tasting scheduled!',
      description: `Tasting will be available on ${scheduledDateTime.toLocaleString()}`
    })

    setShowScheduling(false)
  }

  return (
    <DashboardAppShell activeNavItem="tastings" maxWidth="md">
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <Badge variant="outline" className="ml-2">
            {isCompleted ? 'Completada' : 'Activa'}
          </Badge>
        </div>

        {message && <div className="text-sm text-green-700">{message}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalles de la Cata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Tipo de producto:</span>{' '}
              <span>{data.product_type?.display_name || 'No especificado'}</span>
            </div>
            <div>
              <span className="font-medium">Modo:</span>{' '}
              <Badge variant="secondary">{data.mode || 'study'}</Badge>
            </div>
            <div>
              <span className="font-medium">Descripción:</span>{' '}
              <span>{data.description || 'Sin descripción'}</span>
            </div>
            <div>
              <span className="font-medium">Cata ciega:</span>{' '}
              <span>{data.is_blind ? 'Sí' : 'No'}</span>
            </div>
            <div>
              <span className="font-medium">Categorías:</span>{' '}
              <span>{data.tasting_categories?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium">Elementos:</span>{' '}
              <span>{data.tasting_items?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        {data.tasting_categories && data.tasting_categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.tasting_categories.map((category: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.parameter_type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.tasting_items && data.tasting_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Elementos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.tasting_items.map((item: any, i: number) => (
                  <div key={i} className="text-sm">
                    {item.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invite Friends Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Invite Friends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this tasting with friends so they can join and participate
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyInviteLink}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSharing(true)}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Tasting Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Tasting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledDate && scheduledTime ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This tasting is scheduled for:
                </p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {new Date(`${scheduledDate.toDateString()} ${scheduledTime}`).toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setScheduledDate(null)
                    setScheduledTime('')
                  }}
                >
                  Remove Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Schedule this tasting for a specific date and time
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowScheduling(true)}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Set Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {!isCompleted && (
          <div className="flex gap-2">
            <Button onClick={startTasting} className="flex-1">
              Comenzar Cata
            </Button>
          </div>
        )}
      </div>

      {/* Sharing Modal */}
      {showSharing && (
        <TastingSharing
          tastingId={id}
          onClose={() => setShowSharing(false)}
          mode="join"
        />
      )}

      {/* Scheduling Modal */}
      {showScheduling && (
        <SchedulingModal
          onClose={() => setShowScheduling(false)}
          onSchedule={scheduleForLater}
          selectedDate={scheduledDate}
          selectedTime={scheduledTime}
          onDateChange={setScheduledDate}
          onTimeChange={setScheduledTime}
        />
      )}
    </DashboardAppShell>
  )
}



