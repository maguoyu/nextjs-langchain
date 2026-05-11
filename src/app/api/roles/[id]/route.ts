import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { UpdateRoleDto } from '@/types'

// 获取单个角色
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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    const response = {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }

    return NextResponse.json({ code: 200, message: 'success', data: response })
  } catch (error) {
    console.error('Get role error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 更新角色
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
    const hasPermission = session.user.permissions.includes('system:role:edit')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body: UpdateRoleDto = await request.json()
    const { name, status, sort, remark, permissionIds } = body

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    // 不能修改超级管理员角色
    if (existingRole.code === 'super_admin') {
      return NextResponse.json({ code: 400, message: '不能修改超级管理员角色' }, { status: 400 })
    }

    // 如果更新权限，先删除旧的权限关联
    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })
    }

    // 更新角色
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        status,
        sort,
        remark,
        permissions: permissionIds !== undefined
          ? {
              create: permissionIds.map((permissionId) => ({
                permission: { connect: { id: permissionId } },
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    const response = {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }

    return NextResponse.json({ code: 200, message: '更新成功', data: response })
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 删除角色
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
    const hasPermission = session.user.permissions.includes('system:role:delete')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
      },
    })

    if (!existingRole) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    // 不能删除超级管理员角色
    if (existingRole.code === 'super_admin') {
      return NextResponse.json({ code: 400, message: '不能删除超级管理员角色' }, { status: 400 })
    }

    // 检查是否有用户使用该角色
    if (existingRole.users.length > 0) {
      return NextResponse.json({ code: 400, message: '该角色已被用户使用，无法删除' }, { status: 400 })
    }

    await prisma.role.delete({
      where: { id },
    })

    return NextResponse.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
