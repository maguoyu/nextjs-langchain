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
        <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="12" y1="12" x2="12" y2="16" />
            <line x1="12" y1="12" x2="12.01" y2="12" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">{description}</p>
      </div>
    )
  }
)

Empty.displayName = 'Empty'

export { Empty }
