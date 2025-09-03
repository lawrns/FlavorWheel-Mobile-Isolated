// Supabase client configuration for FlavorWheel México
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface SupabaseClient {
  from: (table: string) => unknown
  channel: (name: string) => unknown
  auth: {
    signInWithOtp: (params: { email: string }) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    getSession: () => Promise<{ data: { session: unknown } }>
    onAuthStateChange: (callback: (event: string, session: unknown) => void) => { data: { subscription: { unsubscribe: () => void } } }
  }
}

// Create Supabase client with proper configuration for Next.js 15
export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
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
}

// Mock client for development/testing
function createMockClient() {
  class MockChannel {
    on(event: string, callback: Function) {
      return this
    }

    subscribe(callback?: Function) {
      if (callback) callback()
      return this
    }

    unsubscribe() {
      return this
    }
  }

  class MockQueryBuilder {
    constructor(private table: string) {}

    select(columns?: string) {
      return this
    }

    insert(data: any) {
      return this
    }

    update(data: any) {
      return this
    }

    delete() {
      return this
    }

    eq(column: string, value: any) {
      return this
    }

    or(filter: string) {
      return this
    }

    gte(column: string, value: any) {
      return this
    }

    lte(column: string, value: any) {
      return this
    }

    lt(column: string, value: any) {
      return this
    }

    single() {
      return this
    }

    upsert(data: any) {
      return this
    }

    range(from: number, to: number) {
      return this
    }

    neq(column: string, value: any) {
      return this
    }

    not(column: string, operator: string, value: any) {
      return this
    }

    in(column: string, values: any[]) {
      return this
    }

    textSearch(column: string, query: string, options?: any) {
      return this
    }

    overlaps(column: string, values: any[]) {
      return this
    }

    order(column: string, options?: { ascending?: boolean }) {
      return this
    }

    limit(count: number) {
      return this
    }

    then(callback: (result: any) => void) {
      // Mock successful response
      const mockResult = {
        data: [],
        error: null
      }
      callback(mockResult)
      return this
    }
  }

  return {
    from: (table: string) => new MockQueryBuilder(table),
    channel: (name: string) => new MockChannel(),
    auth: {
      signInWithOtp: async (params: { email: string }) => {
        // Mock successful auth
        console.log('Mock auth: sign in with', params.email)
        return { error: null }
      },
      signOut: async () => {
        console.log('Mock auth: sign out')
      },
      getSession: async () => {
        // Mock session
        return {
          data: {
            session: {
              user: { id: 'mock-user-id', email: 'mock@example.com' }
            }
          }
        }
      },
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        // Mock subscription
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock subscription unsubscribed')
            }
          }
        }
      },
      getUser: async () => {
        // Mock getUser
        return {
          data: {
            user: { id: 'mock-user-id', email: 'mock@example.com' }
          },
          error: null
        }
      }
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string, file: File, options?: Record<string, unknown>) => {
          console.log('Mock storage: upload', path, file.name, options)
          return { data: { path }, error: null }
        },
        getPublicUrl: (path: string) => {
          console.log('Mock storage: getPublicUrl', path)
          return { data: { publicUrl: `https://mock-storage.com/${path}` } }
        },
        remove: async (paths: string[]) => {
          console.log('Mock storage: remove', paths)
          return { data: null, error: null }
        },
        list: async (path?: string) => {
          console.log('Mock storage: list', path)
          return { data: { files: [] }, error: null }
        }
      })
    }
  }
}

// Create the main Supabase client instance with error handling
let supabaseClient: ReturnType<typeof createClient> | ReturnType<typeof createMockClient> | null = null
try {
  supabaseClient = createClient()
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
  // In development, use mock client as fallback
  if (process.env.NODE_ENV === 'development') {
    console.warn('Using mock Supabase client for development')
    supabaseClient = createMockClient()
  } else {
    throw error // Re-throw in production
  }
}

export const supabase = supabaseClient

// Client-side only utilities
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: use mock client if real client failed
    return supabaseClient || createMockClient()
  }
  // Client-side: return real client
  return supabaseClient || createClient()
}

// Development utilities - removed mock storage to encourage proper implementation
