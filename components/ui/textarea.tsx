import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-input border bg-input-bg py-input-y px-input-x text-[16px] font-[var(--fw-typography-input-family)] font-[400] leading-[var(--fw-typography-input-line-height)] text-input-text placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-input-disabled-bg disabled:text-input-disabled-text disabled:opacity-50 transition-all duration-fast ease-standard resize-none focus-visible:border-input-focus-border focus-visible:ring-input-focus-border',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
