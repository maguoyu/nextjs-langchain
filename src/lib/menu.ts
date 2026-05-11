import prisma from './prisma'
import type { Session } from 'next-auth'

export interface MenuNode {
  id: string
  name: string
  code: string
  type: string
  parentId: string | null
  path: string | null
  icon: string | null
  sort: number
  status: number
  visible: number
  children?: MenuNode[]
}

const SUPER_ADMIN_CODE = 'super_admin'

function buildTree(menus: MenuNode[]): MenuNode[] {
  const map = new Map<string, MenuNode>()
  const roots: MenuNode[] = []

  for (const menu of menus) {
    map.set(menu.id, { ...menu, children: [] })
  }

  for (const menu of map.values()) {
    if (menu.parentId && map.has(menu.parentId)) {
      map.get(menu.parentId)!.children!.push(menu)
    } else {
      roots.push(menu)
    }
  }

  const sort = (arr: MenuNode[]) => {
    arr.sort((a, b) => a.sort - b.sort)
    for (const m of arr) {
      if (m.children!.length > 0) sort(m.children!)
    }
  }

  sort(roots)
  return roots
}

export async function getUserMenus(user: Session['user']): Promise<MenuNode[]> {
  let raw: MenuNode[]

  if (user.roles.includes(SUPER_ADMIN_CODE)) {
    const rows = await prisma.menu.findMany({
      where: { status: 1, visible: 1 },
      orderBy: { sort: 'asc' },
    })
    raw = rows as MenuNode[]
  } else {
    const rows = await prisma.menu.findMany({
      where: {
        status: 1,
        visible: 1,
        type: { in: ['CATALOG', 'MENU'] },
        code: { in: user.permissions as string[] },
      },
      orderBy: { sort: 'asc' },
    })
    raw = rows as MenuNode[]
  }

  return buildTree(raw)
}
