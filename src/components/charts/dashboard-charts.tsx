'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  trend?: { value: number; label: string }
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <p className="text-xs mt-1 text-gray-500">
                {trend.label} <span className={trend.value >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
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
  }
  loading?: boolean
}

export function DashboardCharts({ stats, loading }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (loading || !mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无数据
      </div>
    )
  }

  const {
    overview = {},
    userTrend = [],
    roleDistribution = [],
    monthlyNewUsers = [],
    apiCalls = [],
  } = stats || {}

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="用户总数"
          value={overview.userCount}
          color="bg-blue-100 text-blue-600"
          trend={{ value: 12, label: '较上月' }}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="角色总数"
          value={overview.roleCount}
          color="bg-green-100 text-green-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatCard
          title="权限总数"
          value={overview.permissionCount}
          color="bg-purple-100 text-purple-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
        />
        <StatCard
          title="菜单总数"
          value={overview.menuCount}
          color="bg-orange-100 text-orange-600"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          }
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户活跃趋势 */}
        <Card>
          <CardHeader>
            <CardTitle>用户活跃趋势（近7天）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Chart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                  xAxis: {
                    type: 'category',
                    data: userTrend.map(d => d.date),
                    boundaryGap: false,
                  },
                  yAxis: { type: 'value' },
                  series: [{
                    type: 'line',
                    data: userTrend.map(d => d.count),
                    smooth: true,
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                          { offset: 0, color: '#3b82f640' },
                          { offset: 1, color: '#3b82f600' },
                        ],
                      },
                    },
                    lineStyle: { color: '#3b82f6' },
                    itemStyle: { color: '#3b82f6' },
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 角色分布 */}
        <Card>
          <CardHeader>
            <CardTitle>角色分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Chart
                option={{
                  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                  legend: { orient: 'vertical', right: '5%', top: 'center' },
                  series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    data: roleDistribution.map((d, i) => ({
                      value: d.value,
                      name: d.name,
                      itemStyle: {
                        color: ['#ef4444', '#f59e0b', '#dc2626', '#fb923c', '#f87171'][i],
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2,
                      },
                    })),
                    label: { show: false },
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 每月新增用户 */}
        <Card>
          <CardHeader>
            <CardTitle>每月新增用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Chart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                  xAxis: {
                    type: 'category',
                    data: monthlyNewUsers.map(d => d.month),
                  },
                  yAxis: { type: 'value' },
                  series: [{
                    type: 'bar',
                    data: monthlyNewUsers.map(d => ({
                      value: d.value,
                      itemStyle: {
                        color: {
                          type: 'linear',
                          x: 0, y: 0, x2: 0, y2: 1,
                          colorStops: [
                            { offset: 0, color: '#22c55e' },
                            { offset: 1, color: '#86efac' },
                          ],
                        },
                        borderRadius: [4, 4, 0, 0],
                      },
                    })),
                    barWidth: '50%',
                  }],
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* API 调用量 */}
        <Card>
          <CardHeader>
            <CardTitle>API 调用量（24小时）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Chart
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                  xAxis: {
                    type: 'category',
                    data: apiCalls.map(d => `${d.hour}:00`),
                    boundaryGap: false,
                  },
                  yAxis: { type: 'value' },
                  series: [{
                    type: 'line',
                    data: apiCalls.map(d => d.value),
                    smooth: true,
                    areaStyle: {
                      color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                          { offset: 0, color: '#6366f140' },
                          { offset: 1, color: '#6366f100' },
                        ],
                      },
                    },
                    lineStyle: { color: '#6366f1' },
                    itemStyle: { color: '#6366f1' },
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

function Chart({ option, style }: { option: any; style?: React.CSSProperties }) {
  const chartRef = React.useRef<HTMLDivElement>(null)
  const chartInstance = React.useRef<any>(null)

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true)
    }
  }, [option])

  return <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />
}

export { DashboardCharts }
