import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import { hasPermission } from './permissions'
import { ApiError, handleApiError } from './api-error'
import type { Session } from 'next-auth'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    return {
      session: null as Session | null,
      error: NextResponse.json({ code: 401, message: '未登录' }, { status: 401 }),
    }
  }
  return { session, error: null }
}

export async function requirePermission(permission: string) {
  const { session, error } = await requireAuth()
  if (error || !session) return { session: null, error }
  if (!hasPermission(session.user, permission)) {
    return {
      session: null,
      error: NextResponse.json({ code: 403, message: '无权限' }, { status: 403 }),
    }
  }
  return { session, error: null }
}

export function throwApiError(code: number, statusCode: number, message: string): never {
  throw new ApiError(code, statusCode, message)
}

export { handleApiError }
