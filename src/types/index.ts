import { User, Role, Permission, Menu } from '@prisma/client'

// 用户相关
export interface UserWithRoles extends User {
  roles: {
    role: Role & {
      permissions: {
        permission: Permission
      }[]
    }
  }[]
}

// 创建用户 DTO
export interface CreateUserDto {
  username: string
  password: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  remark?: string
  roleIds?: string[]
}

// 更新用户 DTO
export interface UpdateUserDto {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  remark?: string
  status?: number
  roleIds?: string[]
}

// 修改密码 DTO
export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

// 角色相关
export interface CreateRoleDto {
  code: string
  name: string
  status?: number
  sort?: number
  remark?: string
  permissionIds?: string[]
}

export interface UpdateRoleDto {
  name?: string
  status?: number
  sort?: number
  remark?: string
  permissionIds?: string[]
}

// 权限相关
export type PermissionType = 'CATALOG' | 'MENU' | 'BUTTON'

export interface CreatePermissionDto {
  code: string
  name: string
  type: PermissionType
  parentId?: string
  path?: string
  icon?: string
  sort?: number
  status?: number
  remark?: string
}

export interface UpdatePermissionDto {
  name?: string
  type?: PermissionType
  parentId?: string
  path?: string
  icon?: string
  sort?: number
  status?: number
  remark?: string
}

// 菜单相关
export type MenuType = 'CATALOG' | 'MENU' | 'BUTTON'

export interface CreateMenuDto {
  name: string
  code: string
  type: MenuType
  parentId?: string
  path?: string
  icon?: string
  sort?: number
  status?: number
  keepAlive?: number
  external?: number
  visible?: number
  remark?: string
}

export interface UpdateMenuDto {
  name?: string
  type?: MenuType
  parentId?: string
  path?: string
  icon?: string
  sort?: number
  status?: number
  keepAlive?: number
  external?: number
  visible?: number
  remark?: string
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API 响应
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data?: T
}

// 树形结构
export type TreeNode<T> = T & {
  children?: TreeNode<T>[]
}
