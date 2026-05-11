'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface ChartProps {
  option: EChartsOption
  style?: React.CSSProperties
  className?: string
}

export function Chart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, true)
    }
  }, [option])

  return <div ref={chartRef} style={style} className={className} />
}

export default Chart
