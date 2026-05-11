'use client'

import { Chart } from './chart'
import type { EChartsOption } from 'echarts'

interface PieChartProps {
  data: { name: string; value: number }[]
  title?: string
  height?: number
  colors?: string[]
  radius?: string[]
}

export function PieChart({
  data,
  title,
  height = 300,
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'],
  radius = ['40%', '70%'],
}: PieChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 16 } } : undefined,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
    },
    series: [
      {
        type: 'pie',
        radius,
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((d, i) => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: colors[i % colors.length] },
        })),
      },
    ],
  }

  return <Chart option={option} style={{ height }} />
}
