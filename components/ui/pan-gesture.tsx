'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PanGestureProps {
  children: React.ReactNode
  className?: string
  onPanStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void
  onPan?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void
  onPanEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void
  dragConstraints?: { left?: number; right?: number; top?: number; bottom?: number }
  dragElastic?: number | boolean
  dragMomentum?: boolean
  panEnabled?: boolean
}

export function PanGesture({
  children,
  className,
  onPanStart,
  onPan,
  onPanEnd,
  dragConstraints = { left: -50, right: 50, top: -50, bottom: 50 },
  dragElastic = 0.3,
  dragMomentum = true,
  panEnabled = true,
}: PanGestureProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-50, 50], [15, -15])
  const rotateY = useTransform(x, [-50, 50], [-15, 15])
  const scale = useTransform([x, y], ([x, y]) => 1 - Math.abs(x + y) / 200)

  return (
    <motion.div
      className={cn('relative cursor-grab active:cursor-grabbing', className)}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        scale,
      }}
      drag={panEnabled}
      dragConstraints={dragConstraints}
      dragElastic={dragElastic}
      dragMomentum={dragMomentum}
      whileDrag={{ scale: 1.05 }}
      onPanStart={onPanStart}
      onPan={onPan}
      onPanEnd={(event, info) => {
        // Reset position with spring animation
        x.set(0)
        y.set(0)
        onPanEnd?.(event, info)
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  )
}

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  strength?: number
  range?: number
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  range = 100,
}: MagneticButtonProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) / range
    const deltaY = (e.clientY - centerY) / range

    x.set(deltaX * strength * range)
    y.set(deltaY * strength * range)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      className={cn('relative', className)}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.button>
  )
}
