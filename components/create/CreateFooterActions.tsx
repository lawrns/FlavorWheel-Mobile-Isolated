'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface CreateFooterActionsProps {
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  disabled?: boolean
  busy?: boolean
  statusMessage?: string
}

export function CreateFooterActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  disabled = false,
  busy = false,
  statusMessage
}: CreateFooterActionsProps) {
  const displayLabel = busy ? 'Creating...' : primaryLabel

  return (
    <div
      className="bg-background border border-border rounded-2xl shadow-sm p-4 sm:p-5 mt-8"
      role="region"
      aria-live="polite"
      data-testid="create-footer"
    >
      <div className="flex items-center gap-3">
        {/* Secondary Action */}
        {secondaryLabel && onSecondary && (
          <Button
            variant="ghost"
            onClick={onSecondary}
            disabled={disabled || busy}
            className="flex-1 h-12 px-4 rounded-lg border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary transition-all duration-normal ease-standard"
            aria-label={`Secondary action: ${secondaryLabel}`}
          >
            {secondaryLabel}
          </Button>
        )}

        {/* Primary Action */}
        <Button
          onClick={onPrimary}
          disabled={disabled || busy}
          className="flex-1 h-12 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary transition-all duration-normal ease-standard"
          id="create-primary-action"
          aria-label="Primary action: proceed"
          data-testid="create-primary-action"
        >
          {displayLabel}
        </Button>

        {/* Status Message */}
        {statusMessage && (
          <div className="sr-only" aria-live="polite">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  )
}
