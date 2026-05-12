'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  description?: string
}

const Empty = forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, description = '暂无数据', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-16 text-center',
          className
        )}
        {...props}
      >
        <svg
          className="w-10 h-10 text-[var(--muted-foreground)] mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
        <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
      </div>
    )
  }
)

Empty.displayName = 'Empty'

export { Empty }
