'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import {
  Calendar as HiCalendar,
  Clock as HiClock,
  Users as HiUsers,
  MapPin as HiMapPin,
  Plus as HiPlus,
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isFuture,
} from 'date-fns'
import { es } from 'date-fns/locale'

interface TastingEvent {
  id: string
  name: string
  description: string
  scheduled_for: string
  duration_minutes: number
  max_participants: number
  current_participants: number
  tasting_type: string
  is_blind: boolean
  host: {
    id: string
    name: string
    avatar_url?: string
  }
  participants: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  location?: string
  is_virtual: boolean
  rsvp_status?: 'attending' | 'maybe' | 'not_attending'
  visibility: 'public' | 'friends' | 'private'
}

interface EventCalendarProps {
  onEventSelect?: (event: TastingEvent) => void
  onCreateEvent?: () => void
}

export function EventCalendar({ onEventSelect, onCreateEvent }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<TastingEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadEvents()
  }, [currentDate, user])

  const loadEvents = async () => {
    if (!user) return

    setLoading(true)
    try {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      const { data, error } = await supabase
        .from('tastings')
        .select(
          `
          *,
          host:profiles!tastings_created_by_fkey(id, name, avatar_url),
          participants:tasting_participants(
            user:profiles(id, name, avatar_url),
            status
          )
        `
        )
        .gte('scheduled_for', monthStart.toISOString())
        .lte('scheduled_for', monthEnd.toISOString())
        .or(`visibility.eq.public,created_by.eq.${user.id}`)
        .order('scheduled_for', { ascending: true })

      if (error) throw error

      const formattedEvents: TastingEvent[] =
        data?.map((event: any) => ({
          id: event.id,
          name: event.name,
          description: event.description,
          scheduled_for: event.scheduled_for,
          duration_minutes: event.duration_minutes || 60,
          max_participants: event.max_participants,
          current_participants:
            event.participants?.filter((p: any) => p.status === 'active').length || 0,
          tasting_type: event.tasting_type,
          is_blind: event.is_blind,
          host: event.host,
          participants:
            event.participants?.filter((p: any) => p.status === 'active').map((p: any) => p.user) ||
            [],
          location: event.location,
          is_virtual: event.is_virtual || true,
          visibility: event.visibility || 'public',
        })) || []

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los eventos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const rsvpToEvent = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => {
    try {
      const { error } = await supabase.from('tasting_participants').upsert({
        tasting_id: eventId,
        user_id: user?.id,
        status: status === 'attending' ? 'active' : status === 'maybe' ? 'pending' : 'declined',
        joined_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: 'RSVP actualizado',
        description: `Tu respuesta ha sido registrada: ${
          status === 'attending' ? 'Asistiré' : status === 'maybe' ? 'Tal vez' : 'No asistiré'
        }`,
      })

      loadEvents()
    } catch (error) {
      console.error('Error updating RSVP:', error)
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu respuesta',
        variant: 'destructive',
      })
    }
  }

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.scheduled_for), date))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'mezcal':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'tequila':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'wine':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const upcomingEvents = events.filter(event => isFuture(new Date(event.scheduled_for))).slice(0, 5)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-card">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 rounded bg-gray-200"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-10 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HiCalendar className="h-5 w-5" />
              Calendario de Catas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
              >
                {view === 'calendar' ? 'Lista' : 'Calendario'}
              </Button>
              <Button
                size="sm"
                onClick={onCreateEvent}
                className="bg-mexican-green hover:bg-mexican-green/90"
              >
                <HiPlus className="mr-1 h-4 w-4" />
                Crear Evento
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {view === 'calendar' ? (
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                  }
                >
                  ←
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                  }
                >
                  →
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {getDaysInMonth().map(date => {
                  const dayEvents = getEventsForDate(date)
                  const isSelected = selectedDate && isSameDay(date, selectedDate)

                  return (
                    <div
                      key={date.toISOString()}
                      className={`min-h-[80px] cursor-pointer border border-gray-200 p-1 transition-colors ${isToday(date) ? 'border-mexican-green bg-mexican-green/10' : ''} ${isSelected ? 'border-blue-300 bg-blue-50' : ''} hover:bg-gray-50`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div
                        className={`text-sm ${isToday(date) ? 'font-bold text-mexican-green' : ''}`}
                      >
                        {format(date, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`truncate rounded p-1 text-xs ${getEventTypeColor(event.tasting_type)}`}
                            onClick={e => {
                              e.stopPropagation()
                              onEventSelect?.(event)
                            }}
                          >
                            {event.name}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayEvents.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Próximos Eventos</h3>
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <HiCalendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No hay eventos próximos</p>
                  <p className="text-sm">¡Crea tu primera cata!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <Card
                      key={event.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <h4 className="font-medium">{event.name}</h4>
                              <Badge className={getEventTypeColor(event.tasting_type)}>
                                {event.tasting_type}
                              </Badge>
                              {event.is_blind && <Badge variant="outline">Cata Ciega</Badge>}
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <HiClock className="h-4 w-4" />
                                {format(new Date(event.scheduled_for), 'PPP p', { locale: es })}
                              </div>
                              <div className="flex items-center gap-2">
                                <HiUsers className="h-4 w-4" />
                                {event.current_participants}/{event.max_participants} participantes
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <HiMapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={event.host.avatar_url} alt={event.host.name} />
                                <AvatarFallback className="text-xs">
                                  {event.host.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-600">
                                Organizado por {event.host.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => rsvpToEvent(event.id, 'attending')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Asistiré
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rsvpToEvent(event.id, 'maybe')}
                            >
                              Tal vez
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && view === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Eventos del {format(selectedDate, 'PPP', { locale: es })}</CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="py-4 text-center text-gray-500">No hay eventos para esta fecha</p>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div
                    key={event.id}
                    className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50"
                    onClick={() => onEventSelect?.(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.scheduled_for), 'p', { locale: es })} -
                          {event.host.name}
                        </p>
                      </div>
                      <Badge className={getEventTypeColor(event.tasting_type)}>
                        {event.tasting_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
