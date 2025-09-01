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
      className="bg-white border border-fx-border rounded-xl shadow-fx p-4 sm:p-5"
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
            className="flex-1 h-11 px-4 rounded-xl border border-fx-border bg-white text-fx-text hover:bg-[#F4F1EC]"
            aria-label={`Secondary action: ${secondaryLabel}`}
          >
            {secondaryLabel}
          </Button>
        )}

        {/* Primary Action */}
        <Button
          onClick={onPrimary}
          disabled={disabled || busy}
          className="flex-1 h-11 px-4 rounded-xl bg-fx-primary text-white hover:bg-fx-primaryHover disabled:opacity-50"
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
