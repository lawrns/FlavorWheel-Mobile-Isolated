'use client'

import React, { useEffect, useState } from 'react'
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

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (showTooltip && currentTooltipStep?.target) {
      const element = document.querySelector(currentTooltipStep.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        const position = calculateTooltipPosition(rect, currentTooltipStep.position || 'top')
        setTooltipPosition(position)
      }
    }
  }, [showTooltip, currentTooltipStep])

  const calculateTooltipPosition = (targetRect: DOMRect, position: string) => {
    const tooltipWidth = 320
    const tooltipHeight = 200
    const offset = 16

    switch (position) {
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - offset,
          left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        }
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2)
        }
      case 'left':
        return {
          top: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          left: targetRect.left - tooltipWidth - offset
        }
      case 'right':
        return {
          top: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2),
          left: targetRect.right + offset
        }
      case 'center':
      default:
        return {
          top: window.innerHeight / 2 - tooltipHeight / 2,
          left: window.innerWidth / 2 - tooltipWidth / 2
        }
    }
  }

  if (!showTooltip || !currentTooltipStep) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      {/* Overlay */}
      <div className="onboarding-overlay" />

      {/* Tooltip */}
      <div
        className="onboarding-tooltip"
        data-position={currentTooltipStep.position || 'center'}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
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
