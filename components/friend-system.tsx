'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'
import { supabase } from '@/lib/supabase'
import {
  UserPlus as HiUserPlus,
  Users as HiUserGroup,
  Search as HiMagnifyingGlass,
  Check as HiCheck,
  X as HiXMark,
} from 'lucide-react'

interface Friend {
  id: string
  name: string
  email: string
  avatar_url?: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  mutual_friends?: number
  last_active?: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface FriendSystemProps {
  onFriendAdded?: (friend: Friend) => void
}

export function FriendSystem({ onFriendAdded }: FriendSystemProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('friends')

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      loadFriends()
      loadPendingRequests()
    }
  }, [user])

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          *,
          user_a:profiles!friendships_user_id_a_fkey(id, name, email, avatar_url),
          user_b:profiles!friendships_user_id_b_fkey(id, name, email, avatar_url)
        `
        )
        .or(`user_id_a.eq.${user?.id},user_id_b.eq.${user?.id}`)
        .eq('status', 'accepted')

      if (error) throw error

      const friendsList =
        data?.map((friendship: any) => {
          const friend = friendship.user_id_a === user?.id ? friendship.user_b : friendship.user_a
          return {
            ...friend,
            status: friendship.status,
            created_at: friendship.created_at,
          }
        }) || []

      setFriends(friendsList)
    } catch (error) {
      console.error('Error loading friends:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los amigos',
        variant: 'destructive',
      })
    }
  }

  const loadPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(
          `
          *,
          user_a:profiles!friendships_user_id_a_fkey(id, name, email, avatar_url)
        `
        )
        .eq('user_id_b', user?.id)
        .eq('status', 'pending')

      if (error) throw error

      const requests =
        data?.map((friendship: any) => ({
          ...friendship.user_a,
          status: friendship.status,
          created_at: friendship.created_at,
        })) || []

      setPendingRequests(requests)
    } catch (error) {
      console.error('Error loading pending requests:', error)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(10)

      if (error) throw error

      // Filter out existing friends
      const existingFriendIds = friends.map(f => f.id)
      const filteredResults = data?.filter((profile: any) => !existingFriendIds.includes(profile.id)) || []

      setSearchResults(filteredResults)
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: 'Error',
        description: 'Error en la búsqueda',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const { error } = await supabase.from('friendships').insert({
        user_id_a: user?.id,
        user_id_b: targetUserId,
        status: 'pending',
      })

      if (error) throw error

      // Send notification
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          title: 'Nueva solicitud de amistad',
          body: `${(user as any)?.user_metadata?.name || user?.email} quiere ser tu amigo`,
          data: { type: 'friend_request', senderId: user?.id },
        }),
      })

      toast({
        title: '¡Solicitud enviada!',
        description: 'Se envió la solicitud de amistad',
      })

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== targetUserId))
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud',
        variant: 'destructive',
      })
    }
  }

  const acceptFriendRequest = async (friendshipId: string, senderId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id_a', senderId)
        .eq('user_id_b', user?.id)

      if (error) throw error

      // Create activity
      await supabase.from('activities').insert({
        user_id: user?.id,
        type: 'friend_added',
        content: `Se hizo amigo de ${pendingRequests.find(r => r.id === senderId)?.name}`,
        visibility: 'friends',
      })

      toast({
        title: '¡Amistad aceptada!',
        description: 'Ahora son amigos',
      })

      loadFriends()
      loadPendingRequests()
    } catch (error) {
      console.error('Error accepting friend request:', error)
      toast({
        title: 'Error',
        description: 'No se pudo aceptar la solicitud',
        variant: 'destructive',
      })
    }
  }

  const rejectFriendRequest = async (senderId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id_a', senderId)
        .eq('user_id_b', user?.id)

      if (error) throw error

      toast({
        title: 'Solicitud rechazada',
        description: 'Se rechazó la solicitud de amistad',
      })

      loadPendingRequests()
    } catch (error) {
      console.error('Error rejecting friend request:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiUserGroup className="h-5 w-5" />
            Sistema de Amigos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">Amigos ({friends.length})</TabsTrigger>
              <TabsTrigger value="requests">Solicitudes ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="search">Buscar</TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              {friends.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <HiUserGroup className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Aún no tienes amigos</p>
                  <p className="text-sm">¡Busca personas para conectar!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map(friend => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar_url} alt={friend.name} />
                          <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Amigo</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p>No hay solicitudes pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={request.avatar_url} alt={request.name} />
                          <AvatarFallback>{request.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-gray-500">{request.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id, request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <HiCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectFriendRequest(request.id)}
                        >
                          <HiXMark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {loading && (
                <div className="py-4 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-mexican-green"></div>
                </div>
              )}

              <div className="space-y-3">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user.id)}
                      className="bg-mexican-green hover:bg-mexican-green/90"
                    >
                      <HiUserPlus className="mr-1 h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                ))}
              </div>

              {searchQuery && !loading && searchResults.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  <p>No se encontraron usuarios</p>
                  <p className="text-sm">Intenta con otro término de búsqueda</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
