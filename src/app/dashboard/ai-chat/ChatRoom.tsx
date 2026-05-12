'use client'

import { useState, useRef, useEffect } from 'react'
import { createSSEStream } from '@/lib/ai/stream-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
        isUser
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
          : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>
      <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-md'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-md'
        }`}>
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
        AI
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是 AI 助手，可以回答问题、编写代码、分析数据。有什么可以帮助你的吗？',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsStreaming(true)

    const assistantId = crypto.randomUUID()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      const stream = await createSSEStream('/api/ai/chat', { message: text, history })

      for await (const event of stream.events) {
        if (event.type === 'content') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + event.content } : m
            )
          )
        } else if (event.type === 'done') {
          break
        } else if (event.type === 'error') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `抱歉，发生了错误：${event.error}` }
                : m
            )
          )
          break
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: '抱歉，发生了错误，请稍后重试。' }
            : m
        )
      )
    } finally {
      setIsStreaming(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 px-6 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all disabled:opacity-50 max-h-40 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-11 h-11 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 flex items-center justify-center"
            style={{
              background: input.trim() && !isStreaming
                ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                : '#9ca3af',
              boxShadow: input.trim() && !isStreaming
                ? '0 4px 14px rgba(59,130,246,0.35)'
                : 'none',
            }}
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI 生成内容仅供参考，请以实际业务逻辑为准
        </p>
      </div>
    </div>
  )
}
