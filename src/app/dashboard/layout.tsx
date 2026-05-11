import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserMenus } from '@/lib/menu'
import { SidebarClient } from '@/components/layout/SidebarClient'
import { Header } from '@/components/layout/header'
import { SidebarProvider } from '@/components/layout/sidebar-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const menus = await getUserMenus(session.user)

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.04) 0%, transparent 50%)',
          }}
        />
        <div className="relative">
          <SidebarClient menus={menus} />
          <Header />
          <main className="pt-[68px] pb-8 px-6 transition-all duration-300">
            <div className="mx-auto max-w-[1400px] mt-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
