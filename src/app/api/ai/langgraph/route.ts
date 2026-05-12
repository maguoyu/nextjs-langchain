import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runWorkflow } from '@/lib/ai/langgraph'
import { ApiError, handleApiError } from '@/lib/api-error'

export const runtime = 'nodejs'
export const maxDuration = 60

interface RequestBody {
  task: string
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      throw new ApiError(401, 401, '未授权')
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new ApiError(500, 500, 'OPENAI_API_KEY is not configured. Please add it to your .env file.')
    }

    const body: RequestBody = await req.json()
    const { task } = body

    if (!task?.trim()) {
      throw new ApiError(400, 400, 'task cannot be empty')
    }

    const result = await runWorkflow(task)

    return NextResponse.json({ code: 200, message: 'success', data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
