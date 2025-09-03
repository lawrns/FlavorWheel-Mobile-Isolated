'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GestureCardProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  dragEnabled?: boolean
  tapEnabled?: boolean
  swipeThreshold?: number
}

export function GestureCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  dragEnabled = true,
  tapEnabled = true,
  swipeThreshold = 100,
}: GestureCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0.5, 1, 1, 1, 0.5])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x

    if (Math.abs(offset) > swipeThreshold) {
      if (offset > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    // Reset position with spring animation
    x.set(0)
  }

  const handleTap = () => {
    onTap?.()
  }

  return (
    <motion.div
      className={cn('relative', className)}
      style={{ x, rotate }}
      drag={dragEnabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={tapEnabled ? { scale: 0.95 } : {}}
      onTap={tapEnabled ? handleTap : undefined}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.div
        style={{ opacity }}
        className="bg-surface border border-border rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-normal ease-standard"
      >
        {children}
      </motion.div>

      {/* Swipe Indicators */}
      {dragEnabled && (
        <>
          {/* Left Swipe Indicator */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 opacity-0 pointer-events-none"
            animate={{
              opacity: x.get() < -50 ? 1 : 0,
              x: x.get() < -50 ? -20 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.div>

          {/* Right Swipe Indicator */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 opacity-0 pointer-events-none"
            animate={{
              opacity: x.get() > 50 ? 1 : 0,
              x: x.get() > 50 ? 20 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
