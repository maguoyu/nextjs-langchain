import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // 创建超级管理员角色
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      code: 'super_admin',
      name: '超级管理员',
      status: 1,
      sort: 1,
      remark: '拥有系统所有权限',
    },
  })

  // 创建普通用户角色
  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      code: 'user',
      name: '普通用户',
      status: 1,
      sort: 2,
      remark: '普通用户角色',
    },
  })

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('123456', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员',
      email: 'admin@example.com',
      status: 1,
      remark: '默认管理员账号',
    },
  })

  // 创建普通用户
  const testUser = await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password: hashedPassword,
      name: '测试用户',
      email: 'test@example.com',
      status: 1,
      remark: '测试账号',
    },
  })

  // 关联用户和角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: testUser.id,
        roleId: userRole.id,
      },
    },
    update: {},
    create: {
      userId: testUser.id,
      roleId: userRole.id,
    },
  })

  // 创建权限
  const permissions = [
    // 用户管理权限
    { code: 'system:user:list', name: '用户查询', type: 'BUTTON' },
    { code: 'system:user:add', name: '用户新增', type: 'BUTTON' },
    { code: 'system:user:edit', name: '用户编辑', type: 'BUTTON' },
    { code: 'system:user:delete', name: '用户删除', type: 'BUTTON' },
    { code: 'system:user:resetPwd', name: '重置密码', type: 'BUTTON' },
    // 角色管理权限
    { code: 'system:role:list', name: '角色查询', type: 'BUTTON' },
    { code: 'system:role:add', name: '角色新增', type: 'BUTTON' },
    { code: 'system:role:edit', name: '角色编辑', type: 'BUTTON' },
    { code: 'system:role:delete', name: '角色删除', type: 'BUTTON' },
    // 权限管理权限
    { code: 'system:permission:list', name: '权限查询', type: 'BUTTON' },
    { code: 'system:permission:add', name: '权限新增', type: 'BUTTON' },
    { code: 'system:permission:edit', name: '权限编辑', type: 'BUTTON' },
    { code: 'system:permission:delete', name: '权限删除', type: 'BUTTON' },
    // 菜单管理权限
    { code: 'system:menu:list', name: '菜单查询', type: 'BUTTON' },
    { code: 'system:menu:add', name: '菜单新增', type: 'BUTTON' },
    { code: 'system:menu:edit', name: '菜单编辑', type: 'BUTTON' },
    { code: 'system:menu:delete', name: '菜单删除', type: 'BUTTON' },
    // 数据大屏权限
    { code: 'dashboard:view', name: '数据大屏查看', type: 'BUTTON' },
  ]

  const createdPermissions: { id: string; code: string }[] = []
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: {
        code: perm.code,
        name: perm.name,
        type: perm.type,
        status: 1,
        sort: 0,
      },
    })
    createdPermissions.push(created)
  }

  // 给超级管理员分配所有权限
  for (const perm of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    })
  }

  // 给普通用户分配查看权限
  const viewPermissions = createdPermissions.filter(p => 
    p.code.includes(':list') || p.code === 'dashboard:view'
  )
  for (const perm of viewPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: perm.id,
      },
    })
  }

  // 创建菜单
  const menus = [
    // 系统管理目录
    {
      code: 'system',
      name: '系统管理',
      type: 'CATALOG',
      path: '/system',
      icon: 'Setting',
      sort: 1,
      children: [
        { code: 'system:user', name: '用户管理', type: 'MENU', path: '/dashboard/users', icon: 'User', sort: 1 },
        { code: 'system:role', name: '角色管理', type: 'MENU', path: '/dashboard/roles', icon: 'UserRole', sort: 2 },
        { code: 'system:permission', name: '权限管理', type: 'MENU', path: '/dashboard/permissions', icon: 'Lock', sort: 3 },
        { code: 'system:menu', name: '菜单管理', type: 'MENU', path: '/dashboard/menus', icon: 'Menu', sort: 4 },
      ],
    },
    // 数据大屏
    {
      code: 'dashboard',
      name: '数据大屏',
      type: 'MENU',
      path: '/dashboard',
      icon: 'DataBoard',
      sort: 0,
      children: [],
    },
    // AI Demo 目录
    {
      code: 'ai-demo',
      name: 'AI Demo',
      type: 'CATALOG',
      path: '/ai-demo',
      icon: 'Bot',
      sort: 2,
      children: [
        { code: 'ai:langchain', name: 'LangChain Chat', type: 'MENU', path: '/dashboard/langchain', icon: 'Bot', sort: 1 },
        { code: 'ai:langgraph', name: 'LangGraph Workflow', type: 'MENU', path: '/dashboard/langgraph', icon: 'Workflow', sort: 2 },
      ],
    },
  ]

  for (const menu of menus) {
    const parentMenu = await prisma.menu.upsert({
      where: { code: menu.code },
      update: {},
      create: {
        code: menu.code,
        name: menu.name,
        type: menu.type,
        path: menu.path,
        icon: menu.icon,
        sort: menu.sort,
        status: 1,
      },
    })

    for (const child of menu.children) {
      await prisma.menu.upsert({
        where: { code: child.code },
        update: {},
        create: {
          code: child.code,
          name: child.name,
          type: child.type,
          path: child.path,
          icon: child.icon,
          sort: child.sort,
          status: 1,
          parentId: parentMenu.id,
        },
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
