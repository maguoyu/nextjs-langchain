import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreateMenuSchema } from '@/types/schemas'
import type { Menu } from '@prisma/client'

function buildMenuTree(menus: Menu[]) {
  const map = new Map<string, Menu & { children: (Menu & { children: unknown[] })[] }>()
  const roots: (Menu & { children: (Menu & { children: unknown[] })[] })[] = []

  menus.forEach((m) => {
    map.set(m.id, { ...m, children: [] })
  })

  menus.forEach((m) => {
    const node = map.get(m.id)!
    if (m.parentId && map.has(m.parentId)) {
      map.get(m.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// 获取菜单列表（树形结构）
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const menus = await prisma.menu.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    })

    const tree = buildMenuTree(menus)

    return apiSuccess(tree)
  } catch (error) {
    return handleApiError(error)
  }
}

// 创建菜单
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:menu:add') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateMenuSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, code, type, parentId, path, icon, sort, status, keepAlive, external, visible, remark } = parsed.data

    const existing = await prisma.menu.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ code: 400, message: '菜单编码已存在' }, { status: 400 })
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        code,
        type,
        parentId: parentId || null,
        path: path || null,
        icon: icon || null,
        sort: sort ?? 0,
        status: status ?? 1,
        keepAlive: keepAlive ?? 1,
        external: external ?? 0,
        visible: visible ?? 1,
        remark: remark || null,
      },
    })

    return apiSuccess(menu, '创建成功')
  } catch (error) {
    return handleApiError(error)
  }
}
