// Direct chat using native fetch() — bypasses the Windows system proxy
// (127.0.0.1:7897) that causes 401 errors from IP-mismatched requests.

export async function simpleChat(
  input: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim()
  const baseURL = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1'
  const modelName = process.env.MODEL_NAME || 'gpt-4o-mini'

  const messages: Array<{ role: string; content: string }> = [
    ...history,
    { role: 'user', content: input },
  ]

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`${response.status} "${response.statusText}"${errorText ? ': ' + errorText : ''}`)
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ''
}

export interface StreamChunk {
  content: string
}

export async function* simpleChatStream(
  input: string,
  history: Array<{ role: string; content: string }> = []
): AsyncGenerator<StreamChunk, string> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim()
  const baseURL = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1'
  const modelName = process.env.MODEL_NAME || 'gpt-4o-mini'

  const messages: Array<{ role: string; content: string }> = [
    ...history,
    { role: 'user', content: input },
  ]

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`${response.status} "${response.statusText}"${errorText ? ': ' + errorText : ''}`)
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
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            fullContent += content
            yield { content }
          }
        } catch {}
      }
    }
  }

  return fullContent
}
