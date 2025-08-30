'use client'

import * as React from 'react'
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js'

type Ctx = {
  client: SupabaseClient | null
  session: Session | null
  user: Session['user'] | null
  initialized: boolean
  signInWithOtp: (email: string) => Promise<{ error: any } | void>
  signOut: () => Promise<void>
}

const SupabaseContext = React.createContext<Ctx | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const [client, setClient] = React.useState<SupabaseClient | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [initialized, setInitialized] = React.useState(false)

  React.useEffect(() => {
    // If env vars are missing, expose a benign, initialized context
    if (!url || !anon) {
      setClient(null)
      setSession(null)
      setInitialized(true)
      return
    }

    const c = createClient(url, anon)
    setClient(c)

    // initial session
    c.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setInitialized(true)
    })

    // subscribe to auth changes
    const { data: sub } = c.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [url, anon])

  const value = React.useMemo<Ctx>(() => {
    async function signInWithOtp(email: string) {
      if (!client) return
      const { error } = await client.auth.signInWithOtp({ email })
      if (error) return { error }
    }
    async function signOut() {
      if (!client) return
      await client.auth.signOut()
    }

    return {
      client,
      session,
      user: session?.user ?? null,
      initialized,
      signInWithOtp,
      signOut,
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
