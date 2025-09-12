'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences?: {
    darkMode: boolean
    notifications: boolean
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void | { success: boolean }>
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; needsConfirmation?: boolean } | void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  loginAsTestUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Test user state for development
  const [testUser, setTestUser] = useState<User | null>(null)
  const isTestMode = process.env.NODE_ENV === 'development'

  // Get auth state and functions from SupabaseProvider
  const supabaseContext = useSupabase() // This will now work because SupabaseProvider waits for initialization

  const {
    user: supabaseUser,
    initialized,
    signInWithOtp,
    signOut,
  } = supabaseContext

  // Transform Supabase user to our User interface, or use test user
  const user: User | null = testUser || (supabaseUser ? {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    avatar: supabaseUser.user_metadata?.avatar_url,
    preferences: {
      darkMode: false,
      notifications: true
    }
  } : null)

  const login = async (email: string, password: string) => {
    if (!supabaseContext.client) {
      throw new Error('Supabase client not initialized')
    }
    
    const { data, error } = await supabaseContext.client.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return { success: true }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      return {
        success: true,
        user: data.user,
        needsConfirmation: !data.session // If no session, email confirmation is needed
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = async () => {
    if (testUser) {
      setTestUser(null)
      // Clear test user flag
      if (typeof window !== 'undefined') {
        localStorage.removeItem('test-user')
      }
    } else {
      await signOut()
    }
  }

  const loginAsTestUser = () => {
    if (isTestMode) {
      const testUserData = {
        id: '00000000-0000-0000-0000-000000000001', // Valid UUID format for test user
        name: 'Test User',
        email: 'test@flavorwheel.com',
        avatar: undefined,
        preferences: {
          darkMode: false,
          notifications: true
        }
      }
      setTestUser(testUserData)
      // Set flag in localStorage for the service to detect
      if (typeof window !== 'undefined') {
        localStorage.setItem('test-user', 'true')
      }
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    // This would need to be implemented in SupabaseProvider
    console.log('Update user not yet implemented:', userData)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !initialized,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
        loginAsTestUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
