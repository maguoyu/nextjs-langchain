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
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Panel */}
          <div
            ref={ref}
            className={cn(
              'relative bg-white dark:bg-[#1f2937] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col',
              'transform transition-all duration-300',
              className
            )}
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}
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
      className={cn('px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0', className)}
      {...props}
    />
  )
)

ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    />
  )
)

ModalTitle.displayName = 'ModalTitle'

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-5 overflow-y-auto flex-1', className)} {...props} />
  )
)

ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5 shrink-0 bg-gray-50/50 dark:bg-gray-900/50', className)}
      {...props}
    />
  )
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter }
