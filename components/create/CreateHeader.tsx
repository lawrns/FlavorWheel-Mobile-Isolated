'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateHeaderProps {
  title: string
  onBack?: () => void
  status?: 'saved' | 'saving' | 'error' | null
}

export function CreateHeader({ title, onBack, status }: CreateHeaderProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Auto-saved'
      case 'error':
        return 'Save failed'
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-fx-muted'
      case 'saved':
        return 'text-fx-text2'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-fx-muted'
    }
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-fx-bg/80 border-b border-fx-border">
      <div className="h-14 flex items-center gap-3 px-3 sm:px-4">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-10 w-10 p-0"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Title */}
        <h1
          className="text-fx-text text-3xl font-bold truncate text-center flex-1"
          style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
        >
          {title}
        </h1>

        {/* Status Badge */}
        {status && (
          <div className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        )}
      </div>
    </header>
  )
}
