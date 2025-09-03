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
      // Position tooltip relative to target element using CSS
      const element = document.querySelector(currentTooltipStep.target)
      if (element && tooltipRef.current) {
        const rect = element.getBoundingClientRect()
        const tooltip = tooltipRef.current

        // Position tooltip at target element's location
        tooltip.style.left = `${rect.left + rect.width / 2}px`
        tooltip.style.top = `${rect.top}px`
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
          transform: 'translate(-50%, -100%)', // Center horizontally, position above
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
