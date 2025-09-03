'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getAnimationProps } from '@/lib/motion-utils'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  floatingLabel?: boolean
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, label, error, helperText, floatingLabel = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    return (
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="relative">
          <motion.input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border bg-background px-4 pt-6 pb-2 text-body-md transition-all duration-fast ease-standard file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-border focus-visible:ring-primary',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                'absolute left-4 text-body-md font-medium transition-all duration-fast ease-standard pointer-events-none',
                isFocused || hasValue
                  ? 'top-2 text-sm text-primary'
                  : 'top-1/2 -translate-y-1/2 text-muted-foreground'
              )}
            >
              {label}
            </motion.label>
          )}

          {/* Static Label (fallback) */}
          {!floatingLabel && label && (
            <label className="block text-body-sm font-medium text-foreground mb-2">
              {label}
            </label>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            {...getAnimationProps('slideIn', { direction: 'down' })}
            className="mt-2 text-body-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </motion.div>
    )
  }
)
FormInput.displayName = 'FormInput'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  floatingLabel?: boolean
}

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, helperText, floatingLabel = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        <div className="relative">
          <textarea
            className={cn(
              'flex min-h-24 w-full rounded-lg border bg-background px-4 pt-6 pb-2 text-body-md transition-all duration-fast ease-standard placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none',
              error
                ? 'border-red-500 focus-visible:ring-red-500'
                : 'border-border focus-visible:ring-primary',
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {floatingLabel && label && (
            <motion.label
              className={cn(
                'absolute left-4 text-body-md font-medium transition-all duration-fast ease-standard pointer-events-none',
                isFocused || hasValue
                  ? 'top-2 text-sm text-primary'
                  : 'top-6 text-muted-foreground'
              )}
            >
              {label}
            </motion.label>
          )}

          {/* Static Label (fallback) */}
          {!floatingLabel && label && (
            <label className="block text-body-sm font-medium text-foreground mb-2">
              {label}
            </label>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            {...getAnimationProps('slideIn', { direction: 'down' })}
            className="mt-2 text-body-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-body-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
FormTextarea.displayName = 'FormTextarea'
