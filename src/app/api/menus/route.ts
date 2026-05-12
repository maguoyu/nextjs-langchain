import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreateMenuSchema, PaginationSchema } from '@/types/schemas'
import { PAGINATION } from '@/types/constants'
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

function paginateTree(
  tree: (Menu & { children: unknown[] })[]
): (Menu & { children: unknown[] })[] {
  const flat: (Menu & { children: unknown[] })[] = []

  function flatten(nodes: (Menu & { children: unknown[] })[]) {
    for (const n of nodes) {
      flat.push(n)
      flatten(n.children as (Menu & { children: unknown[] })[])
    }
  }
  flatten(tree)
  return flat
}

// 获取菜单列表（树形结构）
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

    const { page, pageSize, keyword } = parsed.success
      ? parsed.data
      : { page: 1, pageSize: 10, keyword: '' }

    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword } },
            { code: { contains: keyword } },
          ],
        }
      : {}

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.menu.count({ where }),
    ])

    const tree = buildMenuTree(menus)
    const flatAll = paginateTree(tree)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const pagedFlat = flatAll.slice(start, start + pageSize)

    const pagedTree: (Menu & { children: unknown[] })[] = []
    const pagedIds = new Set(pagedFlat.map((m) => m.id))

    function rebuildTree(
      nodes: (Menu & { children: unknown[] })[]
    ): (Menu & { children: unknown[] })[] {
      const out: (Menu & { children: unknown[] })[] = []
      for (const n of nodes) {
        if (pagedIds.has(n.id)) {
          out.push({ ...n, children: rebuildTree(n.children as (Menu & { children: unknown[] })[]) })
        }
      }
      return out
    }
    for (const node of tree) {
      if (pagedIds.has(node.id)) {
        pagedTree.push({
          ...node,
          children: rebuildTree(node.children as (Menu & { children: unknown[] })[]),
        })
      }
    }

    return apiSuccess({ list: pagedTree, total, page, pageSize, totalPages })
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
