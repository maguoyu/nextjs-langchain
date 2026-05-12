import { z } from 'zod'

// 用户相关 schemas
export const CreateUserSchema = z.object({
  username: z.string().min(3, '用户名至少3个字符').max(50, '用户名最多50个字符'),
  password: z.string().min(6, '密码至少6个字符').max(100, '密码最多100个字符'),
  name: z.string().min(1, '姓名不能为空').max(100, '姓名最多100个字符'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .optional()
    .or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  remark: z.string().max(500).optional(),
  roleIds: z.array(z.string()).optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  remark: z.string().max(500).optional(),
  status: z.number().int().min(0).max(1).optional(),
  roleIds: z.array(z.string()).optional(),
})

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, '旧密码不能为空'),
  newPassword: z.string().min(6, '新密码至少6个字符').max(100, '新密码最多100个字符'),
})

// 角色相关 schemas
export const CreateRoleSchema = z.object({
  code: z.string().min(1, '角色编码不能为空').max(50, '角色编码最多50个字符'),
  name: z.string().min(1, '角色名称不能为空').max(100, '角色名称最多100个字符'),
  status: z.number().int().min(0).max(1).optional(),
  sort: z.number().int().min(0).optional(),
  remark: z.string().max(500).optional(),
  permissionIds: z.array(z.string()).optional(),
})

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.number().int().min(0).max(1).optional(),
  sort: z.number().int().min(0).optional(),
  remark: z.string().max(500).optional(),
  permissionIds: z.array(z.string()).optional(),
})

// 权限相关 schemas
export const CreatePermissionSchema = z.object({
  code: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  type: z.enum(['CATALOG', 'MENU', 'BUTTON']),
  parentId: z.string().optional(),
  path: z.string().max(255).optional(),
  icon: z.string().max(100).optional(),
  sort: z.number().int().min(0).optional(),
  status: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500).optional(),
})

export const UpdatePermissionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['CATALOG', 'MENU', 'BUTTON']).optional(),
  parentId: z.string().nullable().optional(),
  path: z.string().max(255).optional(),
  icon: z.string().max(100).optional(),
  sort: z.number().int().min(0).optional(),
  status: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500).optional(),
})

// 菜单相关 schemas
export const CreateMenuSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(100),
  type: z.enum(['CATALOG', 'MENU', 'BUTTON']),
  parentId: z.string().nullable().optional(),
  path: z.string().max(255).nullable().optional(),
  icon: z.string().max(100).nullable().optional(),
  sort: z.number().int().min(0).optional(),
  status: z.number().int().min(0).max(1).optional(),
  keepAlive: z.number().int().min(0).max(1).optional(),
  external: z.number().int().min(0).max(1).optional(),
  visible: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500).optional(),
})

export const UpdateMenuSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(100).optional(),
  type: z.enum(['CATALOG', 'MENU', 'BUTTON']).optional(),
  parentId: z.string().nullable().optional(),
  path: z.string().max(255).optional(),
  icon: z.string().max(100).optional(),
  sort: z.number().int().min(0).optional(),
  status: z.number().int().min(0).max(1).optional(),
  keepAlive: z.number().int().min(0).max(1).optional(),
  external: z.number().int().min(0).max(1).optional(),
  visible: z.number().int().min(0).max(1).optional(),
  remark: z.string().max(500).optional(),
})

// 登录
export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// 分页参数
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>
export type UpdatePermissionInput = z.infer<typeof UpdatePermissionSchema>
export type CreateMenuInput = z.infer<typeof CreateMenuSchema>
export type UpdateMenuInput = z.infer<typeof UpdateMenuSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type PaginationInput = z.infer<typeof PaginationSchema>
