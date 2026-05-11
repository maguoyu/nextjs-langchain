import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RBAC 系统 - 基于 Next.js 的权限管理平台',
  description: '开箱即用的 RBAC 权限管理系统，支持细粒度权限控制、角色管理、菜单权限、数据可视化。',
}

const features = [
  {
    title: '细粒度权限控制',
    description: '基于 RBAC 模型，支持页面级、按钮级、数据级权限控制，满足企业级安全需求。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    color: 'from-blue-500/15 to-blue-600/5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  },
  {
    title: '角色与权限管理',
    description: '可视化角色管理界面，支持灵活的角色权限分配，降低权限管理的复杂度。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: 'from-emerald-500/15 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  },
  {
    title: '动态菜单路由',
    description: '菜单与权限联动，基于数据库配置动态生成侧边栏，实现千人千面的菜单展示。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    color: 'from-purple-500/15 to-purple-600/5 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
  },
  {
    title: '数据可视化大屏',
    description: '内置用户趋势、角色分布、API 调用量等多维度数据图表，直观呈现系统运行状态。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: 'from-orange-500/15 to-orange-600/5 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
  },
  {
    title: 'Next.js 15 + Auth.js v5',
    description: '基于最新技术栈构建，集成 JWT 认证、Redis 会话管理，提供企业级安全保障。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    color: 'from-cyan-500/15 to-cyan-600/5 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50',
  },
  {
    title: '响应式设计',
    description: '适配桌面端与移动端，基于 Tailwind CSS 构建现代化的用户界面与交互体验。',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    color: 'from-rose-500/15 to-rose-600/5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
  },
]

const techStack = [
  { name: 'Next.js 15', tag: 'App Router' },
  { name: 'TypeScript', tag: '类型安全' },
  { name: 'Auth.js v5', tag: 'JWT 认证' },
  { name: 'Redis', tag: '会话存储' },
  { name: 'Tailwind CSS', tag: '样式' },
  { name: 'Prisma', tag: 'ORM' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">RBAC System</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"
            >
              演示
            </Link>
            <Link
              href="/auth/login"
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                boxShadow: '0 2px 10px rgba(59,130,246,0.3)',
              }}
            >
              登录系统
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.1) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#3b82f6',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            基于 Next.js 15 + Auth.js v5 构建
          </div>

          <h1 className="text-5xl md:text-[4.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white mb-6">
            企业级
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              {' '}权限管理平台
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            开箱即用的 RBAC 权限管理系统，支持细粒度权限控制、角色管理、动态菜单路由、数据可视化，助你快速构建安全的 Web 应用。
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/login"
              className="px-8 py-3.5 text-base font-semibold text-white rounded-2xl transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
              }}
            >
              立即体验
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-semibold text-gray-600 dark:text-gray-300 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
              查看演示
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-14 px-6 border-y"
        style={{ borderColor: 'rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.01)' }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mb-8 tracking-[0.2em] uppercase font-medium">
            技术栈
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
                style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.07)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{tech.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">· {tech.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              功能特性
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400">
              从权限模型到用户界面，提供完整的企业级解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)]"
                style={{
                  background: 'white',
                  borderColor: 'rgba(0,0,0,0.06)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${feature.color} bg-gradient-to-br`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #4338ca 40%, #7c3aed 70%, #db2777 100%)',
              boxShadow: '0 25px 80px rgba(99,102,241,0.2)',
            }}
          >
            {/* Glow effect */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">准备开始了吗？</h2>
              <p className="text-blue-100 mb-9 text-base">
                使用默认账号 <span className="font-mono font-semibold">admin</span> / <span className="font-mono font-semibold">123456</span> 登录，体验完整系统
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: 'white',
                  color: '#4f46e5',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                登录系统
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">RBAC 权限管理系统</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            Built with Next.js 15 &middot; Auth.js v5 &middot; Redis
          </p>
        </div>
      </footer>
    </div>
  )
}
