'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onClose?: () => void
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    if (!open) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={onClose}
          />
          <div
            ref={ref}
            className={cn(
              'relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg',
              'transform transition-all',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

const ModalHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}
      {...props}
    />
  )
)

ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  )
)

ModalTitle.displayName = 'ModalTitle'

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      {...props}
    />
  )
)

ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3', className)}
      {...props}
    />
  )
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter }
