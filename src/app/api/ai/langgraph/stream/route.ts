import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runWorkflowStream } from '@/lib/ai/langgraph'

export const runtime = 'nodejs'
export const maxDuration = 60

interface RequestBody {
  task: string
  threadId?: string
}

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ code: 401, message: '未授权' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ code: 400, message: 'Invalid JSON body' }, { status: 400 })
  }

  const { task, threadId } = body
  if (!task?.trim()) {
    return NextResponse.json({ code: 400, message: 'task cannot be empty' }, { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (eventType: string, data: Record<string, unknown>) => {
        try {
          const jsonStr = JSON.stringify(data)
          const lines = [`event: ${eventType}`, `data: ${jsonStr}`, '', '']
          controller.enqueue(encoder.encode(lines.join('\n')))
        } catch {
          // Controller already closed
        }
      }

      try {
        for await (const chunk of runWorkflowStream(task, threadId)) {
          if (chunk.error) {
            sendEvent('error', { error: chunk.error })
            controller.close()
            return
          }
          if (chunk.content) {
            sendEvent('content', { content: chunk.content })
          }
          if (chunk.done) {
            sendEvent('done', {})
            controller.close()
            return
          }
        }
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
