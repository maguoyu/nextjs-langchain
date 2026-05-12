'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'danger' | 'info'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
      secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
      destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
      outline: 'border border-[var(--border)] text-[var(--foreground)]',
      success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
      info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
