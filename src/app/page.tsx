import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui'

export const metadata: Metadata = {
  title: 'RBAC 系统 - 基于 Next.js 的权限管理平台',
  description: '开箱即用的 RBAC 权限管理系统，支持细粒度权限控制、角色管理、菜单权限、数据可视化。',
}

const features = [
  {
    title: '细粒度权限控制',
    description: '基于 RBAC 模型，支持页面级、按钮级、数据级权限控制，满足企业级安全需求。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    gradient: 'bg-[var(--chart-1)]',
  },
  {
    title: '角色与权限管理',
    description: '可视化角色管理界面，支持灵活的角色权限分配，降低权限管理的复杂度。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    gradient: 'bg-[var(--chart-2)]',
  },
  {
    title: '动态菜单路由',
    description: '菜单与权限联动，基于数据库配置动态生成侧边栏，实现千人千面的菜单展示。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    gradient: 'bg-[var(--chart-3)]',
  },
  {
    title: '数据可视化大屏',
    description: '内置用户趋势、角色分布、API 调用量等多维度数据图表，直观呈现系统运行状态。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    gradient: 'bg-[var(--chart-4)]',
  },
  {
    title: 'Next.js 15 + Auth.js v5',
    description: '基于最新技术栈构建，集成 JWT 认证、Redis 会话管理，提供企业级安全保障。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    gradient: 'bg-[var(--chart-5)]',
  },
  {
    title: '响应式设计',
    description: '适配桌面端与移动端，基于 Tailwind CSS 构建现代化的用户界面与交互体验。',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    gradient: 'bg-[var(--sidebar-primary)]',
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
    <div className="min-h-screen" style={{ background: 'var(--app-background)' }}>
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 backdrop-blur-md border-b"
        style={{ background: 'color-mix(in oklch, var(--background) 80%, transparent)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--sidebar-primary)' }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <span className="text-sm font-bold text-[var(--foreground)]">RBAC System</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-4 py-1.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              演示
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-1.5 text-sm font-medium text-white rounded-md transition-colors"
              style={{ background: 'var(--sidebar-primary)' }}
            >
              登录
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sidebar-primary)' }} />
            基于 Next.js 15 + Auth.js v5 构建
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            企业级<span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, var(--sidebar-primary), var(--chart-3))' }}> 权限管理平台</span>
          </h1>

          <p className="text-base text-[var(--muted-foreground)] mb-10 max-w-xl mx-auto leading-relaxed">
            开箱即用的 RBAC 权限管理系统，支持细粒度权限控制、角色管理、动态菜单路由、数据可视化，助你快速构建安全的 Web 应用。
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/auth/login"
              className="px-6 py-2.5 text-sm font-medium text-white rounded-md transition-colors"
              style={{ background: 'var(--sidebar-primary)' }}
            >
              立即体验
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 text-sm font-medium text-[var(--foreground)] rounded-md border transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
            >
              查看演示
            </Link>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-10 px-6 border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[10px] text-[var(--muted-foreground)] mb-6 tracking-[0.2em] uppercase font-medium">
            技术栈
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-md border text-sm"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              >
                <span className="font-medium text-[var(--foreground)]">{tech.name}</span>
                <span className="text-[var(--muted-foreground)]">· {tech.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">功能特性</h2>
            <p className="text-sm text-[var(--muted-foreground)]">从权限模型到用户界面，提供完整的企业级解决方案</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-5 rounded-xl border transition-all hover:shadow-md"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className={`w-10 h-10 rounded-lg ${feature.gradient} text-white flex items-center justify-center mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{feature.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-10 text-center border"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">准备开始了吗？</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-7">
              使用默认账号 <span className="font-mono font-medium">admin</span> / <span className="font-mono font-medium">123456</span> 登录，体验完整系统
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white rounded-md transition-colors"
              style={{ background: 'var(--sidebar-primary)' }}
            >
              登录系统
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--sidebar-primary)' }}>
              <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">RBAC 权限管理系统</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Built with Next.js 15 · Auth.js v5 · Redis
          </p>
        </div>
      </footer>
    </div>
  )
}
