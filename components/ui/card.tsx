import * as React from 'react'
// import { motion } from "framer-motion" // Temporarily disabled due to React RC compatibility

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const cardStyles = cva(
  'rounded-lg border text-foreground transition-all duration-200',
  {
    variants: {
      variant: {
        solid: 'border-gray-200 bg-card shadow-soft hover:-translate-y-0.5 hover:shadow-medium',
        translucent:
          'border-gray-200 bg-card/90 backdrop-blur-sm shadow-soft hover:-translate-y-0.5 hover:shadow-medium',
        elevated:
          'border-gray-200 bg-white shadow-medium hover:-translate-y-0.5 hover:shadow-large',
        subtle: 'border-gray-200 bg-muted/50',
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

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, animate = true, variant, padding, interactive, ...props }, ref) => {
    // Motion animations temporarily disabled due to React RC compatibility
    return (
      <div
        ref={ref}
        className={cn(cardStyles({ variant, padding, interactive }), className)}
        suppressHydrationWarning
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
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
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
