'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'

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
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
      <span>系统管理</span>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span className="text-gray-700 dark:text-gray-200 font-medium">用户管理</span>
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
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    roleIds: [] as string[],
  })
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
      const data = await res.json()
      if (data.code === 200) {
        setUsers(data.data.list)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/roles?page=1&pageSize=100')
      const data = await res.json()
      if (data.code === 200) {
        setRoles(data.data.list)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchRoles() }, [fetchRoles])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '',
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        roleIds: user.roles.map(r => r.id),
      })
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
      if (data.code === 200) {
        setModalOpen(false)
        fetchUsers()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`确定要删除用户 "${user.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) fetchUsers()
      else alert(data.message)
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId],
    }))
  }

  return (
    <div className="space-y-5">
        <div>
          <Breadcrumb />
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">用户管理</h1>
              <p className="text-sm text-gray-400 mt-0.5">管理系统用户账号与基本信息</p>
            </div>
            <Button onClick={() => openModal()}>
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新增用户
            </Button>
          </div>
        </div>

        <Card>
          {/* Search bar */}
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <Input
                placeholder="搜索用户名、姓名或邮箱..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="max-w-xs"
              />
              <Button onClick={handleSearch}>搜索</Button>
              {keyword && (
                <button onClick={() => { setKeyword(''); setPage(1); fetchUsers(); }} className="text-xs text-gray-400 hover:text-gray-600">
                  清除筛选
                </button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm">加载中...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <Empty description="暂无用户数据" />
            ) : (
              <>
                <div className="overflow-x-auto">
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
                          <TableCell>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold mr-3 float-left">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-mono text-sm">{user.username}</span>
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-gray-500">{user.email || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <Badge key={role.id} variant="info">{role.name}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 1 ? 'success' : 'danger'}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${user.status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
                              {user.status === 1 ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button variant="ghost" size="sm" onClick={() => openModal(user)}>编辑</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(user)}>删除</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-xs text-gray-400">共 {total} 条记录</p>
                  <Pagination current={page} pageSize={pageSize} total={total} onChange={(p) => setPage(p)} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>{editingUser ? '编辑用户' : '新增用户'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input label="用户名" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={!!editingUser} />
            {!editingUser && (
              <Input label="密码" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            )}
            <Input label="姓名" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="邮箱" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="手机" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div>
              <label className="label">角色</label>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      formData.roleIds.includes(role.id)
                        ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {role.name}
                  </button>
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
