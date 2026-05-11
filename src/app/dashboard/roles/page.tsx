'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'
import { DashboardLayout } from '@/components/layout/index'
import { TreeSelect } from '@/components/ui/tree-select'

interface Role {
  id: string
  code: string
  name: string
  status: number
  sort: number
  remark: string | null
  permissions: { id: string; code: string; name: string; type: string }[]
  createdAt: string
}

interface Permission {
  id: string
  code: string
  name: string
  type: string
  children?: Permission[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    sort: 0,
    remark: '',
    permissionIds: [] as string[],
  })
  const [saving, setSaving] = useState(false)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/roles?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
      const data = await res.json()
      if (data.code === 200) {
        setRoles(data.data.list)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword])

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      if (data.code === 200) {
        setPermissions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const handleSearch = () => {
    setPage(1)
    fetchRoles()
  }

  const flattenPermissions = (perms: Permission[], result: Permission[] = []): Permission[] => {
    for (const perm of perms) {
      result.push(perm)
      if (perm.children) {
        flattenPermissions(perm.children, result)
      }
    }
    return result
  }

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({
        code: role.code,
        name: role.name,
        sort: role.sort,
        remark: role.remark || '',
        permissionIds: role.permissions.map(p => p.id),
      })
    } else {
      setEditingRole(null)
      setFormData({
        code: '',
        name: '',
        sort: 0,
        remark: '',
        permissionIds: [],
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      alert('请输入角色名称')
      return
    }
    setSaving(true)
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.code === 200) {
        setModalOpen(false)
        fetchRoles()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to save role:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`确定要删除角色 "${role.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) {
        fetchRoles()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
    }
  }

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter(id => id !== permId)
        : [...prev.permissionIds, permId],
    }))
  }

  const flatPerms = flattenPermissions(permissions)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">角色管理</h1>
          <p className="text-gray-500 dark:text-gray-400">管理系统角色和权限</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>角色列表</CardTitle>
              <Button onClick={() => openModal()}>新增角色</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="搜索角色名称或编码"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handleSearch}>搜索</Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : roles.length === 0 ? (
              <Empty description="暂无角色数据" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色编码</TableHead>
                      <TableHead>角色名称</TableHead>
                      <TableHead>权限</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>排序</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.code}</TableCell>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm.id} variant="info">
                                {perm.name}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="default">+{role.permissions.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.status === 1 ? 'success' : 'danger'}>
                            {role.status === 1 ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>{role.sort}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal(role)}
                              disabled={role.code === 'super_admin'}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(role)}
                              disabled={role.code === 'super_admin'}
                            >
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(p) => setPage(p)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 角色表单弹窗 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>{editingRole ? '编辑角色' : '新增角色'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="角色编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingRole}
            />
            <Input
              label="角色名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="排序"
              type="number"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                权限分配
              </label>
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                {flatPerms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => togglePermission(perm.id)}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissionIds.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {perm.name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({perm.code})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            确定
          </Button>
        </ModalFooter>
      </Modal>
    </DashboardLayout>
  )
}
