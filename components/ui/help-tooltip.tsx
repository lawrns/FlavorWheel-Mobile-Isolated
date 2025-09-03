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
    const baseOffset = 12 // Increased offset for better spacing

    switch (optimalPosition) {
      case 'top':
        return `bottom-full left-1/2 transform -translate-x-1/2 mb-${baseOffset / 4}`
      case 'bottom':
        return `top-full left-1/2 transform -translate-x-1/2 mt-${baseOffset / 4}`
      case 'left':
        return `right-full top-1/2 transform -translate-y-1/2 mr-${baseOffset / 4}`
      case 'right':
        return `left-full top-1/2 transform -translate-y-1/2 ml-${baseOffset / 4}`
      default:
        return `bottom-full left-1/2 transform -translate-x-1/2 mb-${baseOffset / 4}`
    }
  }

  const getArrowClasses = (optimalPosition: string) => {
    switch (optimalPosition) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent'
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
            <div
              className={`absolute w-0 h-0 border-4 border-border ${getArrowClasses(optimalPosition)}`}
              style={{
                borderColor: optimalPosition === 'top' ? 'transparent transparent var(--fx-border) transparent' :
                           optimalPosition === 'bottom' ? 'var(--fx-border) transparent transparent transparent' :
                           optimalPosition === 'left' ? 'transparent transparent transparent var(--fx-border)' :
                           'transparent var(--fx-border) transparent transparent'
              }}
            />

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
