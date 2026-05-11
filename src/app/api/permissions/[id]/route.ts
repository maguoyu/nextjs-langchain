import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { UpdatePermissionDto } from '@/types'

// 获取单个权限
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

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    })

    if (!permission) {
      return NextResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    }

    return NextResponse.json({ code: 200, message: 'success', data: permission })
  } catch (error) {
    console.error('Get permission error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 更新权限
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
    const hasPermission = session.user.permissions.includes('system:permission:edit')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body: UpdatePermissionDto = await request.json()
    const { name, type, parentId, path, icon, sort, status, remark } = body

    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      return NextResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    }

    // 不能将自己设为自己的父级
    if (parentId === id) {
      return NextResponse.json({ code: 400, message: '不能将自身设为父级' }, { status: 400 })
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        type,
        parentId,
        path,
        icon,
        sort,
        status,
        remark,
      },
    })

    return NextResponse.json({ code: 200, message: '更新成功', data: permission })
  } catch (error) {
    console.error('Update permission error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 删除权限
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
    const hasPermission = session.user.permissions.includes('system:permission:delete')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    // 检查是否有子权限
    const childCount = await prisma.permission.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      return NextResponse.json({ code: 400, message: '该权限存在子权限，无法删除' }, { status: 400 })
    }

    // 检查是否有角色使用该权限
    const rolePermissionCount = await prisma.rolePermission.count({
      where: { permissionId: id },
    })

    if (rolePermissionCount > 0) {
      return NextResponse.json({ code: 400, message: '该权限已被角色使用，无法删除' }, { status: 400 })
    }

    await prisma.permission.delete({
      where: { id },
    })

    return NextResponse.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete permission error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
