export type StreamEvent =
  | { type: 'content'; content: string }
  | { type: 'thinking'; thinking: string }
  | { type: 'done'; content: string; thinking?: string }
  | { type: 'error'; error: string }

function parseSSEEvent(lines: string[]): StreamEvent | null {
  let eventType = ''
  let data = ''

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      data = line.slice(5).trim()
    }
  }

  if (!data) return null

  try {
    const parsed = JSON.parse(data)

    if (eventType === 'content' || (!eventType && 'content' in parsed)) {
      return { type: 'content', content: parsed.content ?? '' }
    }
    if (eventType === 'thinking' || (!eventType && 'thinking' in parsed)) {
      return { type: 'thinking', thinking: parsed.thinking ?? '' }
    }
    if (eventType === 'done' || (!eventType && 'done' in parsed)) {
      return { type: 'done', content: parsed.content ?? '', thinking: parsed.thinking }
    }
    if (eventType === 'error' || (!eventType && 'error' in parsed)) {
      return { type: 'error', error: parsed.error ?? 'Unknown error' }
    }
  } catch {
    // non-JSON data line, ignore
  }

  return null
}

function parseSSEChunk(chunk: string): StreamEvent[] {
  const events: StreamEvent[] = []
  const lines = chunk.split('\n')
  const eventLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (trimmed === '') {
      if (eventLines.length > 0) {
        const event = parseSSEEvent(eventLines)
        if (event) events.push(event)
        eventLines.length = 0
      }
    } else {
      eventLines.push(trimmed)
    }
  }

  return events
}

export interface SSEStream {
  events: AsyncIterable<StreamEvent>
  abort: () => void
}

export async function createSSEStream(
  endpoint: string,
  body: Record<string, unknown>
): Promise<SSEStream> {
  const controller = new AbortController()

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`
    try {
      const errBody = await response.json()
      errorMessage = errBody.message ?? errBody.error ?? errorMessage
    } catch {
      const text = await response.text()
      if (text) errorMessage = text
    }
    const errorEvents: StreamEvent[] = [{ type: 'error', error: errorMessage }]
    return {
      events: (async function* () {
        yield* errorEvents
      })(),
      abort: () => controller.abort(),
    }
  }

  if (!response.body) {
    return {
      events: (async function* () {
        yield { type: 'error', error: 'No response body from server' }
      })(),
      abort: () => controller.abort(),
    }
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  return {
    events: (async function* () {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const events = parseSSEChunk(buffer)
          const lastNewline = buffer.lastIndexOf('\n')
          if (lastNewline !== -1) {
            buffer = buffer.slice(lastNewline + 1)
          }

          for (const event of events) {
            yield event
            if (event.type === 'done' || event.type === 'error') return
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Stream read error'
        yield { type: 'error', error: msg }
      }
    })(),
    abort: () => controller.abort(),
  }
}
