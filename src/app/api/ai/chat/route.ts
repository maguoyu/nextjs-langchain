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

      const send = (content: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n`))
      }

      const done = () => {
        controller.enqueue(encoder.encode('data: [DONE]\n'))
        controller.close()
      }

      try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ZHIPU_API_KEY ?? ''}`,
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
          throw new Error(`API error ${response.status}: ${errText}`)
        }

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done: readerDone, value } = await reader.read()
          if (readerDone) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                done()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) send(content)
              } catch {}
            }
          }
        }

        done()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
