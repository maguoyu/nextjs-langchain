'use client'

import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

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

interface ChartProps {
  option: EChartsOption
  style?: React.CSSProperties
  className?: string
}

export function Chart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)
    isInitialized.current = true

    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
      chartInstance.current = null
      isInitialized.current = false
    }
  }, [])

  useEffect(() => {
    if (chartInstance.current && isInitialized.current) {
      chartInstance.current.setOption(resolveOption(option) as EChartsOption, true)
    }
  }, [option])

  return <div ref={chartRef} style={style} className={className} />
}

export default Chart
