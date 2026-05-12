import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { simpleChatStream } from '@/lib/ai/langchain'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. Please add it to your .env file.' },
      { status: 500 }
    )
  }

  const body: RequestBody = await req.json()
  const { messages = [] } = body

  if (!messages.length) {
    return NextResponse.json({ error: 'messages cannot be empty' }, { status: 400 })
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role !== 'user') {
    return NextResponse.json({ error: 'last message must be from user' }, { status: 400 })
  }

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role,
    content: m.content,
  }))
  const input = lastMessage.content

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (eventType: string, data: Record<string, unknown>) => {
        const lines = [`event: ${eventType}`, `data: ${JSON.stringify(data)}`, '']
        controller.enqueue(encoder.encode(lines.join('\n')))
      }

      try {
        let fullContent = ''
        for await (const chunk of simpleChatStream(input, history)) {
          fullContent += chunk.content
          sendEvent('content', { content: chunk.content })
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
