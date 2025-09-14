'use client'

import React from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Simple test component to check dark mode functionality
export default function TestDarkMode() {
  return (
    <div className="min-h-screen bg-fx-bg p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-fx-text-primary">
          Dark Mode Test
        </h1>

        <div className="p-6 bg-fx-card border border-fx-border-default rounded-lg">
          <p className="text-fx-text-secondary mb-4">
            This card should change appearance in dark mode.
          </p>
          <ThemeToggle variant="button" />
        </div>

        <div className="space-y-2">
          <p className="text-fx-text-primary">Primary text</p>
          <p className="text-fx-text-secondary">Secondary text</p>
          <p className="text-fx-text-muted">Muted text</p>
        </div>
      </div>
    </div>
  )
}
