'use client'

import React, { useState } from 'react'
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

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    }
  }

  const getArrowClasses = () => {
    switch (position) {
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

  return (
    <div className={`relative inline-block ${className}`}>
      {trigger ? (
        <div onClick={() => setIsVisible(!isVisible)}>
          {trigger}
        </div>
      ) : (
        <Button
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
            className={`absolute z-50 w-64 p-4 bg-card border border-border rounded-lg shadow-lg ${getPositionClasses()}`}
          >
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 border-border ${getArrowClasses()}`}
              style={{
                borderColor: position === 'top' ? 'transparent transparent var(--fx-border) transparent' :
                           position === 'bottom' ? 'var(--fx-border) transparent transparent transparent' :
                           position === 'left' ? 'transparent transparent transparent var(--fx-border)' :
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
