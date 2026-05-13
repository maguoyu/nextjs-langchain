'use client'

import React, { useEffect, useState, useRef } from 'react'
import type { EChartsOption } from 'echarts'
import { Card, CardContent } from '@/components/ui'

const CSS_VAR_COLORS: Record<string, string> = {
  '--chart-1': '#4f86f7',
  '--chart-2': '#34d399',
  '--chart-3': '#60a5fa',
  '--chart-4': '#f59e0b',
  '--chart-5': '#c084fc',
  '--muted-foreground': '#737373',
  '--border': '#e5e7eb',
  '--background': '#ffffff',
}

function replaceVars(str: string): string {
  for (const [k, v] of Object.entries(CSS_VAR_COLORS)) {
    str = str.replaceAll(`var(${k})`, v)
  }
  if (str.startsWith('color-mix')) return 'transparent'
  return str
}

function resolveOption(opt: unknown): unknown {
  if (typeof opt === 'string') return replaceVars(opt)
  if (Array.isArray(opt)) return opt.map(resolveOption)
  if (opt && typeof opt === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(opt as Record<string, unknown>)) {
      result[k] = resolveOption(v)
    }
    return result
  }
  return opt
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">{title}</p>
            <p className="text-xl font-bold text-[var(--foreground)] mt-1">{value}</p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardChartsProps {
  stats?: {
    overview: { userCount: number; roleCount: number; permissionCount: number; menuCount: number }
    userTrend: { date: string; count: number }[]
    roleDistribution: { name: string; value: number }[]
    monthlyNewUsers: { month: string; value: number }[]
    apiCalls: { hour: string; value: number }[]
    radarData?: {
      indicator: { name: string; max: number }[]
      values: number[]
    }
  } | null
  loading?: boolean
}

function MiniChart({ option }: { option: EChartsOption }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ReturnType<typeof import('echarts')['init']> | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const handleResize = () => chartInstance.current?.resize()

    import('echarts').then((echarts) => {
      if (!chartRef.current || chartInstance.current) return
      chartInstance.current = echarts.init(chartRef.current)
      window.addEventListener('resize', handleResize)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(resolveOption(option) as EChartsOption, true)
    }
  }, [option])

  return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
}

const CHART_COLORS = ['#4f86f7', '#34d399', '#60a5fa', '#f59e0b', '#c084fc']

export function DashboardCharts({ stats, loading }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (loading || !mounted) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-12 bg-[var(--muted)] rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-56 bg-[var(--muted)] rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-16 text-sm text-[var(--muted-foreground)]">暂无数据</div>
  }

  const { overview = { userCount: 0, roleCount: 0, permissionCount: 0, menuCount: 0 }, userTrend = [], roleDistribution = [], monthlyNewUsers = [], apiCalls = [], radarData } = stats

  const chartBase = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: { type: 'category' as const, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: 'var(--muted-foreground)', fontSize: 11 } },
    yAxis: { type: 'value' as const, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'var(--border)', type: 'dashed' as const } }, axisLabel: { color: 'var(--muted-foreground)', fontSize: 11 } },
  }

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="用户总数" value={overview.userCount} color="text-white" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>} />
        <StatCard title="角色总数" value={overview.roleCount} color="text-white" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>} />
        <StatCard title="权限总数" value={overview.permissionCount} color="text-white" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>} />
        <StatCard title="菜单总数" value={overview.menuCount} color="text-white" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>} />
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">用户活跃趋势</h3>
              <p className="text-xs text-[var(--muted-foreground)]">近 7 天</p>
            </div>
            <div className="h-56 px-4 pb-4">
              <MiniChart option={{ ...chartBase, xAxis: { ...chartBase.xAxis, data: userTrend.map(d => d.date), boundaryGap: false }, series: [{ type: 'line' as const, data: userTrend.map(d => d.count), smooth: true, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'color-mix(in srgb, var(--chart-1) 30%, transparent)' }, { offset: 1, color: 'color-mix(in srgb, var(--chart-1) 5%, transparent)' }] } }, lineStyle: { color: 'var(--chart-1)', width: 2 }, itemStyle: { color: 'var(--chart-1)' }, showSymbol: false }] }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">角色分布</h3>
              <p className="text-xs text-[var(--muted-foreground)]">用户占比</p>
            </div>
            <div className="h-56 px-4 pb-4">
              <MiniChart option={{ tooltip: { trigger: 'item' }, legend: { orient: 'vertical' as const, right: '5%', top: 'center', textStyle: { color: 'var(--muted-foreground)', fontSize: 11 } }, series: [{ type: 'pie' as const, radius: ['45%', '70%'], center: ['35%', '50%'], data: roleDistribution.map((d, i) => ({ value: d.value, name: d.name, itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 6, borderColor: 'var(--background)', borderWidth: 2 } })), label: { show: false } }] }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">每月新增用户</h3>
              <p className="text-xs text-[var(--muted-foreground)]">近 6 个月</p>
            </div>
            <div className="h-56 px-4 pb-4">
              <MiniChart option={{ ...chartBase, xAxis: { ...chartBase.xAxis, data: monthlyNewUsers.map(d => d.month) }, series: [{ type: 'bar' as const, barWidth: '40%', data: monthlyNewUsers.map(d => ({ value: d.value, itemStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'var(--chart-2)' }, { offset: 1, color: 'color-mix(in srgb, var(--chart-2) 50%, transparent)' }] }, borderRadius: [4, 4, 0, 0] } })) }] }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">API 调用量</h3>
              <p className="text-xs text-[var(--muted-foreground)]">24 小时</p>
            </div>
            <div className="h-56 px-4 pb-4">
              <MiniChart option={{ ...chartBase, xAxis: { ...chartBase.xAxis, data: apiCalls.map(d => `${d.hour}:00`), boundaryGap: false }, series: [{ type: 'line' as const, data: apiCalls.map(d => d.value), smooth: true, areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'color-mix(in srgb, var(--chart-4) 30%, transparent)' }, { offset: 1, color: 'color-mix(in srgb, var(--chart-4) 5%, transparent)' }] } }, lineStyle: { color: 'var(--chart-4)', width: 2 }, itemStyle: { color: 'var(--chart-4)' }, showSymbol: false }] }} />
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart - Full Width */}
        <Card>
          <CardContent className="p-0">
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">系统能力评估</h3>
              <p className="text-xs text-[var(--muted-foreground)]">多维度综合评分</p>
            </div>
            <div className="h-64 px-4 pb-4">
              {radarData && radarData.indicator && radarData.values && (
                <MiniChart option={{
                  radar: {
                    indicator: radarData.indicator,
                    radius: '65%',
                    axisName: { color: 'var(--muted-foreground)', fontSize: 11 },
                    splitArea: { show: false },
                    splitLine: { lineStyle: { color: 'var(--border)', type: 'dashed' as const } },
                    axisLine: { lineStyle: { color: 'var(--border)' } },
                  },
                  series: [{
                    type: 'radar' as const,
                    data: [{ value: radarData.values, name: '系统能力', itemStyle: { color: '#4f86f7' }, areaStyle: { color: 'rgba(79, 134, 247, 0.25)' }, lineStyle: { color: '#4f86f7', width: 2 } }],
                  }],
                }} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
