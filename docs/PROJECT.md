# Next.js RBAC 数据展示大屏系统

## 项目介绍

这是一个基于 Next.js 15 + TypeScript + Tailwind CSS + MySQL + Redis + ECharts 的企业级 RBAC（Role-Based Access Control）权限管理系统，包含数据展示大屏功能。

### 主要特性

- **完整的 RBAC 权限管理**：用户、角色、权限、菜单的完整 CRUD
- **数据可视化大屏**：基于 ECharts 的数据统计和图表展示
- **现代化的 UI**：使用 Tailwind CSS 构建的响应式界面
- **会话管理**：结合 NextAuth 和 Redis 的安全认证
- **TypeScript**：全程类型安全

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 15.1.0 | React 框架 (App Router) |
| TypeScript | 5.7.0 | 类型安全 |
| Tailwind CSS | 4.0.0 | CSS 框架 |
| Prisma | 6.0.0 | ORM |
| MySQL | - | 关系型数据库 |
| Redis | - | 缓存/Session |
| NextAuth | 5.0.0-beta.25 | 认证框架 |
| ECharts | 5.5.1 | 数据可视化 |
| Zustand | 5.0.0 | 状态管理 |

---

## 项目结构

```
nextjs-rbac-dashboard/
├── prisma/
│   ├── schema.prisma      # 数据库模型定义
│   └── seed.ts           # 初始化数据
├── src/
│   ├── app/
│   │   ├── api/          # API 路由
│   │   │   ├── auth/     # 认证相关
│   │   │   ├── users/    # 用户管理
│   │   │   ├── roles/    # 角色管理
│   │   │   ├── permissions/  # 权限管理
│   │   │   ├── menus/    # 菜单管理
│   │   │   └── dashboard/    # 仪表盘数据
│   │   ├── auth/         # 认证页面
│   │   │   └── login/    # 登录页
│   │   ├── dashboard/     # 仪表盘页面
│   │   │   ├── page.tsx  # 数据大屏
│   │   │   ├── users/    # 用户管理页
│   │   │   ├── roles/    # 角色管理页
│   │   │   ├── permissions/  # 权限管理页
│   │   │   └── menus/    # 菜单管理页
│   │   ├── globals.css   # 全局样式
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 首页
│   ├── components/
│   │   ├── ui/           # UI 组件库
│   │   ├── layout/       # 布局组件
│   │   └── charts/       # 图表组件
│   ├── lib/              # 工具库
│   │   ├── auth.ts       # NextAuth 配置
│   │   ├── prisma.ts     # Prisma 客户端
│   │   ├── redis.ts      # Redis 客户端
│   │   └── store.ts      # Zustand 状态
│   └── types/            # 类型定义
├── docs/                 # 文档
├── .env.local            # 环境变量
├── package.json
└── tsconfig.json
```

---

## 功能模块

### 1. 用户管理
- 用户列表查询
- 创建/编辑/删除用户
- 用户角色分配
- 密码重置

### 2. 角色管理
- 角色列表查询
- 创建/编辑/删除角色
- 角色权限分配
- 权限粒度控制

### 3. 权限管理
- 权限树形展示
- 创建/编辑/删除权限
- 权限类型：目录、菜单、按钮
- 权限码规范

### 4. 菜单管理
- 菜单树形展示
- 创建/编辑/删除菜单
- 菜单类型：目录、菜单、按钮
- 路由路径配置

### 5. 数据大屏
- 统计卡片展示
- 用户活跃趋势图
- 角色分布饼图
- 新增用户柱状图
- API 调用量折线图

---

## 数据库设计

### ER 图

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : has
    ROLE ||--o{ ROLE_PERMISSION : has
    PERMISSION ||--o{ ROLE_PERMISSION : has
    MENU ||--o{ MENU : has

    USER {
        string id PK
        string username UK
        string password
        string name
        string email
        int status
        datetime createdAt
    }
    ROLE {
        string id PK
        string code UK
        string name
        int status
        int sort
        datetime createdAt
    }
    USER_ROLE {
        string id PK
        string userId FK
        string roleId FK
        datetime createdAt
    }
    PERMISSION {
        string id PK
        string code UK
        string name
        enum type
        string parentId FK
        string path
        int sort
        int status
        datetime createdAt
    }
    ROLE_PERMISSION {
        string id PK
        string roleId FK
        string permissionId FK
        datetime createdAt
    }
    MENU {
        string id PK
        string code UK
        string name
        enum type
        string parentId FK
        string path
        int sort
        int status
        datetime createdAt
    }
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 并修改配置：

```env
DATABASE_URL="mysql://root:123456@172.20.0.112:13306/nextjs_rbac?schema=public"
REDIS_HOST=172.20.0.112
REDIS_PORT=16379
REDIS_PASSWORD=123456
AUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 生成 Prisma 客户端

```bash
npm run db:generate
```

### 4. 同步数据库

```bash
npm run db:push
```

### 5. 初始化数据

```bash
npm run db:seed
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | 123456 |
| 普通用户 | test | 123456 |

---

## API 接口

详见 [API 文档](./API.md)

---

## 部署指南

### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 环境变量

生产环境需要设置以下环境变量：

- `DATABASE_URL`: MySQL 数据库地址
- `REDIS_HOST`: Redis 主机
- `REDIS_PORT`: Redis 端口
- `REDIS_PASSWORD`: Redis 密码
- `AUTH_SECRET`: NextAuth 密钥
- `NEXTAUTH_URL`: 应用 URL

---

## 开发指南

### 添加新的 API 路由

1. 在 `src/app/api/` 下创建路由文件夹
2. 创建 `route.ts` 文件处理请求
3. 使用 Prisma Client 访问数据库

### 添加新的页面

1. 在 `src/app/` 下创建页面文件夹
2. 创建 `page.tsx` 文件
3. 使用 `DashboardLayout` 包裹页面内容

### 添加新的 UI 组件

1. 在 `src/components/ui/` 下创建组件
2. 导出到 `src/components/ui/index.ts`

---

## License

MIT
