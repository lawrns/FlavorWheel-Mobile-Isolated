'use client'

import { createContext, useContext, type ReactNode } from 'react'
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
  ) => Promise<{ success: boolean; user?: any; needsConfirmation?: boolean } | void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Get auth state and functions from SupabaseProvider
  const supabaseContext = useSupabase() // This will now work because SupabaseProvider waits for initialization

  const {
    user: supabaseUser,
    initialized,
    signInWithOtp,
    signOut,
  } = supabaseContext

  // Transform Supabase user to our User interface
  const user: User | null = supabaseUser ? {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || '',
    avatar: supabaseUser.user_metadata?.avatar_url,
    preferences: {
      darkMode: false,
      notifications: true
    }
  } : null

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
    await signOut()
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
