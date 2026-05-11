import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { UpdateUserDto, ChangePasswordDto } from '@/types'

// 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    const response = {
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
    }

    return NextResponse.json({ code: 200, message: 'success', data: response })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:user:edit')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body: UpdateUserDto = await request.json()
    const { name, email, phone, avatar, remark, status, roleIds } = body

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    // 如果更新角色，先删除旧的角色关联
    if (roleIds !== undefined) {
      await prisma.userRole.deleteMany({
        where: { userId: id },
      })
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        avatar,
        remark,
        status,
        roles: roleIds?.length
          ? {
              create: roleIds.map((roleId) => ({
                role: { connect: { id: roleId } },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    const response = {
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
    }

    return NextResponse.json({ code: 200, message: '更新成功', data: response })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:user:delete')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    // 不能删除自己
    if (id === session.user.id) {
      return NextResponse.json({ code: 400, message: '不能删除当前登录用户' }, { status: 400 })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ code: 404, message: '用户不存在' }, { status: 404 })
    }

    // 不能删除超级管理员
    if (existingUser.username === 'admin') {
      return NextResponse.json({ code: 400, message: '不能删除超级管理员账号' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
