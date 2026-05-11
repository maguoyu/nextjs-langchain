'use client'

import React, { useEffect, useState, useRef } from 'react'
import type { EChartsOption } from 'echarts'
import { Card, CardContent } from '@/components/ui'

interface StatCardProps {
  title: string
  value: number | string
  gradient: string
  trend?: { value: number; label: string }
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, gradient, icon, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-md">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold mt-1.5 ${gradient.includes('from-blue') ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400' : ''} ${gradient.includes('from-green') ? 'bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400' : ''} ${gradient.includes('from-purple') ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400' : ''} ${gradient.includes('from-orange') ? 'bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400' : ''}`}>
              {value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardChartsProps {
  stats?: {
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
  } | null
  loading?: boolean
}

function MiniChart({ option }: { option: EChartsOption }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ReturnType<typeof import('echarts')['init']> | null>(null)

  useEffect(() => {
    if (!chartRef.current) return
    import('echarts').then((echarts) => {
      chartInstance.current = echarts.init(chartRef.current)
      chartInstance.current.setOption(option)
      const handleResize = () => chartInstance.current?.resize()
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        chartInstance.current?.dispose()
      }
    })
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true)
    }
  }, [option])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}

export function DashboardCharts({ stats, loading }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (loading || !mounted) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        暂无数据，请检查服务连接
      </div>
    )
  }

  const {
    overview = { userCount: 0, roleCount: 0, permissionCount: 0, menuCount: 0 },
    userTrend = [],
    roleDistribution = [],
    monthlyNewUsers = [],
    apiCalls = [],
  } = stats

  const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
  const AREA_COLORS = [
    { top: '#3b82f640', bottom: '#3b82f600', line: '#3b82f6' },
    { top: '#8b5cf640', bottom: '#8b5cf600', line: '#8b5cf6' },
    { top: '#10b98140', bottom: '#10b98100', line: '#10b981' },
    { top: '#6366f140', bottom: '#6366f100', line: '#6366f1' },
  ]

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="用户总数"
          value={overview.userCount}
          gradient="from-blue-400 to-indigo-500"
          color="bg-blue-50 dark:bg-blue-900/20"
          icon={<svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>}
        />
        <StatCard
          title="角色总数"
          value={overview.roleCount}
          gradient="from-green-400 to-emerald-500"
          color="bg-green-50 dark:bg-green-900/20"
          icon={<svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>}
        />
        <StatCard
          title="权限总数"
          value={overview.permissionCount}
          gradient="from-purple-400 to-violet-500"
          color="bg-purple-50 dark:bg-purple-900/20"
          icon={<svg className="w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>}
        />
        <StatCard
          title="菜单总数"
          value={overview.menuCount}
          gradient="from-orange-400 to-amber-500"
          color="bg-orange-50 dark:bg-orange-900/20"
          icon={<svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>}
        />
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Trend */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">用户活跃趋势</h3>
                <p className="text-xs text-gray-400 mt-0.5">近 7 天活跃用户数</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-400">活跃用户</span>
              </div>
            </div>
            <div className="h-64 p-4">
              <MiniChart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
                  xAxis: { type: 'category', data: userTrend.map(d => d.date), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  series: [{
                    type: 'line', data: userTrend.map(d => d.count), smooth: true,
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#3b82f640' }, { offset: 1, color: '#3b82f600' }] } },
                    lineStyle: { color: '#3b82f6', width: 2 },
                    itemStyle: { color: '#3b82f6' },
                    showSymbol: false,
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">角色分布</h3>
                <p className="text-xs text-gray-400 mt-0.5">各角色用户占比</p>
              </div>
            </div>
            <div className="h-64 p-4">
              <MiniChart
                option={{
                  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                  legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#6b7280', fontSize: 11 } },
                  series: [{
                    type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
                    data: roleDistribution.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 6, borderColor: '#fff', borderWidth: 2 } })),
                    label: { show: false },
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Monthly New Users */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">每月新增用户</h3>
                <p className="text-xs text-gray-400 mt-0.5">近 6 个月趋势</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-400">新增用户</span>
              </div>
            </div>
            <div className="h-64 p-4">
              <MiniChart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
                  xAxis: { type: 'category', data: monthlyNewUsers.map(d => d.month), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  series: [{
                    type: 'bar', barWidth: '40%',
                    data: monthlyNewUsers.map(d => ({
                      value: d.value,
                      itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#10b981' }, { offset: 1, color: '#6ee7b7' }] }, borderRadius: [4, 4, 0, 0] },
                    })),
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">API 调用量</h3>
                <p className="text-xs text-gray-400 mt-0.5">24 小时分布</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs text-gray-400">请求数</span>
              </div>
            </div>
            <div className="h-64 p-4">
              <MiniChart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
                  xAxis: { type: 'category', data: apiCalls.map(d => `${d.hour}:00`), boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, axisLabel: { color: '#9ca3af', fontSize: 11 } },
                  series: [{
                    type: 'line', data: apiCalls.map(d => d.value), smooth: true,
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#8b5cf640' }, { offset: 1, color: '#8b5cf600' }] } },
                    lineStyle: { color: '#8b5cf6', width: 2 },
                    itemStyle: { color: '#8b5cf6' },
                    showSymbol: false,
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
