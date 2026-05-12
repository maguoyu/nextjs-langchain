export interface DeepAgentsResult {
  response: string
  thinking: string
  reasoning: string
}

export async function callDeepAgents(
  messages: Array<{ role: string; content: string }>,
  options?: { thinking?: boolean }
): Promise<DeepAgentsResult> {
  const apiKey = process.env.DEEPAGENTS_API_KEY

  if (!apiKey) {
    throw new Error('DEEPAGENTS_API_KEY is not configured')
  }

  const response = await fetch('https://api.deepagents.com/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deep-reasoner',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      thinking: options?.thinking ?? true,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepAgents API error ${response.status}: ${errorText}`)
  }

  const data = await response.json()

  return {
    response: data.response || data.content || '',
    thinking: data.thinking || '',
    reasoning: data.reasoning || '',
  }
}

export function formatThinking(thinking: string): string {
  if (!thinking) return ''
  return thinking.trim()
}
