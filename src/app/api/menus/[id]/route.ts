import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { UpdateMenuDto } from '@/types'

// 获取单个菜单
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

    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    })

    if (!menu) {
      return NextResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    }

    return NextResponse.json({ code: 200, message: 'success', data: menu })
  } catch (error) {
    console.error('Get menu error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 更新菜单
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
    const hasPermission = session.user.permissions.includes('system:menu:edit')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body: UpdateMenuDto = await request.json()
    const { name, type, parentId, path, icon, sort, status, keepAlive, external, visible, remark } = body

    // 检查菜单是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    })

    if (!existingMenu) {
      return NextResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    }

    // 不能将自己设为自己的父级
    if (parentId === id) {
      return NextResponse.json({ code: 400, message: '不能将自身设为父级' }, { status: 400 })
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        type,
        parentId,
        path,
        icon,
        sort,
        status,
        keepAlive,
        external,
        visible,
        remark,
      },
    })

    return NextResponse.json({ code: 200, message: '更新成功', data: menu })
  } catch (error) {
    console.error('Update menu error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 删除菜单
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
    const hasPermission = session.user.permissions.includes('system:menu:delete')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    // 检查是否有子菜单
    const childCount = await prisma.menu.count({
      where: { parentId: id },
    })

    if (childCount > 0) {
      return NextResponse.json({ code: 400, message: '该菜单存在子菜单，无法删除' }, { status: 400 })
    }

    await prisma.menu.delete({
      where: { id },
    })

    return NextResponse.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error('Delete menu error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
