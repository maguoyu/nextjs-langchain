import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CreateRoleDto, PaginatedResponse } from '@/types'

// 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const keyword = searchParams.get('keyword') || ''

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
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      prisma.role.count({ where }),
    ])

    // 处理返回数据
    const list = roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }))

    const response: PaginatedResponse<typeof list[0]> = {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }

    return NextResponse.json({ code: 200, message: 'success', data: response })
  } catch (error) {
    console.error('Get roles error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 创建角色
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:role:add')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body: CreateRoleDto = await request.json()
    const { code, name, status, sort, remark, permissionIds } = body

    // 检查角色编码是否存在
    const existingRole = await prisma.role.findUnique({
      where: { code },
    })

    if (existingRole) {
      return NextResponse.json({ code: 400, message: '角色编码已存在' }, { status: 400 })
    }

    // 创建角色并关联权限
    const role = await prisma.role.create({
      data: {
        code,
        name,
        status: status ?? 1,
        sort: sort ?? 0,
        remark,
        permissions: permissionIds?.length
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

    return NextResponse.json({ code: 200, message: '创建成功', data: response })
  } catch (error) {
    console.error('Create role error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
