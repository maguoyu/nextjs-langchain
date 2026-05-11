import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { UpdateUserSchema, ChangePasswordSchema } from '@/types/schemas'

// 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    })

    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    return apiSuccess({
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:user:edit') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = UpdateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, phone, avatar, remark, status, roleIds } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      if (roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: id } })
      }
      return tx.user.update({
        where: { id },
        data: {
          name,
          email: email || null,
          phone: phone || null,
          avatar: avatar || null,
          remark: remark || null,
          status,
          roles: roleIds?.length
            ? { create: roleIds.map((roleId) => ({ role: { connect: { id: roleId } } })) }
            : undefined,
        },
        include: { roles: { include: { role: true } } },
      })
    })

    const updated = await prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    })

    return apiSuccess({
      ...updated,
      password: undefined,
      roles: updated!.roles.map((ur) => ur.role),
    }, '更新成功')
  } catch (error) {
    return handleApiError(error)
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:user:delete') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    if (id === session.user.id) {
      return NextResponse.json({ code: 400, message: '不能删除当前登录用户' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    if (existingUser.username === 'admin') {
      return NextResponse.json({ code: 400, message: '不能删除超级管理员账号' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    return apiSuccess(null, '删除成功')
  } catch (error) {
    return handleApiError(error)
  }
}
