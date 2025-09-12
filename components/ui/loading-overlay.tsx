'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  progress?: number
  variant?: 'spinner' | 'dots' | 'pulse' | 'bar'
  size?: 'sm' | 'md' | 'lg'
  backdrop?: 'blur' | 'dark' | 'none'
  className?: string
}

export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  progress,
  variant = 'spinner',
  size = 'md',
  backdrop = 'blur',
  className = ''
}: LoadingOverlayProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn('bg-current rounded-full', sizeClasses[size])}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <motion.div
            className={cn('bg-current rounded-full', sizeClasses[size])}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )

      case 'bar':
        return (
          <div className="w-48 h-2 bg-fx-bg-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-current rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        )

      default: // spinner
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            className={cn(sizeClasses[size])}
          >
            <Loader2 className="w-full h-full" />
          </motion.div>
        )
    }
  }

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-fx-bg-primary/80',
    dark: 'bg-black/50',
    none: 'bg-transparent'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            backdropClasses[backdrop],
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-fx-bg-primary rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
          >
            <div className="flex justify-center mb-4">
              {renderLoader()}
            </div>

            {message && (
              <p className="text-fx-text-secondary mb-4">{message}</p>
            )}

            {progress !== undefined && (
              <div className="w-full bg-fx-bg-subtle rounded-full h-2 mb-4">
                <motion.div
                  className="bg-current h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            {progress !== undefined && (
              <p className="text-sm text-fx-text-muted">{Math.round(progress)}%</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline loading states for buttons and small elements
interface InlineLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  loader?: React.ReactNode
  className?: string
}

export function InlineLoader({
  isLoading,
  children,
  loader,
  className = ''
}: InlineLoaderProps) {
  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'transition-opacity duration-200',
        isLoading ? 'opacity-50' : 'opacity-100'
      )}>
        {children}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          {loader || (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Loader2 className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// Status indicators with icons
interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning'
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusIndicator({
  status,
  message,
  size = 'md',
  className = ''
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const iconClasses = cn('flex-shrink-0', sizeClasses[size])

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            className={iconClasses}
          >
            <Loader2 className="w-full h-full text-fx-accent" />
          </motion.div>
        )

      case 'success':
        return <CheckCircle className={cn(iconClasses, 'text-fx-flavor-vegetal')} />

      case 'error':
        return <XCircle className={cn(iconClasses, 'text-fx-ai-confidence-low')} />

      case 'warning':
        return <AlertCircle className={cn(iconClasses, 'text-fx-ai-confidence-med')} />

      default:
        return null
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {renderIcon()}
      {message && (
        <span className="text-sm text-fx-text-secondary">{message}</span>
      )}
    </div>
  )
}

// Page-level loading component
interface PageLoaderProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
  className?: string
}

export function PageLoader({
  isLoading,
  message = 'Loading page...',
  children,
  className = ''
}: PageLoaderProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className={cn('min-h-screen flex items-center justify-center', className)}>
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="w-12 h-12 mx-auto mb-4"
        >
          <Loader2 className="w-full h-full text-fx-accent" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-fx-text-secondary"
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}

// Loading button component
interface LoadingButtonProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingButton({
  isLoading,
  loadingText,
  children,
  onClick,
  disabled,
  variant = 'default',
  size = 'md',
  className = ''
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'px-3 py-2 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'bg-fx-accent text-white hover:bg-fx-accent-hover shadow-lg': variant === 'default',
          'border-2 border-fx-accent text-fx-accent hover:bg-fx-accent hover:text-white': variant === 'outline',
          'text-fx-text-primary hover:bg-fx-bg-subtle': variant === 'ghost'
        },
        className
      )}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      )}
      {isLoading ? (loadingText || 'Loading...') : children}
    </button>
  )
}
