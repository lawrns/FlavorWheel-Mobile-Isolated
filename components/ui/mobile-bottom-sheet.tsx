'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'half' | 'full'
  showHandle?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  closeOnBackdropClick = true,
  className = ''
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const shouldClose = info.velocity.y > 20 || (info.velocity.y >= 0 && info.offset.y > 100)
    if (shouldClose) {
      onClose()
    }
  }

  const getHeightClass = () => {
    switch (height) {
      case 'half':
        return 'max-h-[50vh]'
      case 'full':
        return 'max-h-[90vh]'
      default:
        return 'max-h-[80vh]'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeOnBackdropClick ? onClose : undefined}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl',
              'md:hidden', // Only show on mobile
              getHeightClass(),
              className
            )}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  )}
                </div>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Quick Action Bottom Sheet for common mobile actions
interface QuickActionSheetProps {
  isOpen: boolean
  onClose: () => void
  actions: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive'
  }>
  title?: string
}

export function QuickActionSheet({
  isOpen,
  onClose,
  actions,
  title = 'Quick Actions'
}: QuickActionSheetProps) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="auto"
    >
      <div className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
            className="w-full justify-start h-12 px-4 text-base"
            onClick={() => {
              action.onClick()
              onClose()
            }}
          >
            {action.icon && <span className="mr-3">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    </MobileBottomSheet>
  )
}

// Form Bottom Sheet for mobile-optimized forms
interface FormBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  showSubmit?: boolean
}

export function FormBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  showSubmit = true
}: FormBottomSheetProps) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      height="full"
    >
      <div className="space-y-6">
        {children}

        {showSubmit && onSubmit && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 h-12 bg-fx-accent hover:bg-fx-accent-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        )}
      </div>
    </MobileBottomSheet>
  )
}

// Swipeable Card for mobile interactions
interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: {
    label: string
    icon?: React.ReactNode
    color?: string
  }
  rightAction?: {
    label: string
    icon?: React.ReactNode
    color?: string
  }
  className?: string
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    setIsDragging(false)

    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (info.offset.x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    setSwipeOffset(0)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Action Backgrounds */}
      {leftAction && (
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex items-center justify-center px-4',
            leftAction.color || 'bg-red-500'
          )}
          style={{
            transform: `translateX(${Math.max(0, swipeOffset)}px)`,
            width: Math.abs(swipeOffset)
          }}
        >
          {leftAction.icon && <span className="mr-2">{leftAction.icon}</span>}
          <span className="text-white font-medium text-sm">{leftAction.label}</span>
        </div>
      )}

      {rightAction && (
        <div
          className={cn(
            'absolute inset-y-0 left-0 flex items-center justify-center px-4',
            rightAction.color || 'bg-green-500'
          )}
          style={{
            transform: `translateX(${Math.min(0, swipeOffset)}px)`,
            width: Math.abs(swipeOffset)
          }}
        >
          {rightAction.icon && <span className="mr-2">{rightAction.icon}</span>}
          <span className="text-white font-medium text-sm">{rightAction.label}</span>
        </div>
      )}

      {/* Main Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDrag={(event, info) => setSwipeOffset(info.offset.x)}
        onDragEnd={handleDragEnd}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 p-4',
          'touch-manipulation cursor-grab active:cursor-grabbing',
          isDragging && 'shadow-lg',
          className
        )}
        style={{
          x: swipeOffset,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
