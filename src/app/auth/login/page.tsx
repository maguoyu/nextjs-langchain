'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@/components/ui'

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 60%, #1e3a5f 100%)',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-30 animate-pulse"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            top: '-200px',
            left: '-100px',
            animationDuration: '8s',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
            bottom: '-150px',
            right: '-100px',
            animationDuration: '10s',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10 animate-pulse"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)',
            top: '40%',
            right: '20%',
            animationDuration: '12s',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[420px] mx-4 z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">RBAC System</h1>
          <p className="text-sm text-white/50 mt-1">基于 Next.js 的企业级权限管理平台</p>
        </div>

        <div className="backdrop-blur-xl rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="p-8">
            <h2 className="text-lg font-semibold text-white/90 mb-6">用户登录</h2>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl text-sm text-red-300 flex items-center gap-2"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.12)'
                      e.target.style.borderColor = 'rgba(96,165,250,0.6)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wider">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.12)'
                      e.target.style.borderColor = 'rgba(96,165,250,0.6)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.15)'
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)'
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                }}
              >
                {loading ? '登录中...' : '登 录'}
              </Button>
            </form>
          </div>

          {/* Footer hint */}
          <div className="px-8 pb-7 text-center">
            <p className="text-xs text-white/30">
              默认账号&nbsp;
              <span className="text-white/50 font-mono font-medium">admin</span>
              &nbsp;/&nbsp;
              <span className="text-white/50 font-mono font-medium">123456</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
