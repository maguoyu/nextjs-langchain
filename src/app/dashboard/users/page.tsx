'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'

interface User {
  id: string
  username: string
  name: string
  email: string | null
  phone: string | null
  status: number
  roles: { id: string; name: string; code: string }[]
  createdAt: string
}

interface Role {
  id: string
  name: string
  code: string
}

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>系统管理</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">用户管理</span>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '', phone: '', roleIds: [] as string[] })
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
      const data = await res.json()
      if (data.code === 200) { setUsers(data.data.list); setTotal(data.data.total) }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles?page=1&pageSize=100')
      const data = await res.json()
      if (data.code === 200) setRoles(data.data.list)
    } catch (error) { console.error(error) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchRoles() }, [fetchRoles])

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({ username: user.username, password: '', name: user.name, email: user.email || '', phone: user.phone || '', roleIds: user.roles.map(r => r.id) })
    } else {
      setEditingUser(null)
      setFormData({ username: '', password: '', name: '', email: '', phone: '', roleIds: [] })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.code === 200) { setModalOpen(false); fetchUsers() }
      else alert(data.message)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`确定要删除用户 "${user.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) fetchUsers()
      else alert(data.message)
    } catch (error) { console.error(error) }
  }

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({ ...prev, roleIds: prev.roleIds.includes(roleId) ? prev.roleIds.filter(id => id !== roleId) : [...prev.roleIds, roleId] }))
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb />
            <h1 className="text-lg font-bold text-[var(--foreground)]">用户管理</h1>
          </div>
          <Button onClick={() => openModal()}>新增用户</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <Input placeholder="搜索用户名、姓名或邮箱..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchUsers())} className="max-w-xs" />
              <Button onClick={() => { setPage(1); fetchUsers() }}>搜索</Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-sm text-[var(--muted-foreground)]">加载中...</span>
              </div>
            ) : users.length === 0 ? (
              <Empty description="暂无用户数据" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户名</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell><span className="font-mono text-xs">{user.username}</span></TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-[var(--muted-foreground)]">{user.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => <Badge key={role.id} variant="secondary">{role.name}</Badge>)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 1 ? 'default' : 'destructive'}>{user.status === 1 ? '启用' : '禁用'}</Badge>
                        </TableCell>
                        <TableCell className="text-[var(--muted-foreground)] text-xs">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openModal(user)}>编辑</Button>
                            <Button variant="ghost" size="sm" className="text-[var(--destructive)] hover:bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)]" onClick={() => handleDelete(user)}>删除</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">共 {total} 条</span>
                  <Pagination current={page} pageSize={pageSize} total={total} onChange={(p) => setPage(p)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader><ModalTitle>{editingUser ? '编辑用户' : '新增用户'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-3">
            <Input label="用户名" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={!!editingUser} />
            {!editingUser && <Input label="密码" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />}
            <Input label="姓名" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="邮箱" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="手机" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">角色</label>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((role) => (
                  <button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${formData.roleIds.includes(role.id) ? 'bg-[var(--sidebar-primary)] text-white border-transparent' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--sidebar-primary)]'}`}
                  >{role.name}</button>
                ))}
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>取消</Button>
          <Button onClick={handleSubmit} loading={saving}>确定</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
