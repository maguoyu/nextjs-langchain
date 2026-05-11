'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Empty } from '@/components/ui'
import { DashboardLayout } from '@/components/layout'

interface Permission {
  id: string
  code: string
  name: string
  type: string
  parentId: string | null
  path: string | null
  icon: string | null
  sort: number
  status: number
  remark: string | null
  children?: Permission[]
  createdAt: string
}

const typeLabels: Record<string, string> = {
  CATALOG: '目录',
  MENU: '菜单',
  BUTTON: '按钮',
}

const typeColors: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  CATALOG: 'warning',
  MENU: 'info',
  BUTTON: 'success',
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'BUTTON',
    parentId: '',
    path: '',
    icon: '',
    sort: 0,
    remark: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      if (data.code === 200) {
        setPermissions(data.data)
        setParentOptions(buildParentOptions(data.data))
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const buildParentOptions = (perms: Permission[], level = 0): { label: string; value: string }[] => {
    const options: { label: string; value: string }[] = []
    for (const perm of perms) {
      const prefix = '　'.repeat(level)
      options.push({ label: `${prefix}${perm.name}`, value: perm.id })
      if (perm.children) {
        options.push(...buildParentOptions(perm.children, level + 1))
      }
    }
    return options
  }

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const flattenPermissions = (perms: Permission[]): Permission[] => {
    const result: Permission[] = []
    for (const perm of perms) {
      result.push(perm)
      if (perm.children) {
        result.push(...flattenPermissions(perm.children))
      }
    }
    return result
  }

  const openModal = (permission?: Permission) => {
    if (permission) {
      setEditingPermission(permission)
      setFormData({
        code: permission.code,
        name: permission.name,
        type: permission.type,
        parentId: permission.parentId || '',
        path: permission.path || '',
        icon: permission.icon || '',
        sort: permission.sort,
        remark: permission.remark || '',
      })
    } else {
      setEditingPermission(null)
      setFormData({
        code: '',
        name: '',
        type: 'BUTTON',
        parentId: '',
        path: '',
        icon: '',
        sort: 0,
        remark: '',
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      alert('请填写完整信息')
      return
    }
    setSaving(true)
    try {
      const url = editingPermission ? `/api/permissions/${editingPermission.id}` : '/api/permissions'
      const method = editingPermission ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
      })
      const data = await res.json()
      if (data.code === 200) {
        setModalOpen(false)
        fetchPermissions()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to save permission:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`确定要删除权限 "${permission.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/permissions/${permission.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) {
        fetchPermissions()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to delete permission:', error)
    }
  }

  const flatPerms = flattenPermissions(permissions)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">权限管理</h1>
          <p className="text-gray-500 dark:text-gray-400">管理系统权限点</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>权限列表</CardTitle>
              <Button onClick={() => openModal()}>新增权限</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : flatPerms.length === 0 ? (
              <Empty description="暂无权限数据" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>权限编码</TableHead>
                    <TableHead>权限名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatPerms.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-mono text-xs">{permission.code}</TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>
                        <Badge variant={typeColors[permission.type]}>
                          {typeLabels[permission.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{permission.path || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={permission.status === 1 ? 'success' : 'danger'}>
                          {permission.status === 1 ? '启用' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(permission)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(permission)}
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 权限表单弹窗 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>{editingPermission ? '编辑权限' : '新增权限'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="权限编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingPermission}
              placeholder="如: system:user:add"
            />
            <Input
              label="权限名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                权限类型
              </label>
              <div className="flex gap-4">
                {['CATALOG', 'MENU', 'BUTTON'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mr-2"
                    />
                    {typeLabels[type]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                上级权限
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">无上级</option>
                {parentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="路由路径"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            />
            <Input
              label="图标"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <Input
              label="排序"
              type="number"
              value={formData.sort}
              onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
            />
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
