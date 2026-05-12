'use client'

import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  current: number
  pageSize: number
  total: number
  onChange?: (page: number) => void
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, current, pageSize, total, onChange, ...props }, ref) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    const getPages = () => {
      const pages: (number | string)[] = []
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        } else if (current >= totalPages - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(totalPages)
        }
      }
      return pages
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
        <button
          className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          disabled={current === 1}
          onClick={() => onChange?.(current - 1)}
        >
          上一页
        </button>

        {getPages().map((page, index) => (
          <button
            key={index}
            className={cn(
              'px-3 py-1.5 text-xs rounded-md border transition-all',
              page === current
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm'
                : page === '...'
                ? 'border-transparent text-[var(--muted-foreground)] cursor-default'
                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            )}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && onChange?.(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="px-3 py-1.5 text-xs rounded-md border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          disabled={current === totalPages}
          onClick={() => onChange?.(current + 1)}
        >
          下一页
        </button>
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'

export { Pagination }
