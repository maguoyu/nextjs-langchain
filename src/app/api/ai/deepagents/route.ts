import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  thinking?: boolean
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
}

function parseUpstreamSSE(buffer: string): { content: string; thinking: string; done: boolean } {
  const lines = buffer.split('\n')
  let content = ''
  let thinking = ''
  let done = false

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (trimmed.startsWith('data: ')) {
      const data = trimmed.slice(6)
      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'done' || data === '[DONE]') {
          done = true
        } else if (parsed.content != null) {
          content += parsed.content
        }
        if (parsed.thinking != null) {
          thinking += parsed.thinking
        }
        if (parsed.delta?.content != null) {
          content += parsed.delta.content
        }
        if (parsed.delta?.thinking != null) {
          thinking += parsed.delta.thinking
        }
      } catch {
        if (data === '[DONE]') done = true
      }
    }
  }

  return { content, thinking, done }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    if (!process.env.DEEPAGENTS_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPAGENTS_API_KEY is not configured.' },
        { status: 500 }
      )
    }

    const body: RequestBody = await req.json()
    const { messages = [], thinking = true } = body

    if (!messages.length) {
      return NextResponse.json({ error: 'messages cannot be empty' }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      return NextResponse.json({ error: 'last message must be from user' }, { status: 400 })
    }

    const upstreamPayload = {
      model: 'deep-reasoner',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      thinking,
      max_tokens: 2048,
      stream: true,
    }

    const upstreamRes = await fetch('https://api.deepagents.com/v1/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPAGENTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upstreamPayload),
    })

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text()
      return NextResponse.json(
        { error: `DeepAgents API error ${upstreamRes.status}: ${errText}` },
        { status: 502 }
      )
    }

    if (!upstreamRes.body) {
      return NextResponse.json({ error: 'No response body from DeepAgents' }, { status: 502 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        const sendEvent = (eventType: string, data: Record<string, unknown>) => {
          const lines = [`event: ${eventType}`, `data: ${JSON.stringify(data)}`, '']
          controller.enqueue(encoder.encode(lines.join('\n')))
        }

        try {
          const reader = upstreamRes.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trimEnd()
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6)
                if (data === '[DONE]') {
                  continue
                }
                try {
                  const parsed = JSON.parse(data)

                  if (parsed.delta?.content) {
                    sendEvent('content', { content: parsed.delta.content })
                  }
                  if (parsed.delta?.thinking) {
                    sendEvent('thinking', { thinking: parsed.delta.thinking })
                  }
                  if (parsed.content) {
                    sendEvent('content', { content: parsed.content })
                  }
                  if (parsed.thinking) {
                    sendEvent('thinking', { thinking: parsed.thinking })
                  }
                } catch {
                  // ignore parse errors
                }
              }
            }
          }

          sendEvent('done', { content: '', thinking: '' })
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error'
          sendEvent('error', { error: msg })
          controller.close()
        }
      },
    })

    return new Response(stream, { headers: SSE_HEADERS })
  } catch (error) {
    return handleApiError(error)
  }
}
