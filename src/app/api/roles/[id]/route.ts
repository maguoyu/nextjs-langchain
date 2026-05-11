import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { UpdateRoleSchema } from '@/types/schemas'

// 获取单个角色
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })

    if (!role) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    return apiSuccess({ ...role, permissions: role.permissions.map((rp) => rp.permission) })
  } catch (error) {
    return handleApiError(error)
  }
}

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:role:edit') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = UpdateRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, status, sort, remark, permissionIds } = parsed.data

    const existingRole = await prisma.role.findUnique({ where: { id } })
    if (!existingRole) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    if (existingRole.code === 'super_admin') {
      return NextResponse.json({ code: 400, message: '不能修改超级管理员角色' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      if (permissionIds !== undefined) {
        await tx.rolePermission.deleteMany({ where: { roleId: id } })
      }
      return tx.role.update({
        where: { id },
        data: {
          name,
          status,
          sort,
          remark: remark || null,
          permissions: permissionIds !== undefined
            ? { create: permissionIds.map((permissionId) => ({ permission: { connect: { id: permissionId } } })) }
            : undefined,
        },
        include: { permissions: { include: { permission: true } } },
      })
    })

    const updated = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    })

    return apiSuccess(
      { ...updated, permissions: updated!.permissions.map((rp) => rp.permission) },
      '更新成功'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:role:delete') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const { id } = await params

    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { users: true },
    })

    if (!existingRole) {
      return NextResponse.json({ code: 404, message: '角色不存在' }, { status: 404 })
    }

    if (existingRole.code === 'super_admin') {
      return NextResponse.json({ code: 400, message: '不能删除超级管理员角色' }, { status: 400 })
    }

    if (existingRole.users.length > 0) {
      return NextResponse.json({ code: 400, message: '该角色已被用户使用，无法删除' }, { status: 400 })
    }

    await prisma.role.delete({ where: { id } })

    return apiSuccess(null, '删除成功')
  } catch (error) {
    return handleApiError(error)
  }
}
