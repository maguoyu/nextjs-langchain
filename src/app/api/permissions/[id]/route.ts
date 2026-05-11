import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { UpdatePermissionSchema } from '@/types/schemas'

// 获取单个权限
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const permission = await prisma.permission.findUnique({ where: { id } })

    if (!permission) {
      return NextResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    }

    return apiSuccess(permission)
  } catch (error) {
    return handleApiError(error)
  }
}

// 更新权限
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:permission:edit') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = UpdatePermissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, type, parentId, path, icon, sort, status, remark } = parsed.data

    if (parentId === id) {
      return NextResponse.json({ code: 400, message: '不能将自身设为父级' }, { status: 400 })
    }

    const existing = await prisma.permission.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ code: 404, message: '权限不存在' }, { status: 404 })
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        type,
        parentId: parentId === '' ? null : (parentId ?? null),
        path: path || null,
        icon: icon || null,
        sort,
        status,
        remark: remark || null,
      },
    })

    return apiSuccess(permission, '更新成功')
  } catch (error) {
    return handleApiError(error)
  }
}

// 删除权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:permission:delete') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    const childCount = await prisma.permission.count({ where: { parentId: id } })
    if (childCount > 0) {
      return NextResponse.json({ code: 400, message: '该权限存在子权限，无法删除' }, { status: 400 })
    }

    const rolePermissionCount = await prisma.rolePermission.count({ where: { permissionId: id } })
    if (rolePermissionCount > 0) {
      return NextResponse.json({ code: 400, message: '该权限已被角色使用，无法删除' }, { status: 400 })
    }

    await prisma.permission.delete({ where: { id } })

    return apiSuccess(null, '删除成功')
  } catch (error) {
    return handleApiError(error)
  }
}
