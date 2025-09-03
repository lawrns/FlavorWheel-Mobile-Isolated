'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from './button'
import { motion, AnimatePresence } from 'framer-motion'

interface ProgressiveDisclosureProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  variant?: 'default' | 'card' | 'minimal'
  className?: string
}

export function ProgressiveDisclosure({
  title,
  children,
  defaultOpen = false,
  variant = 'default',
  className = ''
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'card-beautiful p-4'
      case 'minimal':
        return 'p-2'
      default:
        return 'border border-border rounded-lg p-4'
    }
  }

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between p-0 h-auto text-left"
      >
        <span className="font-medium text-foreground">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FeatureDiscoveryProps {
  feature: string
  description: string
  icon: React.ReactNode
  onDiscover: () => void
  className?: string
}

export function FeatureDiscovery({
  feature,
  description,
  icon,
  onDiscover,
  className = ''
}: FeatureDiscoveryProps) {
  const [isDiscovered, setIsDiscovered] = useState(false)

  const handleDiscover = () => {
    setIsDiscovered(true)
    onDiscover()
  }

  if (isDiscovered) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`card-beautiful p-4 relative ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            Discover: {feature}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            {description}
          </p>
          <Button
            onClick={handleDiscover}
            size="sm"
            className="btn-accent-beautiful"
          >
            Try it now
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDiscovered(true)}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent/5 to-primary/5 pointer-events-none" />
    </motion.div>
  )
}
