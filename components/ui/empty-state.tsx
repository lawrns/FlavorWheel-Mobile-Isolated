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
    icon: 'w-16 h-16 text-fx-text-muted mb-6',
    title: 'text-2xl font-semibold text-fx-text-primary mb-3',
    description: 'text-fx-text-secondary max-w-sm mx-auto',
  },
  minimal: {
    container: 'py-8 px-4 text-center',
    icon: 'w-12 h-12 text-fx-text-muted mb-4',
    title: 'text-lg font-medium text-fx-text-primary mb-2',
    description: 'text-fx-text-secondary text-sm max-w-xs mx-auto',
  },
  playful: {
    container: 'py-20 px-6 text-center',
    icon: 'w-20 h-20 text-fx-accent mb-8',
    title: 'text-3xl font-bold text-fx-text-primary mb-4',
    description: 'text-fx-text-secondary text-lg max-w-md mx-auto',
  },
  search: {
    container: 'py-16 px-6 text-center',
    icon: 'w-16 h-16 text-fx-text-muted mb-6',
    title: 'text-xl font-semibold text-fx-text-primary mb-3',
    description: 'text-fx-text-secondary max-w-md mx-auto',
  },
  error: {
    container: 'py-16 px-6 text-center',
    icon: 'w-16 h-16 text-fx-ai-confidence-low mb-6',
    title: 'text-2xl font-semibold text-fx-text-primary mb-3',
    description: 'text-fx-text-secondary max-w-sm mx-auto',
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
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-fx-accent/10 rounded-full blur-xl"
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
            className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-fx-primary/10 rounded-full blur-xl"
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
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-fx-accent hover:text-fx-accent-hover transition-colors duration-fast ease-standard"
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
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-accent hover:bg-fx-accent-hover rounded-lg transition-colors duration-fast ease-standard"
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

// Specialized contextual empty states with instructive messaging

export function EmptyTastings({
  onCreateTasting,
  animate = true,
}: {
  onCreateTasting?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="playful"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      }
      title="Start Your Flavor Journey"
      description="You haven't created any tastings yet. Begin exploring the world of flavors by recording your first tasting experience."
      action={
        onCreateTasting && (
          <button
            onClick={onCreateTasting}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-accent hover:bg-fx-accent-hover rounded-lg transition-colors duration-fast ease-standard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Tasting
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptyFriends({
  onInviteFriends,
  animate = true,
}: {
  onInviteFriends?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      }
      title="Connect with Flavor Enthusiasts"
      description="Share your tasting experiences and discover new flavors with friends. Start by inviting people you know to join the community."
      action={
        onInviteFriends && (
          <button
            onClick={onInviteFriends}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-flavor-vegetal hover:bg-fx-flavor-vegetal-hover rounded-lg transition-colors duration-fast ease-standard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Invite Friends
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptyReviews({
  onWriteReview,
  animate = true,
}: {
  onWriteReview?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      }
      title="No Reviews Yet"
      description="Be the first to share your thoughts! Your reviews help others discover great flavors and build the community."
      action={
        onWriteReview && (
          <button
            onClick={onWriteReview}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-flavor-sweet hover:bg-fx-flavor-sweet-hover rounded-lg transition-colors duration-fast ease-standard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write First Review
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptyFlavorWheel({
  onCreateWheel,
  animate = true,
}: {
  onCreateWheel?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="playful"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="3" strokeWidth={2} />
        </svg>
      }
      title="Create Your First Flavor Wheel"
      description="Visualize and analyze your tasting experiences with interactive flavor wheels. Start by creating your first wheel to map out flavor profiles."
      action={
        onCreateWheel && (
          <button
            onClick={onCreateWheel}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-flavor-spicy hover:bg-fx-flavor-spicy-hover rounded-lg transition-colors duration-fast ease-standard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Flavor Wheel
          </button>
        )
      }
      animate={animate}
    />
  )
}

export function EmptySearchTastings({
  query,
  onClearSearch,
  onCreateTasting,
  animate = true,
}: {
  query: string
  onClearSearch?: () => void
  onCreateTasting?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="search"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 9.5l4 4" />
        </svg>
      }
      title="No tastings found"
      description={`No tastings match "${query}". Try different keywords or create a new tasting to expand your collection.`}
      action={
        <div className="flex gap-3 justify-center">
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-fx-accent hover:text-fx-accent-hover transition-colors duration-fast ease-standard"
            >
              Clear search
            </button>
          )}
          {onCreateTasting && (
            <button
              onClick={onCreateTasting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-fx-text-inverse bg-fx-accent hover:bg-fx-accent-hover rounded-lg transition-colors duration-fast ease-standard"
            >
              Create tasting
            </button>
          )}
        </div>
      }
      animate={animate}
    />
  )
}

export function EmptyOffline({
  onRetry,
  animate = true,
}: {
  onRetry?: () => void
  animate?: boolean
}) {
  return (
    <EmptyState
      variant="error"
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 2.25a9.75 9.75 0 105.25 16.5 9.75 9.75 0 000-16.5z" />
        </svg>
      }
      title="You're offline"
      description="Some features may not be available. Check your connection and try again when you're back online."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-fx-text-inverse bg-fx-ai-confidence-med hover:bg-fx-ai-confidence-med-hover rounded-lg transition-colors duration-fast ease-standard"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try again
          </button>
        )
      }
      animate={animate}
    />
  )
}

// Demonstration component showing all empty state variants
export function EmptyStatesShowcase() {
  return (
    <div className="space-y-12 p-8 bg-fx-bg-primary">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-fx-text-primary mb-4">
          Empty States Showcase
        </h1>
        <p className="text-fx-text-secondary max-w-2xl mx-auto">
          Comprehensive collection of contextual empty states with clear next steps and semantic design tokens.
        </p>
      </div>

      {/* Basic Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-fx-text-primary">Basic Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Default</h3>
            <EmptyState
              title="No content yet"
              description="This is a default empty state with basic styling."
            />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Minimal</h3>
            <EmptyState
              variant="minimal"
              title="Nothing here"
              description="A more compact empty state."
            />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Playful</h3>
            <EmptyState
              variant="playful"
              title="Let's get started!"
              description="A more engaging empty state with animations."
            />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Error</h3>
            <EmptyState
              variant="error"
              title="Something went wrong"
              description="An error state with appropriate messaging."
            />
          </div>
        </div>
      </section>

      {/* Contextual Empty States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-fx-text-primary">Contextual Empty States</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">No Tastings</h3>
            <EmptyTastings />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">No Friends</h3>
            <EmptyFriends />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">No Reviews</h3>
            <EmptyReviews />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">No Flavor Wheels</h3>
            <EmptyFlavorWheel />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Search No Results</h3>
            <EmptySearchTastings query="wine tasting" />
          </div>

          <div className="border border-fx-border-subtle rounded-lg p-6">
            <h3 className="text-lg font-medium text-fx-text-primary mb-4">Offline State</h3>
            <EmptyOffline />
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-fx-text-primary">Usage Guidelines</h2>
        <div className="bg-fx-bg-muted border border-fx-border-subtle rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-fx-text-primary mb-3">When to Use</h3>
              <ul className="space-y-2 text-fx-text-secondary">
                <li>• First-time user experiences</li>
                <li>• Empty search results</li>
                <li>• No data in lists or collections</li>
                <li>• Offline or error states</li>
                <li>• Permission or access restrictions</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-fx-text-primary mb-3">Best Practices</h3>
              <ul className="space-y-2 text-fx-text-secondary">
                <li>• Always provide clear next steps</li>
                <li>• Use contextual icons and colors</li>
                <li>• Keep messaging encouraging and helpful</li>
                <li>• Include actionable buttons when possible</li>
                <li>• Consider progressive disclosure</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-fx-accent/10 border border-fx-accent/20 rounded-lg">
            <h4 className="font-medium text-fx-text-primary mb-2">Semantic Design Tokens</h4>
            <p className="text-sm text-fx-text-secondary">
              All empty states use consistent semantic tokens for colors, spacing, and typography.
              Colors adapt automatically to light/dark themes and maintain proper contrast ratios.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
