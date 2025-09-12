'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'default' | 'card' | 'list' | 'text' | 'avatar'
  lines?: number
  showAvatar?: boolean
  animate?: boolean
}

export function SkeletonLoader({
  className = '',
  variant = 'default',
  lines = 3,
  showAvatar = false,
  animate = true
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gradient-to-r from-fx-bg-subtle via-fx-bg-muted to-fx-bg-subtle rounded'

  const animationClasses = animate
    ? 'animate-pulse'
    : ''

  switch (variant) {
    case 'card':
      return (
        <div className={cn('bg-fx-bg-primary rounded-lg shadow-sm border border-fx-border-subtle p-4', className)}>
          {showAvatar && (
            <div className="flex items-center space-x-3 mb-4">
              <div className={cn('w-10 h-10 rounded-full', baseClasses, animationClasses)} />
              <div className="flex-1 space-y-2">
                <div className={cn('h-4 w-3/4', baseClasses, animationClasses)} />
                <div className={cn('h-3 w-1/2', baseClasses, animationClasses)} />
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className={cn('h-4 w-full', baseClasses, animationClasses)} />
            <div className={cn('h-4 w-5/6', baseClasses, animationClasses)} />
            <div className={cn('h-4 w-4/6', baseClasses, animationClasses)} />
          </div>
        </div>
      )

    case 'list':
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: lines }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              {showAvatar && (
                <div className={cn('w-8 h-8 rounded-full flex-shrink-0', baseClasses, animationClasses)} />
              )}
              <div className="flex-1 space-y-2">
                <div className={cn('h-4 w-full', baseClasses, animationClasses)} />
                <div className={cn('h-3 w-2/3', baseClasses, animationClasses)} />
              </div>
            </div>
          ))}
        </div>
      )

    case 'text':
      return (
        <div className={cn('space-y-2', className)}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-4 rounded',
                baseClasses,
                animationClasses,
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      )

    case 'avatar':
      return (
        <div className={cn('flex items-center space-x-3', className)}>
          <div className={cn('w-12 h-12 rounded-full', baseClasses, animationClasses)} />
          <div className="flex-1 space-y-2">
            <div className={cn('h-4 w-1/2', baseClasses, animationClasses)} />
            <div className={cn('h-3 w-1/3', baseClasses, animationClasses)} />
          </div>
        </div>
      )

    default:
      return (
        <div className={cn(baseClasses, animationClasses, className)} />
      )
  }
}

// Specialized skeleton for flavor wheel loading
export function FlavorWheelSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-fx-bg-muted rounded-lg">
      <div className="relative w-64 h-64 mb-6">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-fx-border-subtle" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-fx-border-primary animate-spin" />

        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-fx-bg-subtle rounded-full animate-pulse" />
        </div>

        {/* Flavor segments */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="absolute inset-0 animate-pulse"
            style={{
              transform: `rotate(${index * 45}deg)`,
              transformOrigin: 'center'
            }}
          >
            <div className="w-1 h-20 bg-fx-bg-subtle rounded-full mx-auto mt-4" />
          </div>
        ))}
      </div>

      <div className="text-center space-y-2">
        <SkeletonLoader className="h-6 w-48 mx-auto" />
        <SkeletonLoader className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}

// Skeleton for tasting cards
export function TastingCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <SkeletonLoader variant="card" showAvatar className="h-48" />
        </motion.div>
      ))}
    </div>
  )
}

// Skeleton for dashboard stats
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-fx-bg-primary p-6 rounded-lg shadow-sm border border-fx-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <SkeletonLoader className="h-8 w-8 rounded" />
            <SkeletonLoader className="h-6 w-16" />
          </div>
          <SkeletonLoader className="h-8 w-12 mb-2" />
          <SkeletonLoader className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

// Skeleton for form loading
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <SkeletonLoader className="h-10 flex-1" />
        <SkeletonLoader className="h-10 flex-1" />
      </div>
    </div>
  )
}

// Progressive loading component
interface ProgressiveLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  delay?: number
}

export function ProgressiveLoader({
  isLoading,
  children,
  skeleton,
  delay = 0
}: ProgressiveLoaderProps) {
  const [showSkeleton, setShowSkeleton] = React.useState(false)

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay)
      return () => clearTimeout(timer)
    } else {
      setShowSkeleton(false)
    }
  }, [isLoading, delay])

  if (isLoading && showSkeleton) {
    return <>{skeleton}</>
  }

  if (isLoading) {
    return null // Don't show anything initially for better UX
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect for more sophisticated loading
export function ShimmerLoader({ className = '' }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden bg-fx-bg-subtle rounded', className)}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-fx-bg-primary to-transparent"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}

// Loading states for different content types
export const LoadingStates = {
  FlavorWheel: FlavorWheelSkeleton,
  TastingCard: TastingCardSkeleton,
  DashboardStats: DashboardStatsSkeleton,
  Form: FormSkeleton,
  Text: () => <SkeletonLoader variant="text" lines={3} />,
  Avatar: () => <SkeletonLoader variant="avatar" />,
  List: () => <SkeletonLoader variant="list" lines={5} />,
  Card: () => <SkeletonLoader variant="card" />
}
