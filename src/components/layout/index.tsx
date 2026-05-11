'use client'

import { SessionProvider } from 'next-auth/react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <Header />
        <main className="pt-16 pb-6 px-6 transition-all duration-300">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}
