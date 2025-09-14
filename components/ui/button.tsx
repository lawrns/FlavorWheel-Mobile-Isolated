import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { motion } from 'framer-motion'
import { useHaptic } from '@/lib/haptic'
import { cn } from '@/lib/utils'

// Base button styles using unified Mexican design tokens
const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button py-button-y px-button-x text-[16px] font-medium leading-[1.5] font-[Inter Variable] transition-button duration-button ease-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px]'

// Enhanced button variants using fx- design tokens
export const buttonVariants = cva(base, {
  variants: {
    variant: {
      default: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md active:scale-96 focus-visible:ring-fx-accent',
      primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md active:scale-96 focus-visible:ring-fx-accent',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm hover:shadow-md active:scale-96 focus-visible:ring-fx-accent',
      accent: 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md active:scale-96 focus-visible:ring-fx-accent',
      ghost: 'text-primary hover:bg-muted hover:text-primary border border-border hover:border-accent focus-visible:ring-fx-accent',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-96 focus-visible:ring-red-500',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm active:scale-96 focus-visible:ring-green-500',
      outline: 'border border-border bg-transparent text-foreground hover:bg-muted hover:border-accent focus-visible:ring-fx-accent',
      link: 'text-primary underline-offset-4 hover:underline hover:text-primary bg-transparent shadow-none hover:shadow-none focus-visible:ring-fx-accent',

      // Legacy beautiful variants (will be migrated)
      beautiful: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md active:scale-96',
      'beautiful-secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-sm hover:shadow-md active:scale-96',
      'beautiful-accent': 'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md active:scale-96'
    },
    size: {
      xs: 'h-11 px-button-x text-sm min-h-[44px]', // 44px minimum touch target
      sm: 'h-11 px-button-x text-sm min-h-[44px]', // 44px minimum touch target
      md: 'h-11 px-button-x text-base min-h-[44px]', // 44px minimum touch target
      lg: 'h-12 px-8 text-base min-h-[44px]', // 48px > 44px minimum
      xl: 'h-14 px-10 text-lg min-h-[44px]' // 56px > 44px minimum
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
      // Trigger haptic feedback on click (using unified system)
      if (hapticType !== 'none') {
        trigger('light') // Unified button press haptic
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
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
