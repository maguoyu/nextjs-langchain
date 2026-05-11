'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui'
import { useSidebarStore } from '@/lib/store'

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { collapsed } = useSidebarStore()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 transition-all duration-300 z-30 ${
        collapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {session?.user?.name || '用户'}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={session?.user?.name} size="sm" />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session?.user?.roles?.join(', ') || '用户'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>退出</span>
        </button>
      </div>
    </header>
  )
}
