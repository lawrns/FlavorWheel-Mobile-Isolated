'use client'

import * as React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'high-contrast' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark' | 'high-contrast'
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  actualTheme: 'light'
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'flavorwheel-theme',
  ...props
}: ThemeProviderProps) {
  // Initialize theme from localStorage or default
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && ['light', 'dark', 'high-contrast', 'system'].includes(stored)) {
        return stored as Theme
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error)
    }

    return defaultTheme
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark' | 'high-contrast'>('light')

  // Apply theme to DOM
  const applyTheme = React.useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return

    try {
      const root = window.document.documentElement

      // Remove existing theme classes
      root.classList.remove('light', 'dark', 'high-contrast')

      // Determine resolved theme
      let resolvedTheme: 'light' | 'dark' | 'high-contrast'

      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

        resolvedTheme = prefersHighContrast
          ? 'high-contrast'
          : prefersDark
          ? 'dark'
          : 'light'
      } else {
        resolvedTheme = newTheme as 'light' | 'dark' | 'high-contrast'
      }

      // Apply theme class
      root.classList.add(resolvedTheme)
      setActualTheme(resolvedTheme)

      console.log('Theme applied:', { requested: newTheme, resolved: resolvedTheme })

    } catch (error) {
      console.error('Failed to apply theme:', error)
    }
  }, [])

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // Handle system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')

    const handleChange = () => {
      applyTheme('system')
    }

    mediaQuery.addEventListener('change', handleChange)
    contrastQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      contrastQuery.removeEventListener('change', handleChange)
    }
  }, [theme, applyTheme])

  // Handle storage events (when theme is changed in another tab)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const newTheme = e.newValue as Theme
          if (['light', 'dark', 'high-contrast', 'system'].includes(newTheme)) {
            setTheme(newTheme)
          }
        } catch (error) {
          console.warn('Failed to handle storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [storageKey])

  const handleSetTheme = React.useCallback((newTheme: Theme) => {
    try {
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }

      // Update state
      setTheme(newTheme)

      console.log('Theme set to:', newTheme)
    } catch (error) {
      console.error('Failed to set theme:', error)
    }
  }, [storageKey])

  const value = React.useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    actualTheme
  }), [theme, handleSetTheme, actualTheme])

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}