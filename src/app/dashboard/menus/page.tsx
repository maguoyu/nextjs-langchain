'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Empty } from '@/components/ui'

interface Menu { id: string; code: string; name: string; type: string; parentId: string | null; path: string | null; icon: string | null; sort: number; status: number; keepAlive: number; external: number; remark: string | null; children?: Menu[]; createdAt: string }
const typeLabels: Record<string, string> = { CATALOG: '目录', MENU: '菜单', BUTTON: '按钮' }

function Breadcrumb() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1">
      <span>系统管理</span>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      <span className="text-[var(--foreground)] font-medium">菜单管理</span>
    </div>
  )
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])
  const [formData, setFormData] = useState({ code: '', name: '', type: 'MENU', parentId: '', path: '', icon: '', sort: 0, keepAlive: 1, external: 0, remark: '' })
  const [saving, setSaving] = useState(false)

  const buildParentOptions = (menuList: Menu[], level = 0): { label: string; value: string }[] => {
    const options: { label: string; value: string }[] = []
    for (const m of menuList) { options.push({ label: `${'　'.repeat(level)}${m.name}`, value: m.id }); if (m.children) options.push(...buildParentOptions(m.children, level + 1)) }
    return options
  }

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/menus')
      const data = await res.json()
      if (data.code === 200) { setMenus(data.data); setParentOptions(buildParentOptions(data.data)) }
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMenus() }, [fetchMenus])

  const flattenMenus = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = []
    for (const m of menuList) { result.push(m); if (m.children) result.push(...flattenMenus(m.children)) }
    return result
  }

  const openModal = (menu?: Menu) => {
    if (menu) { setEditingMenu(menu); setFormData({ code: menu.code, name: menu.name, type: menu.type, parentId: menu.parentId || '', path: menu.path || '', icon: menu.icon || '', sort: menu.sort, keepAlive: menu.keepAlive, external: menu.external, remark: menu.remark || '' }) }
    else { setEditingMenu(null); setFormData({ code: '', name: '', type: 'MENU', parentId: '', path: '', icon: '', sort: 0, keepAlive: 1, external: 0, remark: '' }) }
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) { alert('请填写完整信息'); return }
    setSaving(true)
    try {
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : '/api/menus'
      const method = editingMenu ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, parentId: formData.parentId || null }) })
      const data = await res.json()
      if (data.code === 200) { setModalOpen(false); fetchMenus() }
      else alert(data.message)
    } catch (error) { console.error(error) }
    finally { setSaving(false) }
  }

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`确定要删除菜单 "${menu.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/menus/${menu.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) fetchMenus()
      else alert(data.message)
    } catch (error) { console.error(error) }
  }

  const flatMenus = flattenMenus(menus)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb />
          <h1 className="text-lg font-bold text-[var(--foreground)]">菜单管理</h1>
        </div>
        <Button onClick={() => openModal()}>新增菜单</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (<div className="flex items-center justify-center py-12"><span className="text-sm text-[var(--muted-foreground)]">加载中...</span></div>) : flatMenus.length === 0 ? (<Empty description="暂无菜单数据" />) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>菜单编码</TableHead><TableHead>菜单名称</TableHead><TableHead>类型</TableHead><TableHead>路由路径</TableHead><TableHead>图标</TableHead><TableHead>状态</TableHead><TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flatMenus.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell><span className="font-mono text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">{m.code}</span></TableCell>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="secondary">{typeLabels[m.type]}</Badge></TableCell>
                    <TableCell className="text-[var(--muted-foreground)] text-xs font-mono">{m.path || '-'}</TableCell>
                    <TableCell className="text-[var(--muted-foreground)] text-sm">{m.icon || '-'}</TableCell>
                    <TableCell><Badge variant={m.status === 1 ? 'default' : 'destructive'}>{m.status === 1 ? '显示' : '隐藏'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openModal(m)}>编辑</Button>
                        <Button variant="ghost" size="sm" className="text-[var(--destructive)]" onClick={() => handleDelete(m)}>删除</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader><ModalTitle>{editingMenu ? '编辑菜单' : '新增菜单'}</ModalTitle></ModalHeader>
        <ModalContent>
          <div className="space-y-3">
            <Input label="菜单编码" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} disabled={!!editingMenu} placeholder="如: system:user" />
            <Input label="菜单名称" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">菜单类型</label>
              <div className="flex gap-3">
                {['CATALOG', 'MENU', 'BUTTON'].map((type) => (
                  <label key={type} className="flex items-center gap-1.5 text-sm text-[var(--foreground)]">
                    <input type="radio" name="menu-type" value={type} checked={formData.type === type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="accent-[var(--sidebar-primary)]" />
                    {typeLabels[type]}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">上级菜单</label>
              <select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} className="input">
                <option value="">无上级</option>
                {parentOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <Input label="路由路径" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} placeholder="/dashboard/users" />
            <Input label="图标" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
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
