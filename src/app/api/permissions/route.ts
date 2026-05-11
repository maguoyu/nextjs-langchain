import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'
import { CreatePermissionSchema } from '@/types/schemas'
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

// 获取权限列表（树形结构）
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const permissions = await prisma.permission.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }],
    })

    const tree = buildPermissionTree(permissions)

    return apiSuccess(tree)
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
