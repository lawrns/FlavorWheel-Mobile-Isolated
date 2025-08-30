'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'mexican' | 'difficulty'
    difficulty?: 'easy' | 'medium' | 'hard'
  }
>(({ className, value, variant = 'mexican', difficulty, ...props }, ref) => {
  const getTrackColor = () => {
    if (variant === 'mexican') return 'bg-progress-track'
    if (variant === 'difficulty') {
      switch (difficulty) {
        case 'easy':
          return 'bg-difficulty-easy/20'
        case 'medium':
          return 'bg-difficulty-medium/20'
        case 'hard':
          return 'bg-difficulty-hard/20'
        default:
          return 'bg-progress-track'
      }
    }
    return 'bg-secondary'
  }

  const getFillColor = () => {
    if (variant === 'mexican') return 'bg-progress-fill'
    if (variant === 'difficulty') {
      switch (difficulty) {
        case 'easy':
          return 'bg-difficulty-easy'
        case 'medium':
          return 'bg-difficulty-medium'
        case 'hard':
          return 'bg-difficulty-hard'
        default:
          return 'bg-progress-fill'
      }
    }
    return 'bg-primary'
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={typeof value === 'number' ? Math.max(0, Math.min(100, value)) : undefined}
      className={cn(
        'relative w-full overflow-hidden rounded-full',
        variant === 'mexican' ? 'h-2' : 'h-4',
        getTrackColor(),
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all duration-500 ease-out',
          getFillColor()
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
