'use client'

import { Chart } from './chart'
import type { EChartsOption } from 'echarts'

interface BarChartProps {
  data: { name: string; value: number }[]
  title?: string
  xAxisName?: string
  yAxisName?: string
  height?: number
  colors?: string[]
}

export function BarChart({
  data,
  title,
  xAxisName,
  yAxisName,
  height = 300,
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'],
}: BarChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 16 } } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      name: xAxisName,
      axisLabel: { rotate: 0 },
    },
    yAxis: { type: 'value', name: yAxisName },
    series: [
      {
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: { color: colors[i % colors.length] },
        })),
        barWidth: '60%',
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return <Chart option={option} style={{ height }} />
}
