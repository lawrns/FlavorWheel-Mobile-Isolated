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

    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'high-contrast')

    // Remove existing data-theme attributes
    root.removeAttribute('data-theme')

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark')
      // Dark mode uses CSS custom properties defined in globals.css
      // No need to set individual properties here - they should be defined in CSS
    } else if (theme === 'high-contrast') {
      root.setAttribute('data-theme', 'high-contrast')
      // High contrast mode uses CSS custom properties defined in globals.css
    } else {
      root.setAttribute('data-theme', 'light')
      // Light mode uses the default CSS custom properties
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
