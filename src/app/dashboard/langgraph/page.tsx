'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ChatMessage } from '@/components/ai/ChatMessage'
import { ChatInput } from '@/components/ai/ChatInput'

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>AI Demo</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">LangGraph 问答</span>
    </div>
  )
}

export default function LangGraphPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const submitTask = useCallback((input: string) => {
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: input }])
    setLoading(true)
    setError(null)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    let fullResponse = ''

    fetch('/api/ai/langgraph/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: input }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        if (!res.body) throw new Error('No response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        const processEvents = () => {
          reader.read().then(({ done, value }) => {
            if (done || controller.signal.aborted) {
              setLoading(false)
              return
            }

            buffer += decoder.decode(value, { stream: true })

            // Parse SSE events - each event ends with double newline
            while (buffer.includes('\n\n')) {
              const eventEnd = buffer.indexOf('\n\n')
              const eventBlock = buffer.slice(0, eventEnd)
              buffer = buffer.slice(eventEnd + 2)

              const lines = eventBlock.split('\n')
              let eventType = ''
              let eventData = ''

              for (const line of lines) {
                if (line.startsWith('event: ')) {
                  eventType = line.slice(7).trim()
                } else if (line.startsWith('data: ')) {
                  eventData = line.slice(6)
                }
              }

              if (eventType && eventData) {
                try {
                  const data = JSON.parse(eventData)
                  if (eventType === 'content') {
                    fullResponse = data.content
                    setMessages(prev => {
                      const last = prev[prev.length - 1]
                      if (last?.role === 'assistant') {
                        return [...prev.slice(0, -1), { role: 'assistant', content: fullResponse }]
                      }
                      return [...prev, { role: 'assistant', content: fullResponse }]
                    })
                  } else if (eventType === 'error') {
                    setError(data.error || 'Stream error')
                    setLoading(false)
                  }
                } catch (e) {
                  console.error('[SSE] parse error', e, 'data:', eventData)
                }
              }
            }

            processEvents()
          })
        }

        processEvents()
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Network error')
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-lg font-bold text-[var(--foreground)]">LangGraph 问答</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>对话</CardTitle>
          <CardDescription>基于 LangGraph 的简单问答系统</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center text-[var(--muted-foreground)] py-8">
                <p>开始对话吧！</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-[var(--secondary)] text-[var(--secondary-foreground)]">
                  AI
                </div>
                <div className="rounded-lg rounded-bl-none bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--border)] px-3 py-2 text-sm">
                  思考中...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={submitTask} disabled={loading} placeholder="输入问题..." />
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  )
}
