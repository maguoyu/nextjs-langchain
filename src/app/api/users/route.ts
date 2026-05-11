import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreateUserSchema, PaginationSchema } from '@/types/schemas'
import { PAGINATION } from '@/types/constants'

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
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
            { username: { contains: keyword } },
            { name: { contains: keyword } },
            { email: { contains: keyword } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          roles: { include: { role: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    const list = users.map((user) => ({
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
    }))

    return apiSuccess({
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:user:add') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateUserSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { username, password, name, email, phone, avatar, remark, roleIds } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) {
      return NextResponse.json({ code: 400, message: '用户名已存在' }, { status: 400 })
    }

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email: email || null,
        phone: phone || null,
        avatar: avatar || null,
        remark: remark || null,
        status: 1,
        roles: roleIds?.length
          ? { create: roleIds.map((roleId) => ({ role: { connect: { id: roleId } } })) }
          : undefined,
      },
      include: { roles: { include: { role: true } } },
    })

    const response = {
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
    }

    return apiSuccess(response, '创建成功')
  } catch (error) {
    return handleApiError(error)
  }
}
