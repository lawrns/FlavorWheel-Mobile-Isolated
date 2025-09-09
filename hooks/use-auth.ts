'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface UseAuthReturn {
  isAuthenticated: boolean
  user: any | null
  loading: boolean
}

export function useAuth(): UseAuthReturn {
  const { user, client: supabase } = useSupabase()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase) {
      // Check initial auth state
      supabase.auth.getUser().then(({ data: { user } }) => {
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [supabase])

  return {
    isAuthenticated: !!user,
    user,
    loading
  }
}

