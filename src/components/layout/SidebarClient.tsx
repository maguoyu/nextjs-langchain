'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import type { MenuNode } from '@/lib/menu'

interface Props {
  menus?: MenuNode[]
}

function ChevronIcon({ collapsed, className }: { collapsed: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

const ICON_SIZE = 'w-5 h-5'

const ICON_MAP: Record<string, React.ReactElement> = {
  // Dashboard
  Dashboard: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Home: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  // System
  Users: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  User: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Shield: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Roles: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Key: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Lock: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Permissions: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  // Navigation
  Menu: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  List: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  // Settings
  Settings: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Bot: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 012 2v1h2a3 3 0 013 3v6a3 3 0 01-3 3H8a3 3 0 01-3-3v-6a3 3 0 013-3h2V4a2 2 0 012-2z" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <path d="M9 10h6" />
    </svg>
  ),
  // Misc
  File: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Folder: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  Link: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  ExternalLink: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  // Default
  Default: (
    <svg className={ICON_SIZE} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

// Name to icon mapping for fallback
const NAME_ICON_MAP: Record<string, string> = {
  '首页': 'Home',
  '仪表盘': 'Dashboard',
  '数据大屏': 'Dashboard',
  '用户管理': 'Users',
  '用户': 'Users',
  '角色管理': 'Roles',
  '角色': 'Shield',
  '权限管理': 'Permissions',
  '权限': 'Key',
  '菜单管理': 'Menu',
  '菜单': 'List',
  '系统管理': 'Settings',
  '设置': 'Settings',
  'AI 对话': 'Bot',
  'AI聊天': 'Bot',
}

function getIcon(icon: string | null, name?: string) {
  // Try icon field first
  if (icon && ICON_MAP[icon]) return ICON_MAP[icon]
  
  // Try name mapping
  if (name) {
    const mappedIcon = NAME_ICON_MAP[name]
    if (mappedIcon && ICON_MAP[mappedIcon]) return ICON_MAP[mappedIcon]
  }
  
  return ICON_MAP['Default']
}

export function SidebarClient({ menus: propMenus }: Props) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const [menus, setMenus] = useState<MenuNode[]>(propMenus || [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function fetchMenus() {
      if (propMenus && propMenus.length > 0) {
        setMenus(propMenus)
        return
      }
      try {
        const res = await fetch('/api/menus')
        const data = await res.json()
        if (data.code === 200) {
          setMenus(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch menus:', error)
      }
    }
    fetchMenus()
  }, [propMenus])

  const isActive = (path: string | null) => path && pathname === path
  const isChildActive = (children?: MenuNode[]): boolean =>
    children?.some((c) => pathname === c.path || isChildActive(c.children)) ?? false

  if (!mounted) return null

  const renderMenu = (menu: MenuNode, isChild = false) => {
    const hasChildren = menu.children && menu.children.length > 0
    const active = isActive(menu.path)
    const childActive = isChildActive(menu.children)

    if (menu.type === 'BUTTON') return null

    return (
      <div key={menu.id}>
        {hasChildren ? (
          <div className="mb-2">
            {!collapsed && (
              <div className="px-3 py-2 mb-1">
                <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                  {menu.name}
                </span>
              </div>
            )}
            {collapsed && <div className="flex justify-center mb-1"><div className="w-6 h-px bg-[var(--sidebar-border)]" /></div>}
            <div className="space-y-0.5">
              {menu.children!.map((child) => renderMenu(child, true))}
            </div>
          </div>
        ) : (
          <Link
            href={menu.path ?? '#'}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 relative ${
              collapsed ? 'justify-center' : ''
            } ${
              active
                ? 'bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]'
            }`}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--sidebar-primary)]" />
            )}
            <span className={`shrink-0 ${active ? 'text-[var(--sidebar-primary)]' : 'text-[var(--muted-foreground)] group-hover:text-[var(--sidebar-foreground)]'}`}>
              {getIcon(menu.icon, menu.name)}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium whitespace-nowrap">{menu.name}</span>
            )}
          </Link>
        )}
      </div>
    )
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{ background: 'var(--sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-[68px] px-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-[var(--sidebar-foreground)] tracking-tight whitespace-nowrap">
              RBAC System
            </span>
          )}
        </div>
        <button
          onClick={toggle}
          className={`ml-auto p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-all ${collapsed ? 'mx-auto' : ''}`}
        >
          <ChevronIcon collapsed={collapsed} className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
        <div className="space-y-1">
          {menus.map((menu) => renderMenu(menu))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-[var(--sidebar-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--muted-foreground)] truncate">在线版本</p>
              <p className="text-[10px] text-[var(--muted-foreground)] opacity-60">v1.0.0</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
