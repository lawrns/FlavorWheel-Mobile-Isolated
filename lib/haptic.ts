/**
 * Haptic Feedback Utilities for FlavorWheel
 * Provides tactile feedback for mobile tasting interactions
 */

// Haptic feedback types matching iOS/Android patterns
export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error'

// Check if haptic feedback is supported and available
export function isHapticSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    // Check for coarse pointer (touch) to avoid desktop vibration
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

// Vibration patterns for different haptic types
const VIBRATION_PATTERNS = {
  light: [10],           // Quick light tap
  medium: [20],          // Medium feedback
  heavy: [30],          // Strong feedback
  selection: [5, 5, 5], // Triple tap for selection
  success: [20, 10, 20], // Success pattern
  warning: [10, 10, 10, 10, 10], // Warning pattern
  error: [50, 10, 50, 10, 50] // Error pattern
} as const

/**
 * Trigger haptic feedback
 * @param type - The type of haptic feedback to trigger
 * @param options - Additional options
 */
export function triggerHaptic(
  type: HapticType,
  options: {
    skipReducedMotion?: boolean
    customPattern?: number[]
  } = {}
): void {
  const { skipReducedMotion = false, customPattern } = options

  // Skip if haptic is not supported
  if (!isHapticSupported()) {
    return
  }

  // Skip if user prefers reduced motion (unless explicitly requested)
  if (!skipReducedMotion && prefersReducedMotion()) {
    return
  }

  const pattern = customPattern || VIBRATION_PATTERNS[type]

  try {
    navigator.vibrate(pattern)
  } catch (error) {
    // Silently fail if vibration fails (e.g., permission denied)
    console.debug('Haptic feedback failed:', error)
  }
}

/**
 * Convenience functions for specific use cases
 */
export const haptic = {
  // Tasting interactions
  flavorSelect: () => triggerHaptic('selection'),
  intensityChange: () => triggerHaptic('light'),
  tastingComplete: () => triggerHaptic('success'),
  tastingStart: () => triggerHaptic('medium'),

  // Navigation
  buttonPress: () => triggerHaptic('light'),
  menuOpen: () => triggerHaptic('medium'),
  tabSwitch: () => triggerHaptic('selection'),

  // Wheel interactions
  wheelZoom: () => triggerHaptic('light'),
  categoryHover: () => triggerHaptic('selection'),
  descriptorSelect: () => triggerHaptic('medium'),

  // Form interactions
  formSubmit: () => triggerHaptic('success'),
  formError: () => triggerHaptic('error'),
  validationWarning: () => triggerHaptic('warning'),

  // Slider interactions
  sliderDrag: () => triggerHaptic('selection'),
  sliderMarkHit: () => triggerHaptic('light'),
  sliderComplete: () => triggerHaptic('medium')
}

/**
 * React hook for haptic feedback
 * Provides haptic functions that respect user preferences
 */
export function useHaptic() {
  const supported = isHapticSupported()
  const reducedMotion = prefersReducedMotion()

  const trigger = React.useCallback(
    (type: HapticType, options?: Parameters<typeof triggerHaptic>[1]) => {
      if (!supported) return
      if (reducedMotion && !options?.skipReducedMotion) return

      triggerHaptic(type, options)
    },
    [supported, reducedMotion]
  )

  return {
    trigger,
    supported,
    reducedMotion,
    ...haptic
  }
}

// React import for the hook
import React from 'react'



