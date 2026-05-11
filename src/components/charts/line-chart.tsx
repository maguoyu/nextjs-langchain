'use client'

import { Chart } from './chart'
import type { EChartsOption } from 'echarts'

interface LineChartProps {
  data: { name: string; value: number }[]
  title?: string
  xAxisName?: string
  yAxisName?: string
  height?: number
  colors?: string[]
  smooth?: boolean
}

export function LineChart({
  data,
  title,
  xAxisName,
  yAxisName,
  height = 300,
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'],
  smooth = true,
}: LineChartProps) {
  const option: EChartsOption = {
    title: title ? { text: title, left: 'center', textStyle: { fontSize: 16 } } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      name: xAxisName,
      boundaryGap: false,
    },
    yAxis: { type: 'value', name: yAxisName },
    series: [
      {
        type: 'line',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: { color: colors[i % colors.length] },
        })),
        smooth,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${colors[0]}40` },
              { offset: 1, color: `${colors[0]}00` },
            ],
          },
        },
      },
    ],
  }

  return <Chart option={option} style={{ height }} />
}
