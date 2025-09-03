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
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let top: number, left: number

    switch (position) {
      case 'top':
        top = targetRect.top + scrollY - tooltipHeight - offset
        left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipWidth / 2)
        break
      case 'bottom':
        top = targetRect.bottom + scrollY + offset
        left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipWidth / 2)
        break
      case 'left':
        top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipHeight / 2)
        left = targetRect.left + scrollX - tooltipWidth - offset
        break
      case 'right':
        top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipHeight / 2)
        left = targetRect.right + scrollX + offset
        break
      case 'center':
      default:
        top = scrollY + (viewportHeight / 2) - tooltipHeight / 2
        left = scrollX + (viewportWidth / 2) - tooltipWidth / 2
        break
    }

    // Adjust for viewport boundaries with proper fallback positioning
    const adjustedPosition = adjustTooltipForViewport(
      { top, left, width: tooltipWidth, height: tooltipHeight },
      { width: viewportWidth, height: viewportHeight, scrollX, scrollY },
      targetRect,
      position
    )

    return adjustedPosition
  }

  // Helper function to adjust tooltip position to stay within viewport
  const adjustTooltipForViewport = (
    tooltipRect: { top: number; left: number; width: number; height: number },
    viewport: { width: number; height: number; scrollX: number; scrollY: number },
    targetRect: DOMRect,
    preferredPosition: string
  ) => {
    const { top, left, width, height } = tooltipRect
    const { width: viewportWidth, height: viewportHeight, scrollX, scrollY } = viewport

    // Check boundaries
    const overflowsRight = left + width > scrollX + viewportWidth
    const overflowsLeft = left < scrollX
    const overflowsBottom = top + height > scrollY + viewportHeight
    const overflowsTop = top < scrollY

    let adjustedTop = top
    let adjustedLeft = left

    // Horizontal adjustments
    if (overflowsRight) {
      adjustedLeft = scrollX + viewportWidth - width - 8
    } else if (overflowsLeft) {
      adjustedLeft = scrollX + 8
    }

    // Vertical adjustments with position flipping when necessary
    if (overflowsBottom && preferredPosition === 'top') {
      // If preferred top position overflows bottom, flip to bottom
      adjustedTop = targetRect.bottom + scrollY + 16
    } else if (overflowsTop && preferredPosition === 'bottom') {
      // If preferred bottom position overflows top, flip to top
      adjustedTop = targetRect.top + scrollY - height - 16
    } else if (overflowsBottom) {
      adjustedTop = scrollY + viewportHeight - height - 8
    } else if (overflowsTop) {
      adjustedTop = scrollY + 8
    }

    return { top: adjustedTop, left: adjustedLeft }
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
