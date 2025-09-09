import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const cardStyles = cva(
  'rounded-xl border text-fx-text-primary transition-all duration-base ease-standard',
  {
    variants: {
      variant: {
        solid: 'border-fx-border-default bg-fx-card shadow-fx-sm hover:shadow-fx-md transform hover:-translate-y-1',
        translucent: 'border-fx-border-default bg-fx-card/90 backdrop-blur-sm shadow-fx-sm hover:shadow-fx-md transform hover:-translate-y-1',
        elevated: 'border-fx-border-default bg-fx-bg shadow-fx-md hover:shadow-fx-lg transform hover:-translate-y-1',
        subtle: 'border-fx-border-subtle bg-fx-bg-subtle',

        // Beautiful premium variants
        beautiful: 'card-beautiful',
        premium: 'card-premium',
        tasting: 'card-tasting'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
      },
      interactive: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'solid',
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
    const classes = cn(cardStyles({ variant, padding, interactive }), className)

    if (!animate) {
      return (
        <div
          ref={ref}
          className={classes}
          suppressHydrationWarning
          {...props}
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
        whileHover={interactive ? { y: -4, scale: 1.02 } : {}}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: 0.3
        }}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-heading font-semibold leading-tight tracking-tight text-fx-text-primary', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-body text-fx-text-secondary', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'



export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
