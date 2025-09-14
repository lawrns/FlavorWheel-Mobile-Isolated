import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { useHaptic } from '@/lib/haptic'

export interface TextFieldProps extends React.ComponentProps<'input'> {
  label?: string
  helperText?: string
  error?: string
  success?: boolean
  required?: boolean
  maxLength?: number
  showCharCount?: boolean
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    label,
    helperText,
    error,
    success,
    required,
    maxLength,
    showCharCount,
    value,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const { trigger } = useHaptic()
    const [isFocused, setIsFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)

    const handleFocus = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      trigger('light') // Input focus haptic
      onFocus?.(event)
    }, [trigger, onFocus])

    const handleBlur = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(event)
    }, [onBlur])

    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (showCharCount && maxLength) {
        setCharCount(event.target.value.length)
      }
      props.onChange?.(event)
    }, [showCharCount, maxLength, props.onChange])

    const inputClasses = cn(
      // Base styles
      'border-input-border text-input-text',

      // Focus styles
      'focus-visible:border-input-focus-border focus-visible:ring-input-focus-border',

      // Error styles
      error && 'border-form-error focus-visible:border-form-error focus-visible:ring-form-error',

      // Success styles
      success && 'border-form-success focus-visible:border-form-success focus-visible:ring-form-success',

      className
    )

    return (
      <div className="space-y-input-gap">
        {label && (
          <label
            className={cn(
              'block font-[var(--fw-typography-label-family)] font-[500] text-[var(--fw-typography-label-size)] leading-[var(--fw-typography-label-line-height)] text-label-text',
              required && "after:content-['*'] after:text-form-error after:ml-1"
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <Input
            ref={ref}
            className={inputClasses}
            maxLength={maxLength}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id || props.name}-error` :
              helperText ? `${props.id || props.name}-helper` :
              undefined
            }
            {...props}
          />

          {/* Character count */}
          {showCharCount && maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-input-placeholder">
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={`${props.id || props.name}-helper`}
            className="font-[var(--fw-typography-helper-family)] font-[400] text-[var(--fw-typography-helper-size)] leading-[var(--fw-typography-helper-line-height)] text-input-placeholder"
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p
            id={`${props.id || props.name}-error`}
            className="font-[var(--fw-typography-helper-family)] font-[400] text-[var(--fw-typography-helper-size)] leading-[var(--fw-typography-helper-line-height)] text-form-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

TextField.displayName = 'TextField'

export { TextField }


