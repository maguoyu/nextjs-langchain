import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CreatePermissionDto } from '@/types'

// 获取权限列表（树形结构）
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: {
        parent: true,
        children: true,
      },
    })

    // 构建树形结构
    const tree = buildPermissionTree(permissions)

    return NextResponse.json({ code: 200, message: 'success', data: tree })
  } catch (error) {
    console.error('Get permissions error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 构建权限树
function buildPermissionTree(permissions: prisma.Permission[]) {
  const map = new Map<string, any>()
  const roots: any[] = []

  permissions.forEach((p) => {
    map.set(p.id, { ...p, children: [] })
  })

  permissions.forEach((p) => {
    const node = map.get(p.id)
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 创建权限
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:permission:add')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body: CreatePermissionDto = await request.json()
    const { code, name, type, parentId, path, icon, sort, status, remark } = body

    // 检查权限编码是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { code },
    })

    if (existingPermission) {
      return NextResponse.json({ code: 400, message: '权限编码已存在' }, { status: 400 })
    }

    const permission = await prisma.permission.create({
      data: {
        code,
        name,
        type,
        parentId,
        path,
        icon,
        sort: sort ?? 0,
        status: status ?? 1,
        remark,
      },
    })

    return NextResponse.json({ code: 200, message: '创建成功', data: permission })
  } catch (error) {
    console.error('Create permission error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
