'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import { usePathname } from 'next/navigation'

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
  const roles = session?.user?.roles?.join(' · ') || '用户'

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  return (
    <header
      className={`fixed top-0 right-0 h-[68px] flex items-center justify-between px-6 transition-all duration-300 z-30 backdrop-blur-md ${
        collapsed ? 'left-[72px]' : 'left-[260px]'
      }`}
      style={{
        background: 'rgba(255,255,255,0.82)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-800 dark:text-white">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">
            {pageInfo.sub}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* User info */}
        <div className="flex items-center gap-3 pl-5 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none">
              {userName}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {roles}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-blue-500/20">
            {userName.charAt(0).toUpperCase()}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
            title="退出登录"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-xs font-medium hidden md:inline">退出</span>
          </button>
        </div>
      </div>
    </header>
  )
}
