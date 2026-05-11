# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (通过 NextAuth)
- **内容类型**: `application/json`

## 认证接口

### 登录

**POST** `/api/auth/[...nextauth]`

NextAuth 凭证登录，无需手动调用，通过 `signIn()` 函数使用。

**请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "user": {
      "id": "xxx",
      "username": "admin",
      "name": "系统管理员",
      "email": "admin@example.com",
      "roles": ["super_admin"],
      "permissions": ["system:user:list", "system:user:add", ...]
    }
  }
}
```

---

## 用户管理

### 获取用户列表

**GET** `/api/users`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词 |

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "xxx",
        "username": "admin",
        "name": "系统管理员",
        "email": "admin@example.com",
        "phone": null,
        "status": 1,
        "roles": [{"id": "xxx", "name": "超级管理员", "code": "super_admin"}],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 获取单个用户

**GET** `/api/users/[id]`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "xxx",
    "username": "admin",
    "name": "系统管理员",
    "email": "admin@example.com",
    "roles": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建用户

**POST** `/api/users`

**请求体**:
```json
{
  "username": "newuser",
  "password": "password123",
  "name": "新用户",
  "email": "newuser@example.com",
  "phone": "13800138000",
  "roleIds": ["role-id-1", "role-id-2"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": "xxx",
    "username": "newuser",
    "name": "新用户",
    "roles": [...]
  }
}
```

### 更新用户

**PUT** `/api/users/[id]`

**请求体**:
```json
{
  "name": "更新后的名称",
  "email": "updated@example.com",
  "roleIds": ["role-id-1"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {...}
}
```

### 删除用户

**DELETE** `/api/users/[id]`

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 修改密码

**PUT** `/api/users/[id]/password`

**请求体**:
```json
{
  "oldPassword": "old123456",
  "newPassword": "new123456"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "密码修改成功"
}
```

---

## 角色管理

### 获取角色列表

**GET** `/api/roles`

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词 |

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "xxx",
        "code": "super_admin",
        "name": "超级管理员",
        "status": 1,
        "sort": 1,
        "permissions": [
          {"id": "xxx", "code": "system:user:list", "name": "用户查询"}
        ]
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 获取单个角色

**GET** `/api/roles/[id]`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "xxx",
    "code": "super_admin",
    "name": "超级管理员",
    "permissions": [...]
  }
}
```

### 创建角色

**POST** `/api/roles`

**请求体**:
```json
{
  "code": "editor",
  "name": "编辑角色",
  "sort": 10,
  "remark": "编辑器角色",
  "permissionIds": ["perm-id-1", "perm-id-2"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {...}
}
```

### 更新角色

**PUT** `/api/roles/[id]`

**请求体**:
```json
{
  "name": "更新后的角色名",
  "sort": 5,
  "permissionIds": ["perm-id-1", "perm-id-3"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {...}
}
```

### 删除角色

**DELETE** `/api/roles/[id]`

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 权限管理

### 获取权限列表

**GET** `/api/permissions`

返回树形结构的权限列表。

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "xxx",
      "code": "system",
      "name": "系统管理",
      "type": "CATALOG",
      "children": [
        {
          "id": "xxx",
          "code": "system:user",
          "name": "用户管理",
          "type": "MENU",
          "children": [
            {
              "id": "xxx",
              "code": "system:user:list",
              "name": "用户查询",
              "type": "BUTTON"
            }
          ]
        }
      ]
    }
  ]
}
```

### 创建权限

**POST** `/api/permissions`

**请求体**:
```json
{
  "code": "system:user:export",
  "name": "用户导出",
  "type": "BUTTON",
  "parentId": "parent-perm-id",
  "path": "/api/users/export",
  "icon": "Export",
  "sort": 0
}
```

**响应**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {...}
}
```

### 更新权限

**PUT** `/api/permissions/[id]`

**请求体**:
```json
{
  "name": "更新后的权限名",
  "sort": 1
}
```

### 删除权限

**DELETE** `/api/permissions/[id]`

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 菜单管理

### 获取菜单列表

**GET** `/api/menus`

返回树形结构的菜单列表。

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "xxx",
      "code": "dashboard",
      "name": "数据大屏",
      "type": "MENU",
      "path": "/dashboard",
      "icon": "DataBoard",
      "sort": 0,
      "children": []
    },
    {
      "id": "xxx",
      "code": "system",
      "name": "系统管理",
      "type": "CATALOG",
      "children": [
        {
          "id": "xxx",
          "code": "system:user",
          "name": "用户管理",
          "type": "MENU",
          "path": "/dashboard/users"
        }
      ]
    }
  ]
}
```

### 创建菜单

**POST** `/api/menus`

**请求体**:
```json
{
  "code": "new-menu",
  "name": "新菜单",
  "type": "MENU",
  "parentId": "parent-menu-id",
  "path": "/new-menu",
  "icon": "Menu",
  "sort": 10
}
```

### 更新菜单

**PUT** `/api/menus/[id]`

**请求体**:
```json
{
  "name": "更新后的菜单名",
  "sort": 5,
  "path": "/updated-path"
}
```

### 删除菜单

**DELETE** `/api/menus/[id]`

---

## 仪表盘

### 获取统计数据

**GET** `/api/dashboard/stats`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "userCount": 10,
      "roleCount": 5,
      "permissionCount": 20,
      "menuCount": 8
    },
    "userTrend": [
      {"date": "05-03", "count": 50},
      {"date": "05-04", "count": 60}
    ],
    "roleDistribution": [
      {"name": "超级管理员", "value": 1},
      {"name": "普通用户", "value": 9}
    ],
    "monthlyNewUsers": [
      {"month": "1月", "value": 20},
      {"month": "2月", "value": 25}
    ],
    "apiCalls": [
      {"hour": "00", "value": 50},
      {"hour": "04", "value": 30}
    ]
  }
}
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 权限码列表

| 权限码 | 说明 |
|--------|------|
| system:user:list | 用户查询 |
| system:user:add | 用户新增 |
| system:user:edit | 用户编辑 |
| system:user:delete | 用户删除 |
| system:user:resetPwd | 重置密码 |
| system:role:list | 角色查询 |
| system:role:add | 角色新增 |
| system:role:edit | 角色编辑 |
| system:role:delete | 角色删除 |
| system:permission:list | 权限查询 |
| system:permission:add | 权限新增 |
| system:permission:edit | 权限编辑 |
| system:permission:delete | 权限删除 |
| system:menu:list | 菜单查询 |
| system:menu:add | 菜单新增 |
| system:menu:edit | 菜单编辑 |
| system:menu:delete | 菜单删除 |
| dashboard:view | 数据大屏查看 |
