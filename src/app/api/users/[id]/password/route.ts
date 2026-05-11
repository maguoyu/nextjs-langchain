import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { ChangePasswordSchema } from '@/types/schemas'

// 修改用户密码
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const parsed = ChangePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { oldPassword, newPassword } = parsed.data

    const isOwnPassword = id === session.user.id
    if (!isOwnPassword) {
      if (!session.user.permissions.includes('system:user:resetPwd') && !session.user.roles.includes('super_admin')) {
        return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
      }
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    if (isOwnPassword) {
      const bcrypt = await import('bcryptjs')
      const isValid = await bcrypt.compare(oldPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ code: 400, message: '原密码错误' }, { status: 400 })
      }
    }

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } })

    return apiSuccess(null, '密码修改成功')
  } catch (error) {
    return handleApiError(error)
  }
}
