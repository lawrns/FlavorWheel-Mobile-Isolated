'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'high-contrast'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'flava-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (typeof window !== 'undefined' && localStorage.getItem(storageKey)) as Theme || defaultTheme
  )

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark', 'high-contrast')

    if (theme === 'dark') {
      root.classList.add('dark')
      // Apply dark mode CSS variables - Consolidated brand system
      root.style.setProperty('--primary', '#2E7D32') // fx-brand-green-500
      root.style.setProperty('--primary-foreground', '#FFFFFF')
      root.style.setProperty('--secondary', '#D4AF37') // fx-brand-gold-500
      root.style.setProperty('--secondary-foreground', '#1A1A1A')
      root.style.setProperty('--accent', '#FF6B35')
      root.style.setProperty('--accent-foreground', '#FFFFFF')
      root.style.setProperty('--background', '#0E0E0C') // fx-black
      root.style.setProperty('--foreground', '#FEFCF8') // fx-neutral-0
      root.style.setProperty('--muted', '#4A473F') // fx-neutral-700
      root.style.setProperty('--muted-foreground', '#EDE7DA') // fx-neutral-100
      root.style.setProperty('--border', '#E0D8C7') // fx-neutral-200
      root.style.setProperty('--surface', '#1A1A1A')

      // Semantic surfaces for dark mode
      root.style.setProperty('--surface-50', '#16161a')
      root.style.setProperty('--surface-100', '#1e1e22')
      root.style.setProperty('--surface-200', '#2a2a2e')
      root.style.setProperty('--surface-300', '#3a3a3e')
      root.style.setProperty('--surface-400', '#4a4a4e')
      root.style.setProperty('--surface-500', '#5a5a5e')
      root.style.setProperty('--surface-600', '#6a6a6e')
      root.style.setProperty('--surface-700', '#7a7a7e')
      root.style.setProperty('--surface-800', '#8a8a8e')
      root.style.setProperty('--surface-900', '#9a9a9e')
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast')
      // Apply high contrast mode CSS variables - Brand colors with high contrast
      root.style.setProperty('--primary', '#2E7D32') // fx-brand-green-500
      root.style.setProperty('--secondary', '#D4AF37') // fx-brand-gold-500
      root.style.setProperty('--accent', '#E4572E') // fx-ai-confidence-low for contrast
      root.style.setProperty('--background', '#0E0E0C') // fx-black
      root.style.setProperty('--foreground', '#FFFFFF')
    } else {
      root.classList.add('light')
      // Apply light mode CSS variables (default) - Consolidated brand system
      root.style.setProperty('--primary', '#2E7D32') // fx-brand-green-500
      root.style.setProperty('--primary-foreground', '#FFFFFF')
      root.style.setProperty('--secondary', '#D4AF37') // fx-brand-gold-500
      root.style.setProperty('--secondary-foreground', '#1A1A1A')
      root.style.setProperty('--accent', '#FF6B35')
      root.style.setProperty('--accent-foreground', '#FFFFFF')
      root.style.setProperty('--background', '#FEFCF8') // fx-neutral-0
      root.style.setProperty('--foreground', '#0E0E0C') // fx-black
      root.style.setProperty('--muted', '#F7F3EA') // fx-neutral-50
      root.style.setProperty('--muted-foreground', '#4A473F') // fx-neutral-700
      root.style.setProperty('--border', '#EDE7DA') // fx-neutral-100
      root.style.setProperty('--surface', '#FAF7F0') // fx-bg from context

      // Semantic surfaces for light mode
      root.style.setProperty('--surface-50', '#FAFAFA')
      root.style.setProperty('--surface-100', '#F5F5F5')
      root.style.setProperty('--surface-200', '#E5E7EB')
      root.style.setProperty('--surface-300', '#D1D5DB')
      root.style.setProperty('--surface-400', '#9CA3AF')
      root.style.setProperty('--surface-500', '#6B7280')
      root.style.setProperty('--surface-600', '#4B5563')
      root.style.setProperty('--surface-700', '#374151')
      root.style.setProperty('--surface-800', '#1F2937')
      root.style.setProperty('--surface-900', '#111827')
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
