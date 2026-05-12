'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('用户名或密码错误')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--app-background)' }}
    >
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'var(--sidebar-primary)' }}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">RBAC System</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">基于 Next.js 的权限管理平台</p>
        </div>

        {/* Card */}
        <div
          className="bg-[var(--card)] rounded-xl border shadow-sm p-6"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold text-[var(--foreground)] mb-5">登录账户</h2>

          {error && (
            <div
              className="mb-4 p-3 rounded-md text-sm"
              style={{ background: 'color-mix(in oklch, var(--destructive) 10%, transparent)', color: 'var(--destructive)', border: '1px solid color-mix(in oklch, var(--destructive) 20%, transparent)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
            />

            <Input
              label="密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
            />

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-[var(--muted-foreground)] mt-5">
          默认账号 <span className="font-mono">admin</span> / <span className="font-mono">123456</span>
        </p>
      </div>
    </div>
  )
}
