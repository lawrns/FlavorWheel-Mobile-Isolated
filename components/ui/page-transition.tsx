'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 1.02,
    y: -20,
  },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={cn('min-h-screen', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface SlideTransitionProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
}

const slideVariants = {
  left: {
    initial: { x: '100%', opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '-100%', opacity: 0 },
    in: { x: 0, opacity: 1 },
    out: { x: '100%', opacity: 0 },
  },
  up: {
    initial: { y: '100%', opacity: 0 },
    in: { y: 0, opacity: 1 },
    out: { y: '-100%', opacity: 0 },
  },
  down: {
    initial: { y: '-100%', opacity: 0 },
    in: { y: 0, opacity: 1 },
    out: { y: '100%', opacity: 0 },
  },
}

export function SlideTransition({ children, direction = 'right', className }: SlideTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={slideVariants[direction]}
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.3,
        }}
        className={cn('min-h-screen', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface ScaleTransitionProps {
  children: React.ReactNode
  className?: string
}

export function ScaleTransition({ children, className }: ScaleTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.4,
        }}
        className={cn('min-h-screen', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

interface StaggeredTransitionProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggeredTransition({
  children,
  staggerDelay = 0.1,
  className
}: StaggeredTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={cn('min-h-screen', className)}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: staggerDelay,
              staggerDirection: -1,
            },
          },
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.4,
                  ease: 'easeOut',
                },
              },
              exit: {
                opacity: 0,
                y: -20,
                transition: {
                  duration: 0.2,
                  ease: 'easeIn',
                },
              },
            }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

interface LoadingTransitionProps {
  children: React.ReactNode
  isLoading: boolean
  loadingComponent?: React.ReactNode
  className?: string
}

export function LoadingTransition({
  children,
  isLoading,
  loadingComponent,
  className
}: LoadingTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('flex items-center justify-center min-h-screen', className)}
        >
          {loadingComponent || (
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="w-4 h-4 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />
              <motion.div
                className="w-4 h-4 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
              />
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ModalTransitionProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ModalTransition({
  children,
  isOpen,
  onClose,
  className
}: ModalTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.4,
            }}
            className={cn(
              'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-md mx-4',
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface TabTransitionProps {
  children: React.ReactNode
  activeTab: string | number
  className?: string
}

export function TabTransition({ children, activeTab, className }: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          type: 'tween',
          ease: 'easeInOut',
          duration: 0.3,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
