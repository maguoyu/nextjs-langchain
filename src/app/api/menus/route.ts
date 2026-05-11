import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { CreateMenuDto } from '@/types'

// 获取菜单列表（树形结构）
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    const menus = await prisma.menu.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      include: {
        parent: true,
        children: true,
      },
    })

    // 构建树形结构
    const tree = buildMenuTree(menus)

    return NextResponse.json({ code: 200, message: 'success', data: tree })
  } catch (error) {
    console.error('Get menus error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}

// 构建菜单树
function buildMenuTree(menus: prisma.Menu[]) {
  const map = new Map<string, any>()
  const roots: any[] = []

  menus.forEach((m) => {
    map.set(m.id, { ...m, children: [] })
  })

  menus.forEach((m) => {
    const node = map.get(m.id)
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 创建菜单
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 检查是否有权限
    const hasPermission = session.user.permissions.includes('system:menu:add')
    if (!hasPermission && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body: CreateMenuDto = await request.json()
    const { name, code, type, parentId, path, icon, sort, status, keepAlive, external, visible, remark } = body

    // 检查菜单编码是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { code },
    })

    if (existingMenu) {
      return NextResponse.json({ code: 400, message: '菜单编码已存在' }, { status: 400 })
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        code,
        type,
        parentId,
        path,
        icon,
        sort: sort ?? 0,
        status: status ?? 1,
        keepAlive: keepAlive ?? 1,
        external: external ?? 0,
        visible: visible ?? 1,
        remark,
      },
    })

    return NextResponse.json({ code: 200, message: '创建成功', data: menu })
  } catch (error) {
    console.error('Create menu error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
