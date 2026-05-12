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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div
            ref={ref}
            className={cn(
              'relative bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-lg w-full max-w-lg border border-[var(--border)]',
              'animate-[fade-in_0.2s_ease_forwards]',
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
    <div ref={ref} className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props} />
  )
)

ModalHeader.displayName = 'ModalHeader'

const ModalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-semibold', className)} {...props} />
  )
)

ModalTitle.displayName = 'ModalTitle'

const ModalContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5', className)} {...props} />
  )
)

ModalContent.displayName = 'ModalContent'

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex justify-end gap-2 p-5 pt-0', className)}
      {...props}
    />
  )
)

ModalFooter.displayName = 'ModalFooter'

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter }
