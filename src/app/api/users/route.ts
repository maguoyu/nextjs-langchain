import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { CreateUserDto, UpdateUserDto, PaginatedResponse } from '@/types'

// 获取用户列表
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
          roles: {
            include: {
              role: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    // 处理返回数据，移除密码
    const list = users.map((user) => ({
      ...user,
      password: undefined,
      roles: user.roles.map((ur) => ur.role),
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
    console.error('Get users error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:user:add')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body: CreateUserDto = await request.json()
    const { username, password, name, email, phone, avatar, remark, roleIds } = body

    // 检查用户名是否存在
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json({ code: 400, message: '用户名已存在' }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户并关联角色
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        email,
        phone,
        avatar,
        remark,
        status: 1,
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

    return NextResponse.json({ code: 200, message: '创建成功', data: response })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
