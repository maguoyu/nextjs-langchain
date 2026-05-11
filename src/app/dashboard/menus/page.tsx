'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, Empty } from '@/components/ui'
import { DashboardLayout } from '@/components/layout'

interface Menu {
  id: string
  code: string
  name: string
  type: string
  parentId: string | null
  path: string | null
  icon: string | null
  sort: number
  status: number
  keepAlive: number
  external: number
  remark: string | null
  children?: Menu[]
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

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [parentOptions, setParentOptions] = useState<{ label: string; value: string }[]>([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'MENU',
    parentId: '',
    path: '',
    icon: '',
    sort: 0,
    keepAlive: 1,
    external: 0,
    remark: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchMenus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/menus')
      const data = await res.json()
      if (data.code === 200) {
        setMenus(data.data)
        setParentOptions(buildParentOptions(data.data))
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const buildParentOptions = (menuList: Menu[], level = 0): { label: string; value: string }[] => {
    const options: { label: string; value: string }[] = []
    for (const menu of menuList) {
      const prefix = '　'.repeat(level)
      options.push({ label: `${prefix}${menu.name}`, value: menu.id })
      if (menu.children) {
        options.push(...buildParentOptions(menu.children, level + 1))
      }
    }
    return options
  }

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  const flattenMenus = (menuList: Menu[]): Menu[] => {
    const result: Menu[] = []
    for (const menu of menuList) {
      result.push(menu)
      if (menu.children) {
        result.push(...flattenMenus(menu.children))
      }
    }
    return result
  }

  const openModal = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu)
      setFormData({
        code: menu.code,
        name: menu.name,
        type: menu.type,
        parentId: menu.parentId || '',
        path: menu.path || '',
        icon: menu.icon || '',
        sort: menu.sort,
        keepAlive: menu.keepAlive,
        external: menu.external,
        remark: menu.remark || '',
      })
    } else {
      setEditingMenu(null)
      setFormData({
        code: '',
        name: '',
        type: 'MENU',
        parentId: '',
        path: '',
        icon: '',
        sort: 0,
        keepAlive: 1,
        external: 0,
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
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : '/api/menus'
      const method = editingMenu ? 'PUT' : 'POST'
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
        fetchMenus()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to save menu:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (menu: Menu) => {
    if (!confirm(`确定要删除菜单 "${menu.name}" 吗？`)) return
    try {
      const res = await fetch(`/api/menus/${menu.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.code === 200) {
        fetchMenus()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to delete menu:', error)
    }
  }

  const flatMenus = flattenMenus(menus)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">菜单管理</h1>
          <p className="text-gray-500 dark:text-gray-400">管理系统菜单</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>菜单列表</CardTitle>
              <Button onClick={() => openModal()}>新增菜单</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : flatMenus.length === 0 ? (
              <Empty description="暂无菜单数据" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>菜单编码</TableHead>
                    <TableHead>菜单名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>路由路径</TableHead>
                    <TableHead>图标</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatMenus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-mono text-xs">{menu.code}</TableCell>
                      <TableCell>{menu.name}</TableCell>
                      <TableCell>
                        <Badge variant={typeColors[menu.type]}>
                          {typeLabels[menu.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{menu.path || '-'}</TableCell>
                      <TableCell>{menu.icon || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={menu.status === 1 ? 'success' : 'danger'}>
                          {menu.status === 1 ? '显示' : '隐藏'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(menu)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(menu)}
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

      {/* 菜单表单弹窗 */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>{editingMenu ? '编辑菜单' : '新增菜单'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="菜单编码"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingMenu}
              placeholder="如: system:user"
            />
            <Input
              label="菜单名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                菜单类型
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
                上级菜单
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
              placeholder="/dashboard/users"
            />
            <Input
              label="图标"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="IconName"
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
