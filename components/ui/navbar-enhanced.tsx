'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  href?: string
  onClick?: () => void
}

interface NavbarEnhancedProps {
  items: NavItem[]
  activeItem?: string
  className?: string
  onItemClick?: (itemId: string) => void
}

export function NavbarEnhanced({
  items,
  activeItem,
  className,
  onItemClick
}: NavbarEnhancedProps) {
  const [activeTab, setActiveTab] = React.useState(activeItem || items[0]?.id)
  const [underlineWidth, setUnderlineWidth] = React.useState(0)
  const [underlineLeft, setUnderlineLeft] = React.useState(0)
  const tabRefs = React.useRef<Record<string, HTMLButtonElement>>({})

  React.useEffect(() => {
    if (activeItem) {
      setActiveTab(activeItem)
    }
  }, [activeItem])

  React.useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const rect = activeTabElement.getBoundingClientRect()
      const parentRect = activeTabElement.parentElement?.getBoundingClientRect()

      if (parentRect) {
        setUnderlineWidth(rect.width)
        setUnderlineLeft(rect.left - parentRect.left)
      }
    }
  }, [activeTab])

  const handleItemClick = (item: NavItem) => {
    setActiveTab(item.id)
    onItemClick?.(item.id)
    item.onClick?.()
  }

  return (
    <nav
      className={cn(
        'flex items-center justify-between px-6 py-3 border-b border-border bg-background',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo/Brand */}
      <div className="flex-shrink-0">
        <h1 className="text-h6 font-bold text-foreground">FlavorWheel</h1>
      </div>

      {/* Navigation Items */}
      <div className="relative flex items-center space-x-1">
        {items.map((item) => (
          <button
            key={item.id}
            ref={(el) => {
              if (el) tabRefs.current[item.id] = el
            }}
            onClick={() => handleItemClick(item)}
            className={cn(
              'relative px-4 py-2 text-body-sm font-medium transition-all duration-normal ease-standard rounded-md focus-visible-enhanced',
              activeTab === item.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}

        {/* Animated Underline */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
          style={{
            width: underlineWidth,
            x: underlineLeft,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <button
          className="p-2 rounded-md hover:bg-muted transition-colors duration-fast ease-standard focus-visible-enhanced"
          aria-label="Toggle theme"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>
      </div>
    </nav>
  )
}
