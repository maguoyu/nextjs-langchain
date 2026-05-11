'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import type { MenuNode } from '@/lib/menu'

interface Props {
  menus: MenuNode[]
}

function ChevronIcon({ collapsed, className }: { collapsed: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

const ICON_MAP: Record<string, React.ReactElement> = {
  Dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Bot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 012 2v1h2a3 3 0 013 3v6a3 3 0 01-3 3H8a3 3 0 01-3-3v-6a3 3 0 013-3h2V4a2 2 0 012-2z" />
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      <path d="M9 10h6" />
    </svg>
  ),
  Settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
}

function getIcon(icon: string | null) {
  if (!icon) return null
  if (ICON_MAP[icon]) return ICON_MAP[icon]

  const size = 'w-5 h-5'
  return (
    <span className={`${size} flex items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white/50`}>
      {icon.charAt(0).toUpperCase()}
    </span>
  )
}

export function SidebarClient({ menus }: Props) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebar()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const isActive = (path: string | null) => path && pathname === path
  const isChildActive = (children?: MenuNode[]) =>
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
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                  {menu.name}
                </span>
              </div>
            )}
            {collapsed && <div className="flex justify-center mb-1"><div className="w-6 h-px bg-white/10" /></div>}
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
                ? 'bg-white/15 text-white'
                : 'text-white/55 hover:text-white hover:bg-white/10'
            }`}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-400" />
            )}
            <span className={`shrink-0 ${active ? 'text-white' : 'group-hover:text-white/80'}`}>
              {getIcon(menu.icon)}
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
      style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #1a2e4a 50%, #152238 100%)' }}
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
            <span className="text-base font-bold text-white/90 tracking-tight whitespace-nowrap">
              RBAC System
            </span>
          )}
        </div>
        <button
          onClick={toggle}
          className={`ml-auto p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'mx-auto' : ''}`}
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
        <div className="px-4 py-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">在线版本</p>
              <p className="text-[10px] text-white/30">v1.0.0</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
