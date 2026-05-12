import { ChatOpenAI } from '@langchain/openai'

export const openaiModels = {
  gpt4oMini: () =>
    new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),

  gpt4o: () =>
    new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
}
