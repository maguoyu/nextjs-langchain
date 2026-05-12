import { ChatOpenAI } from '@langchain/openai'
import { fetch as undiciFetch, Agent } from 'undici'

const agent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
})

function loggingFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url
  console.log('[ChatOpenAI] → POST', url, { modelName, baseURL, apiKey: apiKey ? `${apiKey.slice(0, 8)}...` : undefined })
  const start = Date.now()
  return undiciFetch(input, init).then(
    (res) => {
      console.log(`[ChatOpenAI] ← ${res.status} (${Date.now() - start}ms)`, url)
      return res
    },
    (err) => {
      console.error(`[ChatOpenAI] ✗ ${Date.now() - start}ms`, url, err.message)
      throw err
    }
  )
}

const modelName = process.env.MODEL_NAME || 'gpt-4o-mini'
const apiKey = (process.env.OPENAI_API_KEY || '').trim()
const baseURL = process.env.OPENAI_BASE_URL?.trim()

console.log('[ChatOpenAI] init', { modelName, baseURL, hasApiKey: !!apiKey })

function createModel(config: Record<string, unknown>) {
  return {
    apiKey,
    ...(baseURL ? { configuration: { baseURL } } : {}),
    ...config,
  }
}

function makeModel(fields: {
  modelName: string
  temperature: number
  maxTokens: number
}) {
  const { modelName: m, temperature, maxTokens } = fields
  const opts = createModel({ modelName: m, temperature, maxTokens })
  return new ChatOpenAI({
    ...opts,
    configuration: {
      ...(opts.configuration as object),
      fetch: loggingFetch,
    },
  })
}

export const openaiModels = {
  default: () =>
    makeModel({ modelName, temperature: 0.7, maxTokens: 1024 }),

  gpt4oMini: () =>
    makeModel({ modelName: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024 }),

  gpt4o: () =>
    makeModel({ modelName: 'gpt-4o', temperature: 0.7, maxTokens: 2048 }),
}
