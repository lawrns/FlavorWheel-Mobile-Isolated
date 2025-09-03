import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'
import * as React from 'react'
import { useHaptic } from '@/lib/haptic'

// Base button styles using new design tokens
const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-base ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-98 min-h-[44px]'

// Enhanced button variants using new design tokens
export const buttonVariants = cva(base, {
  variants: {
    variant: {
      primary: 'bg-fx-primary text-fx-text-inverse hover:bg-fx-primary-hover shadow-fx-sm hover:shadow-fx-md active:shadow-fx-xs',
      secondary: 'bg-fx-card border border-fx-border-default text-fx-text-primary hover:bg-fx-bg-subtle hover:border-fx-accent shadow-fx-xs hover:shadow-fx-sm',
      accent: 'bg-fx-accent text-fx-text-inverse hover:bg-fx-accent-hover shadow-fx-sm hover:shadow-fx-md active:shadow-fx-xs',
      ghost: 'text-fx-primary hover:bg-fx-bg-subtle hover:text-fx-primary-hover',
      destructive: 'bg-fx-ai-confidence-low text-fx-text-inverse hover:bg-fx-ai-confidence-med shadow-fx-sm',
      success: 'bg-fx-ai-confidence-high text-fx-text-inverse hover:bg-fx-primary shadow-fx-sm',
      outline: 'border border-fx-border-default bg-transparent text-fx-text-primary hover:bg-fx-bg-subtle hover:border-fx-accent',
      link: 'text-fx-primary underline-offset-4 hover:underline hover:text-fx-primary-hover bg-transparent shadow-none hover:shadow-none'
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

function cn(...v: any[]) { return twMerge(clsx(v)) }

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  hapticType?: 'light' | 'medium' | 'heavy' | 'none'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, haptic: hapticVariant, hapticType = 'light', onClick, ...props }, ref) {
    const { trigger } = useHaptic()

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback on click
      if (hapticType !== 'none') {
        trigger(hapticType as any)
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
      <button
        ref={ref}
        className={classes}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
