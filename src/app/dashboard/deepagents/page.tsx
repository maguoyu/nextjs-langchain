'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ChatMessage } from '@/components/ai/ChatMessage'
import { ChatInput } from '@/components/ai/ChatInput'
import { createSSEStream } from '@/lib/ai/stream-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  thinking?: string
}

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>AI Demo</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">DeepAgents Reasoning</span>
    </div>
  )
}

const examplePrompts = [
  'What are the key factors affecting climate change?',
  'How would you design a scalable distributed system?',
  'Explain the trade-offs in choosing a database.',
]

export default function DeepAgentsPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showThinking, setShowThinking] = useState(true)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingThinking, setStreamingThinking] = useState('')
  const streamingContentRef = useRef('')
  const streamingThinkingRef = useRef('')

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)
    setStreamingContent('')
    setStreamingThinking('')
    streamingContentRef.current = ''
    streamingThinkingRef.current = ''

    try {
      const stream = await createSSEStream('/api/ai/deepagents', {
        messages: [...messages, userMsg],
        thinking: showThinking,
      })

      for await (const event of stream.events) {
        if (event.type === 'content') {
          streamingContentRef.current += event.content
          setStreamingContent(streamingContentRef.current)
        } else if (event.type === 'thinking') {
          streamingThinkingRef.current += event.thinking
          setStreamingThinking(streamingThinkingRef.current)
        } else if (event.type === 'done') {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: event.content || streamingContentRef.current,
              thinking: event.thinking || streamingThinkingRef.current,
            },
          ])
          setStreamingContent('')
          setStreamingThinking('')
        } else if (event.type === 'error') {
          setError(event.error)
          break
        }
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [messages, showThinking])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-lg font-bold text-[var(--foreground)]">DeepAgents Reasoning</h1>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
          <input
            type="checkbox"
            checked={showThinking}
            onChange={(e) => setShowThinking(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          Show Thinking
        </label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>Deep reasoning with step-by-step thinking process</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <div className="text-sm text-[var(--muted-foreground)]">Try these examples:</div>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent)]/80 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 min-h-[300px]">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} thinking={msg.thinking} />
            ))}
            {(streamingContent || streamingThinking) && (
              <ChatMessage
                role="assistant"
                content={streamingContent}
                thinking={showThinking ? streamingThinking : undefined}
              />
            )}
            {loading && !streamingContent && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI 深度思考中...
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-[var(--destructive)] bg-[var(--destructive)]/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="px-1">
        <ChatInput onSend={sendMessage} disabled={loading} placeholder="Ask a complex reasoning question..." />
      </div>
    </div>
  )
}
