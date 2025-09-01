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
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-fx-border shadow-medium p-4 sm:p-5 pb-safe"
      role="region"
      aria-live="polite"
      data-testid="create-footer"
    >
      <div className="max-w-[768px] mx-auto flex items-center gap-3">
        {/* Secondary Action */}
        {secondaryLabel && onSecondary && (
          <Button
            variant="ghost"
            onClick={onSecondary}
            disabled={disabled || busy}
            className="flex-1 h-12 px-4 rounded-xl border border-fx-border bg-white text-fx-text hover:bg-fx-bg focus-enhanced transition-all duration-200"
            aria-label={`Secondary action: ${secondaryLabel}`}
          >
            {secondaryLabel}
          </Button>
        )}

        {/* Primary Action */}
        <Button
          onClick={onPrimary}
          disabled={disabled || busy}
          className="flex-1 h-12 px-4 rounded-xl bg-fx-primary text-white hover:bg-fx-primaryHover disabled:opacity-50 focus-enhanced btn-primary"
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
