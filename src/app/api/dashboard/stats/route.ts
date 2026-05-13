import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { handleApiError, apiSuccess } from '@/lib/api-error'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const [userCount, roleCount, permissionCount, menuCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.permission.count(),
      prisma.menu.count(),
    ])

    const permissionTypeDistribution = await prisma.permission.groupBy({
      by: ['type'],
      _count: true,
    }).then((result) =>
      result.map((r) => ({
        name: r.type === 'CATALOG' ? '目录' : r.type === 'MENU' ? '菜单' : '按钮',
        value: r._count,
      }))
    )

    const roleDistribution = await prisma.user.groupBy({
      by: ['status'],
      _count: true,
    })

    const stats = {
      overview: { userCount, roleCount, permissionCount, menuCount },
      userTrend: [
        { date: '05-03', count: 62 },
        { date: '05-04', count: 75 },
        { date: '05-05', count: 88 },
        { date: '05-06', count: 73 },
        { date: '05-07', count: 95 },
        { date: '05-08', count: 90 },
        { date: '05-09', count: 105 },
      ],
      roleDistribution: [
        { name: '超级管理员', value: 1 },
        { name: '普通用户', value: userCount - 1 },
      ],
      monthlyNewUsers: [
        { month: '1月', value: 22 },
        { month: '2月', value: 28 },
        { month: '3月', value: 35 },
        { month: '4月', value: 40 },
        { month: '5月', value: 45 },
      ],
      apiCalls: [
        { hour: '00', value: 55 },
        { hour: '04', value: 32 },
        { hour: '08', value: 160 },
        { hour: '12', value: 210 },
        { hour: '16', value: 185 },
        { hour: '20', value: 125 },
        { hour: '24', value: 88 },
      ],
      radarData: {
        indicator: [
          { name: 'API响应时间', max: 100 },
          { name: '并发处理能力', max: 100 },
          { name: '系统可用性', max: 100 },
          { name: '数据完整率', max: 100 },
          { name: '错误率控制', max: 100 },
          { name: '安全性评分', max: 100 },
        ],
        values: [85, 72, 98, 95, 88, 90],
      },
      permissionTypeDistribution,
      businessData: {
        healthScore: 98.5,
        onlineUsers: Math.floor(Math.random() * 20) + 10,
      },
    }

    return apiSuccess(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
