'use client'

import { DashboardCharts } from '@/components/charts'
import { Card, CardContent } from '@/components/ui'
import { useEffect, useState } from 'react'

interface DashboardStats {
  overview: {
    userCount: number
    roleCount: number
    permissionCount: number
    menuCount: number
  }
  userTrend: { date: string; count: number }[]
  roleDistribution: { name: string; value: number }[]
  monthlyNewUsers: { month: string; value: number }[]
  apiCalls: { hour: string; value: number }[]
  businessData: { healthScore: number; onlineUsers: number }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        const data = await res.json()
        if (data.code === 200) setStats(data.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const totalApiCalls = stats?.apiCalls.reduce((sum, item) => sum + item.value, 0) ?? 0

  return (
    <div className="space-y-5">
      <DashboardCharts stats={stats} loading={loading} />

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">系统健康度</p>
                <p className="text-xl font-bold text-[var(--foreground)] mt-1">{stats?.businessData?.healthScore ?? 0}%</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--chart-2)' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">在线用户</p>
                <p className="text-xl font-bold text-[var(--foreground)] mt-1">{stats?.businessData?.onlineUsers ?? 0}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--chart-1)' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">API 调用量</p>
                <p className="text-xl font-bold text-[var(--foreground)] mt-1">{totalApiCalls.toLocaleString()}</p>
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--chart-3)' }}>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
