'use client'

import React from 'react'
import { useTheme } from '@/components/providers/theme-provider'

export function ThemeDebug() {
  const { theme, actualTheme, setTheme } = useTheme()

  React.useEffect(() => {
    console.log('ThemeDebug - Current theme state:', { theme, actualTheme })

    // Check if theme classes are applied to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      console.log('ThemeDebug - HTML classes:', root.className)
      console.log('ThemeDebug - CSS variables:', {
        bg: getComputedStyle(root).getPropertyValue('--fx-bg'),
        textPrimary: getComputedStyle(root).getPropertyValue('--fx-text-primary'),
        textSecondary: getComputedStyle(root).getPropertyValue('--fx-text-secondary')
      })
    }
  }, [theme, actualTheme])

  return (
    <div className="fixed bottom-4 right-4 bg-card-surface border border-card-border rounded-lg p-4 shadow-card z-50 max-w-sm">
      <h3 className="font-semibold text-card-text-primary mb-2">Theme Debug</h3>
      <div className="text-xs text-card-text-secondary space-y-1">
        <div>Requested: {theme}</div>
        <div>Applied: {actualTheme}</div>
        <div>HTML classes: {typeof window !== 'undefined' ? document.documentElement.className : 'N/A'}</div>
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => setTheme('light')}
          className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
        >
          Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
        >
          Dark
        </button>
        <button
          onClick={() => setTheme('high-contrast')}
          className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
        >
          HC
        </button>
      </div>
    </div>
  )
}


