'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'

interface Role {
  id: string; code: string; name: string; status: number; sort: number; remark: string | null; permissions: { id: string; code: string; name: string; type: string }[]; createdAt: string
}
interface Permission { id: string; code: string; name: string; type: string; children?: Permission[] }

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>系统管理</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">角色管理</span>
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
      if (data.code === 200 && Array.isArray(data.data)) setPermissions(data.data)
    } catch (error) { console.error(error) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])
  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  const flattenPermissions = (perms: Permission[], result: Permission[] = []): Permission[] => {
    if (!perms || !Array.isArray(perms)) return result
    for (const p of perms) { result.push(p); if (p.children) flattenPermissions(p.children, result) }
    return result
  }

  const openModal = (role?: Role) => {
    if (role) { setEditingRole(role); setFormData({ code: role.code, name: role.name, sort: role.sort, remark: role.remark || '', permissionIds: role.permissions.map(p => p.id) }) }
    else { setEditingRole(null); setFormData({ code: '', name: '', sort: 0, remark: '', permissionIds: [] }) }
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
    setFormData(prev => ({ ...prev, permissionIds: prev.permissionIds.includes(permId) ? prev.permissionIds.filter(id => id !== permId) : [...prev.permissionIds, permId] }))
  }

  const flatPerms = flattenPermissions(permissions || [])
  const isSuperAdmin = (code: string) => code === 'super_admin'

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumb />
            <h1 className="text-lg font-bold text-[var(--foreground)]">角色管理</h1>
          </div>
          <Button onClick={() => openModal()}>新增角色</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
              <Input placeholder="搜索角色名称或编码..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchRoles())} className="max-w-xs" />
              <Button onClick={() => { setPage(1); fetchRoles() }}>搜索</Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><span className="text-sm text-[var(--muted-foreground)]">加载中...</span></div>
            ) : roles.length === 0 ? (
              <Empty description="暂无角色数据" />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>角色编码</TableHead><TableHead>角色名称</TableHead><TableHead>权限</TableHead><TableHead>状态</TableHead><TableHead>排序</TableHead><TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell><span className="font-mono text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">{role.code}</span></TableCell>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {role.permissions.slice(0, 3).map((p) => <Badge key={p.id} variant="secondary">{p.name}</Badge>)}
                            {role.permissions.length > 3 && <Badge variant="outline">+{role.permissions.length - 3}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={role.status === 1 ? 'default' : 'destructive'}>{role.status === 1 ? '启用' : '禁用'}</Badge></TableCell>
                        <TableCell className="text-[var(--muted-foreground)]">{role.sort}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openModal(role)} disabled={isSuperAdmin(role.code)}>编辑</Button>
                            <Button variant="ghost" size="sm" className="text-[var(--destructive)]" onClick={() => handleDelete(role)} disabled={isSuperAdmin(role.code)}>删除</Button>
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
        <ModalHeader><ModalTitle>{editingRole ? '编辑角色' : '新增角色'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-3">
            <Input label="角色编码" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingRole} />
            <Input label="角色名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="排序" type="number" value={formData.sort} onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })} />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">权限分配</label>
              <div className="border border-[var(--border)] rounded-md p-2 max-h-48 overflow-y-auto space-y-0.5">
                {flatPerms.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--accent)] cursor-pointer" onClick={() => togglePermission(p.id)}>
                    <input type="checkbox" checked={formData.permissionIds.includes(p.id)} onChange={() => {}} className="accent-[var(--sidebar-primary)]" />
                    <span className="text-sm flex-1">{p.name}</span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">{p.code}</span>
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
