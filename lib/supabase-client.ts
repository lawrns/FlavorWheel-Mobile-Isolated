// Client-side Supabase configuration
'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create Supabase client with error handling
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Some features may not work properly.')
    // Return a mock client that won't crash the app
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      },
      global: {
        headers: {
          'X-Client-Info': 'flavorwheel-mexico@1.0.0'
        }
      }
    })
  } catch (error) {
    console.error('Failed to create Supabase client:', error)
    return null
  }
}

// Client-side Supabase client
export const supabaseClient = createSupabaseClient()

export default supabaseClient
