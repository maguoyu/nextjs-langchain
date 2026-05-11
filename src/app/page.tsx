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
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: '角色与权限管理',
    description: '可视化角色管理界面，支持灵活的角色权限分配，降低权限管理的复杂度。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: '动态菜单路由',
    description: '菜单与权限联动，基于数据库配置动态生成侧边栏，实现千人千面的菜单展示。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    title: '数据可视化大屏',
    description: '内置用户趋势、角色分布、API 调用量等多维度数据图表，直观呈现系统运行状态。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Next.js 15 + Auth.js v5',
    description: '基于最新技术栈构建，集成 JWT 认证、Redis 会话管理，提供企业级安全保障。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: '响应式设计',
    description: '适配桌面端与移动端，基于 Tailwind CSS 构建现代化的用户界面与交互体验。',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const techStack = [
  { name: 'Next.js 15', tag: 'App Router' },
  { name: 'TypeScript', tag: '类型安全' },
  { name: 'Auth.js v5', tag: 'JWT 认证' },
  { name: 'Redis', tag: '会话存储' },
  { name: 'Tailwind CSS', tag: '样式' },
  { name: 'Prisma', tag: 'ORM' },
  { name: 'LangChain', tag: 'AI 集成' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">RBAC 系统</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              演示
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              登录
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            基于 Next.js 15 + Auth.js v5 构建
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            企业级
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"> 权限管理平台</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            开箱即用的 RBAC 权限管理系统，支持细粒度权限控制、角色管理、动态菜单路由、数据可视化，助你快速构建安全的 Web 应用。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              立即体验
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              查看演示
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mb-8 tracking-widest uppercase">
            技术栈
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{tech.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{tech.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              功能特性
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              从权限模型到用户界面，提供完整的企业级解决方案
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNCA2LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">准备开始了吗？</h2>
              <p className="text-blue-100 mb-8 text-lg">
                使用默认账号 admin / 123456 登录，体验完整的权限管理系统
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-600 bg-white hover:bg-blue-50 rounded-xl transition-colors"
              >
                登录系统
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">RBAC 权限管理系统</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Built with Next.js 15 &middot; Auth.js v5 &middot; Redis
          </p>
        </div>
      </footer>
    </div>
  )
}
