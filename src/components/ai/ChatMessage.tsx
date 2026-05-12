'use client'

import { cn } from '@/lib/utils'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
}

export function ChatMessage({ role, content, thinking }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          isUser
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
            : 'bg-[var(--secondary)] text-[var(--secondary-foreground)]'
        )}
      >
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={cn('flex flex-col gap-1.5 max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {thinking && (
          <div className="rounded-lg rounded-bl-none bg-[var(--accent)] text-[var(--accent-foreground)] px-3 py-2 text-xs border border-[var(--border)]">
            <div className="font-medium mb-0.5 text-[var(--muted-foreground)]">Thinking:</div>
            <div className="whitespace-pre-wrap">{thinking}</div>
          </div>
        )}
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm whitespace-pre-wrap',
            isUser
              ? 'rounded-br-none bg-[var(--primary)] text-[var(--primary-foreground)]'
              : 'rounded-bl-none bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)]'
          )}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
