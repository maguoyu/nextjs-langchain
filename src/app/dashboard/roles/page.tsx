'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'

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

function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
      <span>系统管理</span>
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span className="text-gray-700 dark:text-gray-200 font-medium">角色管理</span>
    </div>
  )
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
  const [formData, setFormData] = useState({ code: '', name: '', sort: 0, remark: '', permissionIds: [] as string[] })
  const [saving, setSaving] = useState(false)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/roles?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
      const data = await res.json()
      if (data.code === 200) { setRoles(data.data.list); setTotal(data.data.total) }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch('/api/permissions')
      const data = await res.json()
      if (data.code === 200) setPermissions(data.data)
    } catch (error) { console.error(error) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])
  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  const flattenPermissions = (perms: Permission[], result: Permission[] = []): Permission[] => {
    for (const perm of perms) { result.push(perm); if (perm.children) flattenPermissions(perm.children, result) }
    return result
  }

  const handleSearch = () => { setPage(1); fetchRoles() }

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role)
      setFormData({ code: role.code, name: role.name, sort: role.sort, remark: role.remark || '', permissionIds: role.permissions.map(p => p.id) })
    } else {
      setEditingRole(null)
      setFormData({ code: '', name: '', sort: 0, remark: '', permissionIds: [] })
    }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name) { alert('请输入角色名称'); return }
    setSaving(true)
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      const data = await res.json()
      if (data.code === 200) { setModalOpen(false); fetchRoles() }
      else alert(data.message)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDelete = async (role: Role) => {
    if (!confirm(`确定要删除角色 "${role.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) fetchRoles()
      else alert(data.message)
    } catch (error) { console.error(error) }
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
  const isSuperAdmin = (code: string) => code === 'super_admin'

  return (
    <div className="space-y-5">
        <div>
          <Breadcrumb />
          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">角色管理</h1>
              <p className="text-sm text-gray-400 mt-0.5">管理系统角色与权限分配</p>
            </div>
            <Button onClick={() => openModal()}>
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              新增角色
            </Button>
          </div>
        </div>

        <Card>
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-3">
              <Input placeholder="搜索角色名称或编码..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="max-w-xs" />
              <Button onClick={handleSearch}>搜索</Button>
            </div>
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0110 10" strokeLinecap="round" /></svg>
                  <span className="text-sm">加载中...</span>
                </div>
              </div>
            ) : roles.length === 0 ? (
              <Empty description="暂无角色数据" />
            ) : (
              <>
                <div className="overflow-x-auto">
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
                          <TableCell><span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{role.code}</span></TableCell>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {role.permissions.slice(0, 3).map((perm) => (
                                <Badge key={perm.id} variant="info">{perm.name}</Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="default">+{role.permissions.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.status === 1 ? 'success' : 'danger'}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${role.status === 1 ? 'bg-green-400' : 'bg-red-400'}`} />
                              {role.status === 1 ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400">{role.sort}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button variant="ghost" size="sm" onClick={() => openModal(role)} disabled={isSuperAdmin(role.code)}>编辑</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(role)} disabled={isSuperAdmin(role.code)}>删除</Button>
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

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xl">
        <ModalHeader><ModalTitle>{editingRole ? '编辑角色' : '新增角色'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input label="角色编码" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingRole} />
            <Input label="角色名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="排序" type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })} />
            <div>
              <label className="label">权限分配</label>
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 max-h-56 overflow-y-auto space-y-1">
                {flatPerms.map((perm) => (
                  <div key={perm.id} className="flex items-center py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => togglePermission(perm.id)}>
                    <input type="checkbox" checked={formData.permissionIds.includes(perm.id)} onChange={() => togglePermission(perm.id)} className="mr-3 accent-blue-500" />
                    <span className="text-sm flex-1">{perm.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{perm.code}</span>
                  </div>
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
