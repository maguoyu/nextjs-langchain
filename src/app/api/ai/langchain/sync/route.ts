import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { simpleChat } from '@/lib/ai/langchain'
import { ApiError, handleApiError } from '@/lib/api-error'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      throw new ApiError(401, 401, '未授权')
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new ApiError(500, 500, 'OPENAI_API_KEY is not configured.')
    }

    const body: RequestBody = await req.json()
    const { messages = [] } = body

    if (!messages.length) {
      throw new ApiError(400, 400, 'messages cannot be empty')
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== 'user') {
      throw new ApiError(400, 400, 'last message must be from user')
    }

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await simpleChat(lastMessage.content, history)

    return NextResponse.json({ code: 200, message: 'success', data: { role: 'assistant', content: response } })
  } catch (error) {
    return handleApiError(error)
  }
}
