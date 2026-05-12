import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  message: string
  history?: ChatMessage[]
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }

  const body: RequestBody = await req.json()
  const { message, history = [] } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (eventType: string, data: Record<string, unknown>) => {
        const lines = [`event: ${eventType}`, `data: ${JSON.stringify(data)}`, '']
        controller.enqueue(encoder.encode(lines.join('\n')))
      }

      try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.ZHIPU_API_KEY ?? ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'glm-4-flash',
            messages: [
              ...history.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
              })),
              { role: 'user', content: message },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        })

        if (!response.ok) {
          const errText = await response.text()
          sendEvent('error', { error: `API error ${response.status}: ${errText}` })
          controller.close()
          return
        }

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                sendEvent('done', { content: fullContent })
                controller.close()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  fullContent += content
                  sendEvent('content', { content })
                }
              } catch {}
            }
          }
        }

        sendEvent('done', { content: fullContent })
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream error'
        sendEvent('error', { error: msg })
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: SSE_HEADERS })
}
