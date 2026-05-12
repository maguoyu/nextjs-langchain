import { ChatOpenAI } from '@langchain/openai'
import { END, MemorySaver } from '@langchain/langgraph'

interface StepRecord {
  step: number
  thought: string
  action: string
  observation: string
}

interface AgentState {
  messages: Array<{ role: string; content: string }>
  input: string
  steps: StepRecord[]
  currentStep: number
}

const model = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0.7, openAIApiKey: process.env.OPENAI_API_KEY })

async function reasonNode(state: AgentState): Promise<Partial<AgentState>> {
  const lastMsg = state.messages[state.messages.length - 1]
  const thought = String(lastMsg.content)
  const action = 'Analyzing and reasoning about the task'
  return {
    steps: [
      ...state.steps,
      { step: state.currentStep + 1, thought, action, observation: '' },
    ],
    currentStep: state.currentStep + 1,
  }
}

async function actNode(state: AgentState): Promise<Partial<AgentState>> {
  const lastStep = state.steps[state.steps.length - 1]
  const steps = [...state.steps]
  steps[steps.length - 1] = { ...lastStep, observation: 'Analysis complete' }

  const reasoning = await model.invoke([
    { role: 'user', content: `Based on this request: "${state.input}", provide a thoughtful and helpful response. Think step by step.` },
  ])

  const content = typeof reasoning.content === 'string' ? reasoning.content : String(reasoning.content)

  return {
    steps: [...steps, {
      step: state.currentStep + 2,
      thought: content,
      action: 'Generating response',
      observation: 'Response ready',
    }],
    currentStep: state.currentStep + 2,
  }
}

function shouldContinue(state: AgentState): string {
  if (state.currentStep >= 2) return 'end'
  return 'reason'
}

async function runAgent(input: string): Promise<AgentState> {
  const state: AgentState = {
    messages: [{ role: 'user', content: input }],
    input,
    steps: [],
    currentStep: 0,
  }

  let current = state

  while (true) {
    const next = shouldContinue(current)
    if (next === 'end') break

    if (next === 'reason') {
      const result = await reasonNode(current)
      current = { ...current, ...result }
    } else if (next === 'act') {
      const result = await actNode(current)
      current = { ...current, ...result }
    }
  }

  return current
}

export interface WorkflowResult {
  response: string
  steps: StepRecord[]
}

export async function runWorkflow(input: string): Promise<WorkflowResult> {
  const finalState = await runAgent(input)
  const lastStep = finalState.steps[finalState.steps.length - 1]
  const response = lastStep?.thought || 'Completed'

  return {
    response,
    steps: finalState.steps,
  }
}
