'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Minus, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProgressiveDisclosureProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  level?: 'primary' | 'secondary' | 'tertiary'
  variant?: 'accordion' | 'expandable' | 'stepped' | 'tabbed'
  icon?: React.ReactNode
  badge?: string | number
  description?: string
  className?: string
  onToggle?: (isOpen: boolean) => void
  disabled?: boolean
  showLine?: boolean
  animationType?: 'slide' | 'fade' | 'scale'
}

export function ProgressiveDisclosure({
  title,
  children,
  defaultOpen = false,
  level = 'primary',
  variant = 'accordion',
  icon,
  badge,
  description,
  className = '',
  onToggle,
  disabled = false,
  showLine = false,
  animationType = 'slide'
}: ProgressiveDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  const handleToggle = () => {
    if (disabled) return
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  const levelStyles = {
    primary: {
      title: 'text-lg font-semibold text-card-text-primary',
      description: 'text-card-text-secondary',
      border: 'border-card-border-default',
      hover: 'hover:bg-fx-bg-subtle hover:border-fx-accent'
    },
    secondary: {
      title: 'text-base font-medium text-card-text-primary',
      description: 'text-sm text-card-text-secondary',
      border: 'border-card-border-subtle',
      hover: 'hover:bg-fx-bg-subtle hover:border-card-border-default'
    },
    tertiary: {
      title: 'text-sm font-medium text-card-text-primary',
      description: 'text-xs text-fx-text-muted',
      border: 'border-card-border-subtle',
      hover: 'hover:bg-fx-bg-subtle'
    }
  }

  const renderToggleIcon = () => {
    switch (variant) {
      case 'accordion':
        return (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        )
      case 'expandable':
        return isOpen ? (
          <Minus className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )
      case 'stepped':
        return (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
        )
      default:
        return <ChevronDown className="h-4 w-4" />
    }
  }

  const getAnimationVariants = () => {
    switch (animationType) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        }
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { opacity: 1, scale: 1 }
        }
      default: // slide
        return {
          hidden: { opacity: 0, height: 0, y: -10 },
          visible: { opacity: 1, height: 'auto', y: 0 }
        }
    }
  }

  const animationVariants = getAnimationVariants()

  return (
    <div className={cn('relative', className)}>
      {/* Connector Line */}
      {showLine && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-fx-border-subtle" />
      )}

      {/* Header */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left rounded-lg border transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-fx-accent focus:ring-offset-2',
          'touch-manipulation min-h-[60px]',
          levelStyles[level].border,
          !disabled && levelStyles[level].hover,
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-expanded={isOpen}
        aria-controls={`disclosure-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn('truncate', levelStyles[level].title)}>
                {title}
              </h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className={cn('mt-1 truncate', levelStyles[level].description)}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toggle Icon */}
        <div className="flex-shrink-0 ml-3">
          {renderToggleIcon()}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={`disclosure-${title.replace(/\s+/g, '-').toLowerCase()}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={animationVariants}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
              opacity: { duration: 0.2 }
            }}
            className={cn(
              'overflow-hidden',
              animationType === 'slide' && 'border-l-2 border-l-fx-accent ml-6 pl-4'
            )}
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

// Advanced Progressive Form with step-by-step disclosure
interface ProgressiveFormProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    required?: boolean
    content: React.ReactNode
    validation?: () => boolean
  }>
  onComplete: (data: any) => void
  onStepChange?: (stepIndex: number) => void
  allowSkip?: boolean
  showProgress?: boolean
  className?: string
}

