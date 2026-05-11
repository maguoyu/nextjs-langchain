import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreateRoleSchema, PaginationSchema } from '@/types/schemas'
import { PAGINATION } from '@/types/constants'

// 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const searchParams = request.nextUrl.searchParams
    const parsed = PaginationSchema.safeParse({
      page: searchParams.get('page') || PAGINATION.DEFAULT_PAGE,
      pageSize: searchParams.get('pageSize') || PAGINATION.DEFAULT_PAGE_SIZE,
      keyword: searchParams.get('keyword') || '',
    })
    const { page, pageSize, keyword } = parsed.success ? parsed.data : { page: 1, pageSize: 10, keyword: '' }

    const where = keyword
      ? {
          OR: [
            { code: { contains: keyword } },
            { name: { contains: keyword } },
          ],
        }
      : {}

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: { permissions: { include: { permission: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      prisma.role.count({ where }),
    ])

    const list = roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }))

    return apiSuccess({ list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (error) {
    return handleApiError(error)
  }
}

// 创建角色
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:role:add') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { code, name, status, sort, remark, permissionIds } = parsed.data

    const existingRole = await prisma.role.findUnique({ where: { code } })
    if (existingRole) {
      return NextResponse.json({ code: 400, message: '角色编码已存在' }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        code,
        name,
        status: status ?? 1,
        sort: sort ?? 0,
        remark: remark || null,
        permissions: permissionIds?.length
          ? { create: permissionIds.map((permissionId) => ({ permission: { connect: { id: permissionId } } })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    })

    return apiSuccess(
      { ...role, permissions: role.permissions.map((rp) => rp.permission) },
      '创建成功'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
