import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-input border bg-input-bg py-input-y px-input-x text-[16px] font-[var(--fw-typography-input-family)] font-[400] leading-[var(--fw-typography-input-line-height)] text-input-text placeholder:text-input-placeholder file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-input-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-input-disabled-bg disabled:text-input-disabled-text disabled:opacity-50 transition-all duration-fast ease-standard min-h-[44px] focus-visible:border-input-focus-border focus-visible:ring-input-focus-border',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
