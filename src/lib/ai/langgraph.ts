import { ChatOpenAI } from '@langchain/openai'
import { Annotation, StateGraph, END, MemorySaver } from '@langchain/langgraph'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkflowResult {
  response: string
  error?: string
}

// ─── LLM ───────────────────────────────────────────────────────────────────────

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME || 'gpt-4o',
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
  ...(process.env.OPENAI_BASE_URL
    ? { configuration: { baseURL: process.env.OPENAI_BASE_URL } }
    : {}),
})

// ─── State Channels ─────────────────────────────────────────────────────────────

const AgentState = Annotation.Root({
  messages: Annotation<Array<{ role: string; content: string }>>({
    reducer: (a, b) => [...a, ...b],
  }),
})

// ─── Graph Node ────────────────────────────────────────────────────────────────

async function answerNode(
  state: typeof AgentState.State
): Promise<Partial<typeof AgentState.State>> {
  const response = await model.invoke(state.messages)
  const content = typeof response.content === 'string'
    ? response.content
    : String(response.content)

  return {
    messages: [...state.messages, { role: 'assistant', content }],
  }
}

// ─── Graph Definition ──────────────────────────────────────────────────────────

const workflow = new StateGraph(AgentState)
  .addNode('answer', answerNode)
  .addEdge('__start__', 'answer')
  .addEdge('answer', END)

const checkpointer = new MemorySaver()

export const graph = workflow.compile({ checkpointer })

// ─── Public API ────────────────────────────────────────────────────────────────

export async function runWorkflow(input: string): Promise<WorkflowResult> {
  try {
    const result = await graph.invoke(
      {
        messages: [{ role: 'user', content: input }],
      },
      { configurable: { thread_id: crypto.randomUUID() } }
    )

    const lastMessage = result.messages[result.messages.length - 1]
    const response = lastMessage?.content || '无响应'

    return { response }
  } catch (err) {
    return {
      response: '',
      error: err instanceof Error ? err.message : '未知错误',
    }
  }
}

export async function* runWorkflowStream(
  input: string,
  threadId?: string
): AsyncGenerator<{ content?: string; done?: boolean; error?: string }, void, unknown> {
  const config = {
    configurable: { thread_id: threadId ?? crypto.randomUUID() },
  }

  try {
    const stream = await graph.stream(
      {
        messages: [{ role: 'user', content: input }],
      },
      config
    )

    let streamed = false
    for await (const event of stream) {
      for (const [key, value] of Object.entries(event)) {
        if (value && typeof value === 'object' && 'messages' in value) {
          const output = value as { messages: Array<{ role: string; content: string }> }
          const lastMessage = output.messages[output.messages.length - 1]
          if (lastMessage?.role === 'assistant' && lastMessage.content) {
            if (!streamed) {
              streamed = true
            }
            yield { content: lastMessage.content }
          }
        }
      }
    }
    yield { done: true }
  } catch (err) {
    yield { error: err instanceof Error ? err.message : 'Stream error' }
  }
}
