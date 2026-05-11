import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export const revalidate = 3600

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const roles = await prisma.role.findMany({
    select: { id: true },
    take: 100,
    orderBy: { createdAt: 'desc' },
  })
  return roles.map((role) => ({ id: role.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const role = await prisma.role.findUnique({
    where: { id },
    select: { name: true, code: true },
  })
  if (!role) return { title: '角色不存在' }
  return {
    title: `${role.name} - 角色详情`,
    description: `角色 ${role.name}（${role.code}）的详细信息与权限列表`,
  }
}

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: {
            include: { menu: true },
          },
        },
        orderBy: { permission: { sort: 'asc' } },
      },
      users: {
        select: { user: { select: { id: true, name: true, username: true, status: true } } },
      },
    },
  })

  if (!role) notFound()

  const permissionGroups = role.permissions.reduce<Record<string, typeof role.permissions>>(
    (acc, item) => {
      const menuName = item.permission.menu?.name ?? '未分类'
      if (!acc[menuName]) acc[menuName] = []
      acc[menuName].push(item)
      return acc
    },
    {}
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{role.name}</h1>
            <Badge variant={role.status === 1 ? 'success' : 'danger'}>
              {role.status === 1 ? '启用' : '禁用'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            角色编码：{role.code}
            {role.remark && <span className="ml-4">备注：{role.remark}</span>}
          </p>
        </div>
        <Link
          href="/dashboard/roles"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Permissions */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(permissionGroups).map(([menuName, items]) => (
            <Card key={menuName}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{menuName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <Badge key={item.id} variant="info">
                      {item.permission.name}
                    </Badge>
                  ))}
                </div>
                {items.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">暂无权限</p>
                )}
              </CardContent>
            </Card>
          ))}
          {role.permissions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-400 dark:text-gray-500">
                暂无关联权限
              </CardContent>
            </Card>
          )}
        </div>

        {/* Users */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                关联用户
                <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
                  ({role.users.length} 人)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role.users.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">暂无关联用户</p>
              ) : (
                <div className="space-y-3">
                  {role.users.map(({ user }) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</p>
                      </div>
                      <Badge
                        variant={user.status === 1 ? 'success' : 'danger'}
                        className="text-xs"
                      >
                        {user.status === 1 ? '启用' : '禁用'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
