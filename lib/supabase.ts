// Mock Supabase client for isolated build
// This replaces the real Supabase integration to avoid environment variable dependencies

export interface MockSupabaseClient {
  from: (table: string) => MockQueryBuilder
  channel: (name: string) => MockChannel
  auth: {
    signInWithOtp: (params: { email: string }) => Promise<{ error: any }>
    signOut: () => Promise<void>
    getSession: () => Promise<{ data: { session: any } }>
    onAuthStateChange: (callback: Function) => { data: { subscription: { unsubscribe: () => void } } }
  }
}

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

export const createClient = (url?: string, key?: string): MockSupabaseClient => {
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
      onAuthStateChange: (callback: Function) => {
        // Mock subscription
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log('Mock subscription unsubscribed')
            }
          }
        }
      }
    }
  }
}

export const supabase = createClient()

// Mock storage utilities
export const mockStorage = {
  tastings: [] as any[],
  saveTasting: (tasting: any) => {
    mockStorage.tastings.push(tasting)
    localStorage.setItem('mock-tastings', JSON.stringify(mockStorage.tastings))
  },
  getTastings: () => {
    const stored = localStorage.getItem('mock-tastings')
    return stored ? JSON.parse(stored) : []
  },
  getTastingById: (id: string) => {
    return mockStorage.getTastings().find((t: any) => t.id === id)
  }
}
