'use client'

import * as React from 'react'
import { type SupabaseClient, type Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

type Ctx = {
  client: SupabaseClient
  session: Session | null
  user: Session['user'] | null
  initialized: boolean
  signInWithOtp: (email: string) => Promise<{ error: any } | void>
  signOut: () => Promise<void>
  supabase: SupabaseClient
}

const SupabaseContext = React.createContext<Ctx | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = React.useState<SupabaseClient>(() => getSupabaseClient() as unknown as SupabaseClient)
  const [session, setSession] = React.useState<Session | null>(null)
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    // Use the unified Supabase client
    const c = getSupabaseClient() as unknown as SupabaseClient
    setClient(c)

    // initial session
    c.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setInitialized(true)
    }).catch((error) => {
      console.error('Failed to get initial session:', error)
      setInitialized(true)
    })

    // subscribe to auth changes
    const { data: sub } = c.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = React.useMemo<Ctx>(() => {
    async function signInWithOtp(email: string) {
      try {
        const { error } = await client.auth.signInWithOtp({ email })
        if (error) return { error }
      } catch (error) {
        console.error('Sign in error:', error)
        return { error: { message: 'Sign in failed' } }
      }
    }
    async function signOut() {
      try {
        await client.auth.signOut()
      } catch (error) {
        console.error('Sign out error:', error)
      }
    }

    return {
      client,
      session,
      user: session?.user ?? null,
      initialized,
      signInWithOtp,
      signOut,
      supabase: client, // Add backward compatibility
    }
  }, [client, session, initialized])

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

/** Hook used across the app; throws if provider is missing to catch config errors quickly. */
export function useSupabase() {
  const ctx = React.useContext(SupabaseContext)
  if (!ctx) {
    throw new Error(
      'useSupabase must be used within <SupabaseProvider>. Make sure your root layout wraps children with it.'
    )
  }
  return ctx
}

// Optional: named export if some files import the context directly
export { SupabaseContext }
