'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X } from 'lucide-react'

interface FormTooltipProps {
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function FormTooltip({ content, title, position = 'top' }: FormTooltipProps) {
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

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="ml-2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
        aria-label="Show help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg p-4 max-w-xs">
              {title && (
                <h4 className="font-semibold text-sm mb-2 text-popover-foreground">
                  {title}
                </h4>
              )}
              <p className="text-sm text-muted-foreground">
                {content}
              </p>
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close tooltip"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Quick help button for form sections
export function QuickHelp({ content, title }: { content: string; title?: string }) {
  return (
    <FormTooltip
      content={content}
      title={title}
      position="top"
    />
  )
}
