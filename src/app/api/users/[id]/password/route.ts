import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { ChangePasswordDto } from '@/types'

// 修改用户密码
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const body: ChangePasswordDto = await request.json()
    const { oldPassword, newPassword } = body

    // 检查是否有权限（修改自己的密码不需要特殊权限，其他用户需要管理员权限）
    const isOwnPassword = id === session.user.id
    if (!isOwnPassword) {
      const hasPermission = session.user.permissions.includes('system:user:resetPwd')
      if (!hasPermission && !session.user.roles.includes('super_admin')) {
        return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
      }
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    // 如果是修改自己的密码，需要验证原密码
    if (isOwnPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ code: 400, message: '原密码错误' }, { status: 400 })
      }
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ code: 200, message: '密码修改成功' })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
