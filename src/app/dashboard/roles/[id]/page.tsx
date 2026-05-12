'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface RoleWithDetails {
  id: string
  code: string
  name: string
  status: number
  sort: number
  remark: string | null
  permissions: { id: string; permission: { id: string; name: string; code: string; path: string | null } }[]
  users: { user: { id: string; name: string | null; username: string; status: number } }[]
}

interface Props {
  params: Promise<{ id: string }>
}

export default function RoleDetailPage({ params }: Props) {
  const { id } = use(params)
  const [role, setRole] = useState<RoleWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch(`/api/roles/${id}`)
        const data = await res.json()
        if (data.code === 200) {
          setRole(data.data)
        } else {
          notFound()
        }
      } catch (error) {
        console.error(error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="text-sm text-[var(--muted-foreground)]">加载中...</span>
      </div>
    )
  }

  if (!role) return null

  const permissionGroups = role.permissions.reduce<Record<string, typeof role.permissions>>(
    (acc, item) => {
      const menuName = item.permission.path ?? '未分类'
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
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{role.name}</h1>
            <Badge variant={role.status === 1 ? 'success' : 'danger'}>
              {role.status === 1 ? '启用' : '禁用'}
            </Badge>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            角色编码：{role.code}
            {role.remark && <span className="ml-4">备注：{role.remark}</span>}
          </p>
        </div>
        <Link
          href="/dashboard/roles"
          className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-md transition-colors"
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
                  <p className="text-sm text-[var(--muted-foreground)]">暂无权限</p>
                )}
              </CardContent>
            </Card>
          ))}
          {role.permissions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-[var(--muted-foreground)]">
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
                <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                  ({role.users.length} 人)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role.users.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">暂无关联用户</p>
              ) : (
                <div className="space-y-3">
                  {role.users.map(({ user }) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {user.name || user.username}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">@{user.username}</p>
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
