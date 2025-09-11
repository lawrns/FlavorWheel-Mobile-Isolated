import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useHaptic } from '@/lib/haptic'
import { cn } from '@/lib/utils'

// Base button styles using unified design tokens
const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-body-sm font-medium transition-all duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-98 min-h-[44px]'

// Enhanced button variants using fx- design tokens
export const buttonVariants = cva(base, {
  variants: {
    variant: {
      default: 'bg-gradient-to-r from-fx-primary to-fx-primary-hover text-fx-text-inverse hover:shadow-fx-lg active:shadow-fx-sm transform hover:-translate-y-1 transition-all duration-base',
      primary: 'bg-gradient-to-r from-fx-primary to-fx-primary-hover text-fx-text-inverse hover:shadow-fx-lg active:shadow-fx-sm transform hover:-translate-y-1 transition-all duration-base',
      secondary: 'bg-fx-bg text-fx-text-primary border border-fx-border-default hover:bg-fx-bg-subtle hover:border-fx-accent shadow-fx-xs hover:shadow-fx-sm',
      accent: 'bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse hover:shadow-fx-lg active:shadow-fx-sm transform hover:-translate-y-1 transition-all duration-base',
      ghost: 'text-fx-text-primary hover:bg-fx-bg-subtle hover:text-fx-text-primary',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-fx-sm',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-fx-sm',
      outline: 'border border-fx-border-default bg-transparent text-fx-text-primary hover:bg-fx-bg-subtle hover:border-fx-accent',
      link: 'text-fx-primary underline-offset-4 hover:underline hover:text-fx-primary bg-transparent shadow-none hover:shadow-none',

      // Beautiful premium variants
      beautiful: 'btn-primary-beautiful',
      'beautiful-secondary': 'btn-secondary-beautiful',
      'beautiful-accent': 'btn-accent-beautiful'
    },
    size: {
      xs: 'h-6 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
      xl: 'h-12 px-8 text-lg'
    },
    haptic: {
      light: 'haptic-light',
      medium: 'haptic-medium',
      heavy: 'haptic-heavy',
      none: ''
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    haptic: 'light'
  }
})

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  hapticType?: 'light' | 'medium' | 'heavy' | 'none'
}

const MotionButton = motion.button

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, haptic: hapticVariant, hapticType = 'light', onClick, ...props }, ref) {
    const { onAnimationStart: _omitOnAnimationStart, onAnimationEnd: _omitOnAnimationEnd, ...restProps } = props as any
    const { trigger } = useHaptic()

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on click
      if (hapticType !== 'none') {
        trigger(hapticType as 'light' | 'medium' | 'heavy')
      }

      // Call original onClick handler
      onClick?.(event)
    }, [onClick, trigger, hapticType])

    const classes = cn(
      buttonVariants({
        variant,
        size,
        haptic: hapticVariant || (hapticType !== 'none' ? hapticType : 'none')
      }),
      className
    )

    return (
      <MotionButton
        ref={ref}
        className={classes}
        onClick={handleClick}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17,
          duration: 0.15
        }}
        {...restProps}
      />
    )
  }
)
Button.displayName = 'Button'
