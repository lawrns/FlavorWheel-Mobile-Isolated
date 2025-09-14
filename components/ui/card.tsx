import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useHaptic } from '@/lib/haptic'

const cardStyles = cva(
  'rounded-card border-card text-card-text-primary transition-all duration-base ease-standard',
  {
    variants: {
      variant: {
        default: 'border-card-border bg-card-surface shadow-card hover:shadow-card',
        elevated: 'border-card-border bg-card-surface shadow-card',
        interactive: 'border-card-border bg-card-surface shadow-card cursor-pointer',
        image: 'border-card-border bg-card-secondary shadow-card',

        // Legacy variants (will be migrated)
        solid: 'border-card-border bg-card-surface shadow-card',
        translucent: 'border-card-border bg-card-surface/90 backdrop-blur-sm shadow-card',
        subtle: 'border-card-border bg-card-secondary',

        // Beautiful premium variants (legacy)
        beautiful: 'card-beautiful',
        premium: 'card-premium',
        tasting: 'card-tasting'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-card',
        lg: 'p-8',
      },
      interactive: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: true,
    },
  }
)

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardStyles> & {
    animate?: boolean
  }

const MotionCard = motion.div

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animate = true, variant, padding, interactive, ...props }, ref) => {
    const { trigger } = useHaptic()
    const { onAnimationStart: _omitOnAnimationStart, onAnimationEnd: _omitOnAnimationEnd, ...restProps } = props as any

    const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      // Trigger haptic feedback for interactive cards
      if (interactive && variant === 'interactive') {
        trigger('light')
      }

      // Call original onClick handler if provided
      const onClick = (props as any).onClick
      onClick?.(event)
    }, [interactive, variant, trigger])

    const classes = cn(cardStyles({ variant, padding, interactive }), className)

    if (!animate) {
      return (
        <div
          ref={ref}
          className={classes}
          suppressHydrationWarning
          onClick={handleClick}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          {...restProps}
        />
      )
    }

    return (
      <MotionCard
        ref={ref}
        className={classes}
        suppressHydrationWarning
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={interactive ? { transform: 'var(--fw-motion-card-hover-transform)', boxShadow: 'var(--fw-motion-card-hover-shadow)' } : {}}
        whileTap={interactive ? { scale: 'var(--fw-motion-card-tap-scale)' } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: 0.3,
          hover: {
            duration: 'var(--fw-motion-card-hover-duration)',
            ease: 'var(--fw-motion-card-hover-easing)'
          },
          tap: {
            duration: 'var(--fw-motion-card-tap-duration)',
            ease: 'var(--fw-motion-card-tap-easing)'
          }
        }}
        onClick={handleClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...restProps}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-card-gap p-card', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-[var(--fw-typography-card-title-family)] font-[600] text-[var(--fw-typography-card-title-size)] leading-[var(--fw-typography-card-title-line-height)] text-card-text-primary', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('font-[var(--fw-typography-card-body-family)] font-[400] text-[var(--fw-typography-card-body-size)] leading-[var(--fw-typography-card-body-line-height)] text-card-text-secondary', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-card pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-card pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'



export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
