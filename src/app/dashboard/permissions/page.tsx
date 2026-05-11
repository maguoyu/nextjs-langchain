'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Empty } from '@/components/ui'

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

const typeLabels: Record<string, string> = { CATALOG: '目录', MENU: '菜单', BUTTON: '按钮' }
const typeColors: Record<string, string> = {
  CATALOG: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  MENU: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  BUTTON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
      <span>系统管理</span>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span className="text-gray-700 dark:text-gray-200 font-medium">权限管理</span>
    </div>
  )
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])
  const [formData, setFormData] = useState({ code: '', name: '', type: 'BUTTON', parentId: '', path: '', icon: '', sort: 0, remark: '' })
  const [saving, setSaving] = useState(false)

  const buildParentOptions = (perms: Permission[], level = 0): { label: string; value: string }[] => {
    const options: { label: string; value: string }[] = []
    for (const perm of perms) {
      options.push({ label: `${'　'.repeat(level)}${perm.name}`, value: perm.id })
      if (perm.children) options.push(...buildParentOptions(perm.children, level + 1))
    }
    return options
  }

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      if (data.code === 200) {
        setPermissions(data.data)
        setParentOptions(buildParentOptions(data.data))
      }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  const flattenPermissions = (perms: Permission[]): Permission[] => {
    const result: Permission[] = []
    for (const perm of perms) { result.push(perm); if (perm.children) result.push(...flattenPermissions(perm.children)) }
    return result
  }

  const openModal = (permission?: Permission) => {
    if (permission) {
      setEditingPermission(permission)
      setFormData({ code: permission.code, name: permission.name, type: permission.type, parentId: permission.parentId || '', path: permission.path || '', icon: permission.icon || '', sort: permission.sort, remark: permission.remark || '' })
    } else {
      setEditingPermission(null)
      setFormData({ code: '', name: '', type: 'BUTTON', parentId: '', path: '', icon: '', sort: 0, remark: '' })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) { alert('请填写完整信息'); return }
    setSaving(true)
    try {
      const url = editingPermission ? `/api/permissions/${editingPermission.id}` : '/api/permissions'
      const method = editingPermission ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, parentId: formData.parentId || null }) })
      const data = await res.json()
      if (data.code === 200) { setModalOpen(false); fetchPermissions() }
      else alert(data.message)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`确定要删除权限 "${permission.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/permissions/${permission.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) fetchPermissions()
      else alert(data.message)
    } catch (error) { console.error(error) }
  }

  const flatPerms = flattenPermissions(permissions)

  return (
    <div className="space-y-5">
        <div>
          <Breadcrumb />
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">权限管理</h1>
              <p className="text-sm text-gray-400 mt-0.5">精细化权限配置与分配</p>
            </div>
            <Button onClick={() => openModal()}>
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新增权限
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0110 10" strokeLinecap="round" /></svg>
                  <span className="text-sm">加载中...</span>
                </div>
              </div>
            ) : flatPerms.length === 0 ? (
              <Empty description="暂无权限数据" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>权限编码</TableHead>
                      <TableHead>权限名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>路由路径</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flatPerms.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell><span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{permission.code}</span></TableCell>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${typeColors[permission.type]}`}>
                            {typeLabels[permission.type]}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">{permission.path || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={permission.status === 1 ? 'success' : 'danger'}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${permission.status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
                            {permission.status === 1 ? '启用' : '禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => openModal(permission)}>编辑</Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(permission)}>删除</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader><ModalTitle>{editingPermission ? '编辑权限' : '新增权限'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input label="权限编码" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingPermission} placeholder="如: system:user:add" />
            <Input label="权限名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <div>
              <label className="label">权限类型</label>
              <div className="flex gap-3">
                {['CATALOG', 'MENU', 'BUTTON'].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="perm-type" value={type} checked={formData.type === type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="accent-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{typeLabels[type]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">上级权限</label>
              <select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} className="input">
                <option value="">无上级</option>
                {parentOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <Input label="路由路径" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} />
            <Input label="排序" type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })} />
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
