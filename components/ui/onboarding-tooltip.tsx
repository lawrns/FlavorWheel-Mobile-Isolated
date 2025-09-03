'use client'

import React, { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { Button } from './button'
import { useOnboarding } from '@/components/providers/onboarding-provider'

export function OnboardingTooltip() {
  const {
    showTooltip,
    currentTooltipStep,
    nextStep,
    prevStep,
    skipTour,
    currentStep,
    steps
  } = useOnboarding()

  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showTooltip && currentTooltipStep?.target) {
      const element = document.querySelector(currentTooltipStep.target)
      if (element && tooltipRef.current) {
        const rect = element.getBoundingClientRect()
        const tooltip = tooltipRef.current

        // Calculate optimal position with viewport boundary checking
        const tooltipRect = tooltip.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const margin = 16

        let left = rect.left + rect.width / 2
        let top = rect.top - tooltipRect.height - margin

        // Check if tooltip would go off-screen and adjust position
        if (top < margin) {
          // Position below if it would go off top
          top = rect.bottom + margin
        }

        if (left - tooltipRect.width / 2 < margin) {
          // Too far left, adjust to right edge
          left = rect.left + margin
        } else if (left + tooltipRect.width / 2 > viewportWidth - margin) {
          // Too far right, adjust to left edge
          left = rect.right - margin
        }

        // Apply positioning using CSS custom properties to avoid conflicts
        tooltip.style.setProperty('--tooltip-x', `${left}px`)
        tooltip.style.setProperty('--tooltip-y', `${top}px`)
        tooltip.style.left = `var(--tooltip-x)`
        tooltip.style.top = `var(--tooltip-y)`
        tooltip.style.transform = 'translate(-50%, 0)'
      }
    }
  }, [showTooltip, currentTooltipStep])

  if (!showTooltip || !currentTooltipStep) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      {/* Overlay */}
      <div className="onboarding-overlay" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="onboarding-tooltip"
        data-position={currentTooltipStep.position || 'center'}
        style={{
          position: 'fixed',
          pointerEvents: 'auto'
        }}
      >
        <div className="onboarding-tooltip-title">
          {currentTooltipStep.title}
        </div>

        <div className="onboarding-tooltip-description">
          {currentTooltipStep.description}
        </div>

        <div className="onboarding-tooltip-actions">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="flex items-center gap-1 ml-auto"
          >
            <SkipForward className="h-4 w-4" />
            Skip Tour
          </Button>

          <Button
            onClick={nextStep}
            size="sm"
            className="flex items-center gap-1"
          >
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="onboarding-progress">
        <div className="onboarding-progress-dots">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`onboarding-progress-dot ${
                index <= currentStep ? 'active' : ''
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
    </>
  )
}
