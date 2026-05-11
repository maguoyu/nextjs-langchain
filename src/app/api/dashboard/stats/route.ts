import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// 获取仪表盘统计数据
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ code: 401, message: '未登录' }, { status: 401 })
    }

    // 获取各类统计数据
    const [userCount, roleCount, permissionCount, menuCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.permission.count(),
      prisma.menu.count(),
    ])

    // 模拟图表数据
    const userTrend = [
      { date: '05-03', count: Math.floor(Math.random() * 100) + 50 },
      { date: '05-04', count: Math.floor(Math.random() * 100) + 60 },
      { date: '05-05', count: Math.floor(Math.random() * 100) + 80 },
      { date: '05-06', count: Math.floor(Math.random() * 100) + 70 },
      { date: '05-07', count: Math.floor(Math.random() * 100) + 90 },
      { date: '05-08', count: Math.floor(Math.random() * 100) + 85 },
      { date: '05-09', count: Math.floor(Math.random() * 100) + 100 },
    ]

    const monthlyNewUsers = [
      { month: '1月', value: Math.floor(Math.random() * 50) + 20 },
      { month: '2月', value: Math.floor(Math.random() * 50) + 25 },
      { month: '3月', value: Math.floor(Math.random() * 50) + 30 },
      { month: '4月', value: Math.floor(Math.random() * 50) + 35 },
      { month: '5月', value: Math.floor(Math.random() * 50) + 40 },
    ]

    const apiCalls = [
      { hour: '00', value: Math.floor(Math.random() * 100) + 50 },
      { hour: '04', value: Math.floor(Math.random() * 100) + 30 },
      { hour: '08', value: Math.floor(Math.random() * 100) + 150 },
      { hour: '12', value: Math.floor(Math.random() * 100) + 200 },
      { hour: '16', value: Math.floor(Math.random() * 100) + 180 },
      { hour: '20', value: Math.floor(Math.random() * 100) + 120 },
      { hour: '24', value: Math.floor(Math.random() * 100) + 80 },
    ]

    // 角色分布
    const roleDistribution = [
      { name: '超级管理员', value: 1 },
      { name: '普通用户', value: userCount - 1 },
    ]

    // 模拟业务数据
    const stats = {
      overview: {
        userCount,
        roleCount,
        permissionCount,
        menuCount,
      },
      userTrend,
      roleDistribution,
      monthlyNewUsers,
      apiCalls,
      permissionTypeDistribution: await prisma.permission.groupBy({
        by: ['type'],
        _count: true,
      }).then(result => result.map(r => ({
        name: r.type === 'CATALOG' ? '目录' : r.type === 'MENU' ? '菜单' : '按钮',
        value: r._count,
      }))),
      businessData: {
        healthScore: 98.5,
        onlineUsers: Math.floor(Math.random() * 20) + 10,
      },
    }

    return NextResponse.json({ code: 200, message: 'success', data: stats })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ code: 500, message: '服务器错误' }, { status: 500 })
  }
}
