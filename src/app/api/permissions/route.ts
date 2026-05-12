import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreatePermissionSchema, PaginationSchema } from '@/types/schemas'
import { PAGINATION } from '@/types/constants'
import type { Permission } from '@prisma/client'

function buildPermissionTree(permissions: Permission[]) {
  const map = new Map<string, Permission & { children: (Permission & { children: unknown[] })[] }>()
  const roots: (Permission & { children: (Permission & { children: unknown[] })[] })[] = []

  permissions.forEach((p) => {
    map.set(p.id, { ...p, children: [] })
  })

  permissions.forEach((p) => {
    const node = map.get(p.id)!
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function paginateTree(
  tree: (Permission & { children: unknown[] })[]
): (Permission & { children: unknown[] })[] {
  const flat: (Permission & { children: unknown[] })[] = []

  function flatten(nodes: (Permission & { children: unknown[] })[]) {
    for (const n of nodes) {
      flat.push(n)
      flatten(n.children as (Permission & { children: unknown[] })[])
    }
  }
  flatten(tree)
  return flat
}

// 获取权限列表（树形结构）
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

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.permission.count({ where }),
    ])

    const tree = buildPermissionTree(permissions)
    const flatAll = paginateTree(tree)
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const start = (page - 1) * pageSize
    const pagedFlat = flatAll.slice(start, start + pageSize)

    const pagedTree: (Permission & { children: unknown[] })[] = []
    const pagedIds = new Set(pagedFlat.map((p) => p.id))

    function rebuildTree(
      nodes: (Permission & { children: unknown[] })[]
    ): (Permission & { children: unknown[] })[] {
      const out: (Permission & { children: unknown[] })[] = []
      for (const n of nodes) {
        if (pagedIds.has(n.id)) {
          out.push({ ...n, children: rebuildTree(n.children as (Permission & { children: unknown[] })[]) })
        }
      }
      return out
    }
    for (const node of tree) {
      if (pagedIds.has(node.id)) {
        pagedTree.push({
          ...node,
          children: rebuildTree(node.children as (Permission & { children: unknown[] })[]),
        })
      }
    }

    return apiSuccess({ list: pagedTree, total, page, pageSize, totalPages })
  } catch (error) {
    return handleApiError(error)
  }
}

// 创建权限
export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    if (!session.user.permissions.includes('system:permission:add') && !session.user.roles.includes('super_admin')) {
      return NextResponse.json({ code: 403, message: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreatePermissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { code: 400, message: '参数错误', data: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { code, name, type, parentId, path, icon, sort, status, remark } = parsed.data

    const existing = await prisma.permission.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ code: 400, message: '权限编码已存在' }, { status: 400 })
    }

    const permission = await prisma.permission.create({
      data: {
        code,
        name,
        type,
        parentId: parentId || null,
        path: path || null,
        icon: icon || null,
        sort: sort ?? 0,
        status: status ?? 1,
        remark: remark || null,
      },
    })

    return apiSuccess(permission, '创建成功')
  } catch (error) {
    return handleApiError(error)
  }
}
