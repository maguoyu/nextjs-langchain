'use client'

import { useSidebar } from './sidebar-context'
import { SidebarClient } from './SidebarClient'
import { Header } from './header'
import { SidebarProvider } from './sidebar-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  
  return (
    <>
      <SidebarClient menus={[]} />
      <Header />
      <main className={`pt-14 transition-all duration-200 ${collapsed ? 'pl-[72px]' : 'pl-[260px]'}`}>
        <div className="mx-auto max-w-[1400px] p-5">
          {children}
        </div>
      </main>
    </>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen" style={{ background: 'var(--app-background)' }}>
        <LayoutContent>{children}</LayoutContent>
      </div>
    </SidebarProvider>
  )
}
