'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkipToContentProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipToContent({ href, children, className }: SkipToContentProps) {
  return (
    <a
      href={href}
      className={cn(
        'skip-to-content focus-visible-enhanced',
        className
      )}
    >
      {children}
    </a>
  )
}

// SkipToContent component for main navigation
export function SkipNavigation() {
  return (
    <SkipToContent href="#main-content">
      Skip to main content
    </SkipToContent>
  )
}
