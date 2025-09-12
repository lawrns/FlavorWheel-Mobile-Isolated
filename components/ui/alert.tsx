import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-2xl border border-border p-6 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-6 [&>svg]:top-6 [&>svg]:text-foreground shadow-sm focus-within:ring-2 focus-within:ring-fx-accent focus-within:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-surface text-foreground',
        destructive:
          'border-fx-ai-confidence-low/50 text-fx-ai-confidence-low bg-fx-ai-confidence-low/10 dark:border-fx-ai-confidence-low dark:text-fx-ai-confidence-med dark:bg-fx-ai-confidence-low/20 [&>svg]:text-fx-ai-confidence-low',
        success: 'border-fx-flavor-vegetal/50 text-fx-flavor-vegetal bg-fx-flavor-vegetal/10 [&>svg]:text-fx-flavor-vegetal',
        warning: 'border-fx-ai-confidence-med/50 text-fx-ai-confidence-med bg-fx-ai-confidence-med/10 dark:border-fx-ai-confidence-med dark:text-fx-ai-confidence-med dark:bg-fx-ai-confidence-med/20 [&>svg]:text-fx-ai-confidence-med',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-2 text-h6 font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-body-sm [&_p]:leading-relaxed opacity-90', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
