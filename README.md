# Next.js RBAC Dashboard

基于 Next.js 15 + TypeScript + Tailwind CSS + MySQL + Redis + ECharts 的企业级 RBAC 权限管理系统。

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
# 编辑 .env.local 文件

# 生成 Prisma 客户端
npm run db:generate

# 同步数据库
npm run db:push

# 初始化数据
npm run db:seed

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 默认账号

- 用户名: admin
- 密码: 123456

## 主要功能

- 用户管理 (CRUD)
- 角色管理 (CRUD + 权限分配)
- 权限管理 (树形结构)
- 菜单管理 (树形结构)
- 数据展示大屏 (ECharts)

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma + MySQL
- Redis
- NextAuth
- ECharts
- Zustand

## 文档

- [项目文档](./docs/PROJECT.md)
- [API 文档](./docs/API.md)
