import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

export const chatPrompt = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder('history'),
  ['human', '{input}'],
])

export const simpleOutputParser = new StringOutputParser()

export async function simpleChat(input: string, history: Array<{ role: string; content: string }> = []) {
  const model = (await import('./models')).openaiModels.default()
  const chain = chatPrompt.pipe(model).pipe(simpleOutputParser)
  return chain.invoke({ input, history })
}
