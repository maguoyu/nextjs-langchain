'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import { usePathname } from 'next/navigation'
import { Avatar } from '@/components/ui'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: '数据大屏', sub: '系统数据统计与可视化展示' },
  '/dashboard/users': { title: '用户管理', sub: '管理系统用户账户与基本信息' },
  '/dashboard/roles': { title: '角色管理', sub: '管理系统角色与权限分配' },
  '/dashboard/permissions': { title: '权限管理', sub: '精细化权限配置与分配' },
  '/dashboard/menus': { title: '菜单管理', sub: '动态菜单路由与层级配置' },
}

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { collapsed } = useSidebar()
  const pathname = usePathname()

  const pageInfo = PAGE_TITLES[pathname] || { title: '控制台', sub: '' }
  const userName = session?.user?.name || session?.user?.username || '用户'
  const roles = session?.user?.roles?.join(' / ') || '用户'

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  return (
    <header
      className={`fixed top-0 right-0 h-14 flex items-center justify-between px-5 transition-all duration-200 z-30 ${
        collapsed ? 'left-[72px]' : 'left-[260px]'
      }`}
      style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <h1 className="text-sm font-semibold text-[var(--foreground)]">{pageInfo.title}</h1>
        <p className="text-xs text-[var(--muted-foreground)] leading-tight">{pageInfo.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-3 border-l border-[var(--border)]">
          <Avatar alt={userName} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-[var(--foreground)] leading-none">{userName}</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{roles}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] px-2.5 py-1.5 rounded-md hover:bg-[var(--accent)] transition-colors"
          title="退出登录"
        >
          退出
        </button>
      </div>
    </header>
  )
}
