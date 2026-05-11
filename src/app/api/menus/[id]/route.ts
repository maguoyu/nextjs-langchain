import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { UpdateMenuSchema } from '@/types/schemas'

// 获取单个菜单
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      return NextResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    }

    return apiSuccess(menu)
  } catch (error) {
    return handleApiError(error)
  }
}

// 更新菜单
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:menu:edit') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = UpdateMenuSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, type, parentId, path, icon, sort, status, keepAlive, external, visible, remark } = parsed.data

    if (parentId === id) {
      return NextResponse.json({ code: 400, message: '不能将自身设为父级' }, { status: 400 })
    }

    const existing = await prisma.menu.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 404, message: '菜单不存在' }, { status: 404 })
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name,
        type,
        parentId: parentId === '' ? null : (parentId ?? null),
        path: path || null,
        icon: icon || null,
        sort,
        status,
        keepAlive,
        external,
        visible,
        remark: remark || null,
      },
    })

    return apiSuccess(menu, '更新成功')
  } catch (error) {
    return handleApiError(error)
  }
}

// 删除菜单
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:menu:delete') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    const childCount = await prisma.menu.count({ where: { parentId: id } })
    if (childCount > 0) {
      return NextResponse.json({ code: 400, message: '该菜单存在子菜单，无法删除' }, { status: 400 })
    }

    await prisma.menu.delete({ where: { id } })

    return apiSuccess(null, '删除成功')
  } catch (error) {
    return handleApiError(error)
  }
}
