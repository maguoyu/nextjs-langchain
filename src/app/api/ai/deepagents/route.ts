import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { callDeepAgents } from '@/lib/ai/deepagents'
import { ApiError, handleApiError } from '@/lib/api-error'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
  thinking?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      throw new ApiError(401, 401, '未授权')
    }

    if (!process.env.DEEPAGENTS_API_KEY) {
      throw new ApiError(500, 500, 'DEEPAGENTS_API_KEY is not configured. Please add it to your .env file.')
    }

    const body: RequestBody = await req.json()
    const { messages = [], thinking = true } = body

    if (!messages.length) {
      throw new ApiError(400, 400, 'messages cannot be empty')
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      throw new ApiError(400, 400, 'last message must be from user')
    }

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    const result = await callDeepAgents(history, { thinking })

    return NextResponse.json({ code: 200, message: 'success', data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
