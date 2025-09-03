'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  variant?: 'default' | 'minimal' | 'playful' | 'search' | 'error'
  animate?: boolean
  className?: string
}

const emptyStateVariants = {
  default: {
    container: 'py-16 px-6 text-center',
    icon: 'w-16 h-16 text-muted-foreground mb-6',
    title: 'text-2xl font-semibold text-foreground mb-3',
    description: 'text-muted-foreground max-w-sm mx-auto',
  },
  minimal: {
    container: 'py-8 px-4 text-center',
    icon: 'w-12 h-12 text-muted-foreground mb-4',
    title: 'text-lg font-medium text-foreground mb-2',
    description: 'text-muted-foreground text-sm max-w-xs mx-auto',
  },
  playful: {
    container: 'py-20 px-6 text-center',
    icon: 'w-20 h-20 text-primary mb-8',
    title: 'text-3xl font-bold text-foreground mb-4',
    description: 'text-muted-foreground text-lg max-w-md mx-auto',
  },
  search: {
    container: 'py-16 px-6 text-center',
    icon: 'w-16 h-16 text-muted-foreground mb-6',
    title: 'text-xl font-semibold text-foreground mb-3',
    description: 'text-muted-foreground max-w-md mx-auto',
  },
  error: {
    container: 'py-16 px-6 text-center',
    icon: 'w-16 h-16 text-red-500 mb-6',
    title: 'text-2xl font-semibold text-foreground mb-3',
    description: 'text-muted-foreground max-w-sm mx-auto',
  },
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  animate = true,
  className,
}: EmptyStateProps) {
  const styles = emptyStateVariants[variant]

  if (!animate) {
    return (
      <div className={cn(styles.container, className)}>
        {icon && (
          <div className={styles.icon}>
            {icon}
          </div>
        )}

        <h3 className={styles.title}>
          {title}
        </h3>

        <p className={styles.description}>
          {description}
        </p>

        {action && (
          <div className="mt-6">
            {action}
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(styles.container, className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Animated Icon */}
      {icon && (
        <motion.div
          className={styles.icon}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
        >
          {variant === 'playful' ? (
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {icon}
            </motion.div>
          ) : variant === 'search' ? (
            <motion.div
              animate={{
                x: [0, -5, 5, -5, 0],
                scale: [1, 1.05, 1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {icon}
            </motion.div>
          ) : (
            icon
          )}
        </motion.div>
      )}

      {/* Animated Title */}
      <motion.h3
        className={styles.title}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {title}
      </motion.h3>

      {/* Animated Description */}
      <motion.p
        className={styles.description}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {description}
      </motion.p>

      {/* Animated Action */}
      {action && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {action}
        </motion.div>
      )}

      {/* Background Elements for Playful Variant */}
      {variant === 'playful' && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />
        </>
      )}
    </motion.div>
  )
}

// Specialized empty state components
export function EmptyList({
  title = "No items yet",
  description = "Get started by adding your first item.",
  action,
  animate = true,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  animate?: boolean
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      }
      title={title}
      description={description}
      action={action}
      animate={animate}
    />
  )
}

export function EmptySearch({
  query,
  onClear,
  animate = true,
}: {
  query: string
  onClear?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="search"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13l6 6" />
        </svg>
      }
      title="No results found"
      description={`We couldn't find any results for "${query}". Try adjusting your search terms.`}
      action={
        onClear && (
          <button
            onClick={onClear}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-fast ease-standard"
          >
            Clear search
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptyError({
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again.",
  onRetry,
  animate = true,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="error"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      }
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors duration-fast ease-standard"
          >
            Try again
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptyPlayful({
  title = "Welcome aboard!",
  description = "Let's get you started with something amazing.",
  action,
  animate = true,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="playful"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H13a1 1 0 011 1v1a1 1 0 01-1 1h-1.414a1 1 0 00-.707.293l-.707.707A1 1 0 009.586 15H9a1 1 0 01-1-1v-1a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title={title}
      description={description}
      action={action}
      animate={animate}
    />
  )
}