export function ProgressiveForm({
  steps,
  onComplete,
  onStepChange,
  allowSkip = true,
  showProgress = true,
  className = ''
}: ProgressiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState<Record<string, any>>({})

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (currentStepData?.validation && !currentStepData.validation()) {
      return // Don't proceed if validation fails
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]))

    if (isLastStep) {
      onComplete(formData)
    } else {
      setCurrentStep(prev => prev + 1)
      onStepChange?.(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      onStepChange?.(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (allowSkip && !currentStepData?.required) {
      handleNext()
    }
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-card-text-primary">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-card-text-secondary">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-fx-bg-subtle rounded-full h-2">
            <motion.div
              className="bg-fx-accent h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2',
                  index < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                      ? 'bg-fx-accent border-fx-accent text-white'
                      : 'bg-white border-card-border-default text-card-text-secondary'
                )}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                {index === currentStep && (
                  <div className="ml-2 text-sm font-medium text-card-text-primary">
                    {step.title}
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-0.5 mx-2',
                  index < currentStep ? 'bg-green-500' : 'bg-fx-border-default'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.title}
                {currentStepData.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </CardTitle>
              {currentStepData.description && (
                <p className="text-card-text-secondary">{currentStepData.description}</p>
              )}
            </CardHeader>
            <CardContent>
              {currentStepData.content}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Previous
        </Button>

        <div className="flex gap-2">
          {allowSkip && !currentStepData?.required && !isLastStep && (
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
          )}

          <Button
            onClick={handleNext}
            className="bg-fx-accent hover:bg-fx-accent-hover"
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Contextual Help Disclosure
interface ContextualHelpProps {
  title: string
  content: React.ReactNode
  trigger?: 'hover' | 'click' | 'focus'
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function ContextualHelp({
  title,
  content,
  trigger = 'click',
  placement = 'top',
  className = ''
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false)

  const placementClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
        onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        onFocus={() => trigger === 'focus' && setIsOpen(true)}
        onBlur={() => trigger === 'focus' && setIsOpen(false)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-fx-bg-subtle hover:bg-fx-accent/10 text-card-text-secondary hover:text-fx-accent transition-colors"
        aria-label={`Help: ${title}`}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                'absolute z-50 w-64 p-4 bg-white rounded-lg shadow-lg border border-card-border-default',
                placementClasses[placement]
              )}
            >
              <div className="text-sm">
                <h4 className="font-medium text-card-text-primary mb-2">{title}</h4>
                <div className="text-card-text-secondary">{content}</div>
              </div>

              {/* Arrow */}
              <div className={cn(
                'absolute w-2 h-2 bg-white border',
                placement === 'top' && 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l border-t border-card-border-default',
                placement === 'bottom' && 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-r border-b border-card-border-default',
                placement === 'left' && 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t border-l border-card-border-default',
                placement === 'right' && 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-b border-r border-card-border-default'
              )} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Advanced disclosure with multiple levels
interface NestedDisclosureProps {
  items: Array<{
    id: string
    title: string
    content: React.ReactNode
    children?: Array<{
      id: string
      title: string
      content: React.ReactNode
    }>
  }>
  className?: string
}

export function NestedDisclosure({ items, className = '' }: NestedDisclosureProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <ProgressiveDisclosure
          key={item.id}
          title={item.title}
          variant="stepped"
          level={index === 0 ? 'primary' : 'secondary'}
          showLine={item.children && item.children.length > 0}
        >
          <div className="space-y-4">
            {item.content}

            {item.children && item.children.length > 0 && (
              <div className="ml-6 space-y-3">
                {item.children.map((child) => (
                  <ProgressiveDisclosure
                    key={child.id}
                    title={child.title}
                    variant="expandable"
                    level="tertiary"
                  >
                    {child.content}
                  </ProgressiveDisclosure>
                ))}
              </div>
            )}
          </div>
        </ProgressiveDisclosure>
      ))}
    </div>
  )
}

// Feature Discovery Component for highlighting new features
interface FeatureDiscoveryProps {
  feature: string
  description: string
  icon: React.ReactNode
  onDiscover?: () => void
  className?: string
  dismissed?: boolean
  onDismiss?: () => void
}

export function FeatureDiscovery({
  feature,
  description,
  icon,
  onDiscover,
  className = '',
  dismissed = false,
  onDismiss
}: FeatureDiscoveryProps) {
  const [isVisible, setIsVisible] = useState(!dismissed)

  useEffect(() => {
    setIsVisible(!dismissed)
  }, [dismissed])

  const handleDiscover = () => {
    onDiscover?.()
    onDismiss?.()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            New Feature: {feature}
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            {description}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleDiscover}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try it now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onDismiss?.()
                setIsVisible(false)
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}