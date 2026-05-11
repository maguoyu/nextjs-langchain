'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={cn('w-full text-sm text-left', className)}
        {...props}
      />
    </div>
  )
)

Table.displayName = 'Table'

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('text-xs text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-900', className)}
      {...props}
    />
  )
)

TableHeader.displayName = 'TableHeader'

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}
      {...props}
    />
  )
)

TableBody.displayName = 'TableBody'

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('hover:bg-gray-50 dark:hover:bg-gray-900', className)}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

const TableHead = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('px-6 py-3 font-medium text-gray-500', className)}
      {...props}
    />
  )
)

TableHead.displayName = 'TableHead'

const TableCell = forwardRef<HTMLTableCellElement, HTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('px-6 py-4 text-gray-900 dark:text-gray-100', className)}
      {...props}
    />
  )
)

TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
