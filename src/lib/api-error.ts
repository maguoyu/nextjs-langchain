import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public code: number,
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: error.statusCode })
  }
  if (error instanceof Error) {
    console.error('[Server Error]', error.message)
  } else {
    console.error('[Server Error]', error)
  }
  return NextResponse.json({ code: 500, message: '服务器内部错误' }, { status: 500 })
}

export function apiSuccess<T>(data: T, message = 'success', code = 200) {
  return NextResponse.json({ code, message, data })
}

export function apiFail(code: number, message: string, statusCode = 400) {
  return NextResponse.json({ code, message }, { status: statusCode })
}
