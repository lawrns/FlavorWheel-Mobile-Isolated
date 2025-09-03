'use client'

import * as React from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon?: React.ReactNode
  illustration?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

interface OnboardingFlowProps {
  steps: OnboardingStep[]
  currentStep: number
  onComplete: () => void
  onSkip?: () => void
  showProgress?: boolean
  className?: string
}

export function OnboardingFlow({
  steps,
  currentStep,
  onComplete,
  onSkip,
  showProgress = true,
  className,
}: OnboardingFlowProps) {
  const controls = useAnimation()
  const [direction, setDirection] = React.useState(0)

  React.useEffect(() => {
    controls.start('visible')
  }, [currentStep, controls])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    const newStep = currentStep + newDirection
    if (newStep >= 0 && newStep < steps.length) {
      setDirection(newDirection)
      // Handle step change
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className={cn('relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Skip Button */}
      {onSkip && currentStep < steps.length - 1 && (
        <motion.button
          className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors duration-fast ease-standard"
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </motion.button>
      )}

      {/* Progress Indicator */}
      {showProgress && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full',
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                )}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1)
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1)
              }
            }}
            className="text-center"
          >
            {/* Icon/Illustration */}
            {currentStepData.illustration && (
              <motion.div
                className="mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                {currentStepData.illustration}
              </motion.div>
            )}

            {currentStepData.icon && !currentStepData.illustration && (
              <motion.div
                className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: 0.2,
                }}
              >
                {currentStepData.icon}
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {currentStepData.description}
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <button
                onClick={currentStepData.onAction || (() => {
                  if (currentStep === steps.length - 1) {
                    onComplete()
                  } else {
                    // Handle next step
                  }
                })}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-normal ease-standard shadow-lg hover:shadow-xl"
              >
                {currentStepData.actionLabel || (currentStep === steps.length - 1 ? 'Get Started' : 'Next')}
              </button>
            </motion.div>

            {/* Step Counter */}
            <motion.div
              className="mt-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              {currentStep + 1} of {steps.length}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Hints */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 text-muted-foreground">
        <motion.div
          animate={{ x: [-10, 0, -10] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span className="text-sm">Swipe</span>
        </motion.div>

        <motion.div
          animate={{ x: [10, 0, 10] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="flex items-center space-x-2"
        >
          <span className="text-sm">Swipe</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

interface OnboardingTooltipProps {
  children: React.ReactNode
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  show: boolean
  onClose: () => void
  className?: string
}

export function OnboardingTooltip({
  children,
  title,
  description,
  position = 'top',
  show,
  onClose,
  className,
}: OnboardingTooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className="relative">
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute z-50 w-72 p-4 bg-surface border border-border rounded-xl shadow-xl',
              positionClasses[position],
              className
            )}
          >
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4 border-border',
                arrowClasses[position]
              )}
            />

            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-muted transition-colors duration-fast ease-standard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
