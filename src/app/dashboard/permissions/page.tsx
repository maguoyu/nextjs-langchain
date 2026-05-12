'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Pagination, Empty } from '@/components/ui'

interface Permission { id: string; code: string; name: string; type: string; parentId: string | null; path: string | null; icon: string | null; sort: number; status: number; remark: string | null; children?: Permission[]; createdAt: string }
const typeLabels: Record<string, string> = { CATALOG: '目录', MENU: '菜单', BUTTON: '按钮' }

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>系统管理</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">权限管理</span>
    </div>
  )
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])
  const [formData, setFormData] = useState({ code: '', name: '', type: 'BUTTON', parentId: '', path: '', icon: '', sort: 0, remark: '' })
  const [saving, setSaving] = useState(false)

  const buildParentOptions = (perms: Permission[], level = 0): { label: string; value: string }[] => {
    const options: { label: string; value: string }[] = []
    for (const p of perms) { options.push({ label: `${'　'.repeat(level)}${p.name}`, value: p.id }); if (p.children) options.push(...buildParentOptions(p.children, level + 1)) }
    return options
  }

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/permissions?page=${page}&pageSize=${pageSize}&keyword=${encodeURIComponent(keyword)}`)
      const data = await res.json()
      if (data.code === 200) { setPermissions(data.data.list); setTotal(data.data.total) }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [page, pageSize, keyword])

  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  useEffect(() => { setParentOptions(buildParentOptions(permissions)) }, [permissions])

  const flattenPermissions = (perms: Permission[]): Permission[] => {
    const result: Permission[] = []
    for (const p of perms) { result.push(p); if (p.children) result.push(...flattenPermissions(p.children)) }
    return result
  }

  const openModal = (permission?: Permission) => {
    if (permission) { setEditingPermission(permission); setFormData({ code: permission.code, name: permission.name, type: permission.type, parentId: permission.parentId || '', path: permission.path || '', icon: permission.icon || '', sort: permission.sort, remark: permission.remark || '' }) }
    else { setEditingPermission(null); setFormData({ code: '', name: '', type: 'BUTTON', parentId: '', path: '', icon: '', sort: 0, remark: '' }) }
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-lg font-bold text-[var(--foreground)]">权限管理</h1>
        </div>
        <Button onClick={() => openModal()}>新增权限</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
            <Input placeholder="搜索权限名称或编码..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchPermissions())} className="max-w-xs" />
            <Button onClick={() => { setPage(1); fetchPermissions() }}>搜索</Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><span className="text-sm text-[var(--muted-foreground)]">加载中...</span></div>
          ) : flatPerms.length === 0 ? (
            <Empty description="暂无权限数据" />
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>权限编码</TableHead><TableHead>权限名称</TableHead><TableHead>类型</TableHead><TableHead>路径</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flatPerms.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell><span className="font-mono text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">{p.code}</span></TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary">{typeLabels[p.type]}</Badge></TableCell>
                    <TableCell className="text-[var(--muted-foreground)] text-xs">{p.path || '-'}</TableCell>
                    <TableCell><Badge variant={p.status === 1 ? 'default' : 'destructive'}>{p.status === 1 ? '启用' : '禁用'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openModal(p)}>编辑</Button>
                        <Button variant="ghost" size="sm" className="text-[var(--destructive)]" onClick={() => handleDelete(p)}>删除</Button>
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
        <ModalHeader><ModalTitle>{editingPermission ? '编辑权限' : '新增权限'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-3">
            <Input label="权限编码" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingPermission} placeholder="如: system:user:add" />
            <Input label="权限名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">权限类型</label>
              <div className="flex gap-3">
                {['CATALOG', 'MENU', 'BUTTON'].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm text-[var(--foreground)]">
                    <input type="radio" name="perm-type" value={type} checked={formData.type === type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="accent-[var(--sidebar-primary)]" />
                    {typeLabels[type]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">上级权限</label>
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
