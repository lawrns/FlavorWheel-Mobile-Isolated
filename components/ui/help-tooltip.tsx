'use client'

import React, { useState, useRef } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { Button } from './button'

interface HelpTooltipProps {
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: React.ReactNode
  className?: string
}

export function HelpTooltip({
  title,
  content,
  position = 'top',
  trigger,
  className = ''
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Calculate optimal position with viewport checking
  const calculateOptimalPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return position

    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const overflows = {
      top: triggerRect.top - tooltipRect.height - 16 < 0,
      bottom: triggerRect.bottom + tooltipRect.height + 16 > viewportHeight,
      left: triggerRect.left - tooltipRect.width - 16 < 0,
      right: triggerRect.right + tooltipRect.width + 16 > viewportWidth
    }

    // Smart position selection based on available space
    if (position === 'top' && overflows.top && !overflows.bottom) return 'bottom'
    if (position === 'bottom' && overflows.bottom && !overflows.top) return 'top'
    if (position === 'left' && overflows.left && !overflows.right) return 'right'
    if (position === 'right' && overflows.right && !overflows.left) return 'left'

    return position
  }

  const getPositionClasses = (optimalPosition: string) => {
    switch (optimalPosition) {
      case 'top':
        return 'tooltip-position-top'
      case 'bottom':
        return 'tooltip-position-bottom'
      case 'left':
        return 'tooltip-position-left'
      case 'right':
        return 'tooltip-position-right'
      default:
        return 'tooltip-position-top'
    }
  }

  const getArrowClasses = (optimalPosition: string) => {
    switch (optimalPosition) {
      case 'top':
        return 'tooltip-arrow-top'
      case 'bottom':
        return 'tooltip-arrow-bottom'
      case 'left':
        return 'tooltip-arrow-left'
      case 'right':
        return 'tooltip-arrow-right'
      default:
        return 'tooltip-arrow-top'
    }
  }

  const optimalPosition = calculateOptimalPosition()

  return (
    <div className={`relative inline-block ${className}`}>
      {trigger ? (
        <div ref={triggerRef} onClick={() => setIsVisible(!isVisible)}>
          {trigger}
        </div>
      ) : (
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      )}

      {isVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsVisible(false)}
          />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`absolute z-50 w-64 p-4 bg-card border border-border rounded-lg shadow-lg ${getPositionClasses(optimalPosition)}`}
          >
            {/* Arrow */}
            <div className={`absolute ${getArrowClasses(optimalPosition)}`} />

            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-foreground">{title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground -mr-2 -mt-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {content}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
