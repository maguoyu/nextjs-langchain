import type { Session } from 'next-auth'

const SUPER_ADMIN_CODE = 'super_admin'

export function hasPermission(user: Session['user'], permission: string): boolean {
  if (user.roles.includes(SUPER_ADMIN_CODE)) return true
  return user.permissions.includes(permission)
}

export function hasAnyPermission(user: Session['user'], permissions: string[]): boolean {
  if (user.roles.includes(SUPER_ADMIN_CODE)) return true
  return permissions.some((p) => user.permissions.includes(p))
}

export function hasAllPermissions(user: Session['user'], permissions: string[]): boolean {
  if (user.roles.includes(SUPER_ADMIN_CODE)) return true
  return permissions.every((p) => user.permissions.includes(p))
}

export function isSuperAdmin(user: Session['user']): boolean {
  return user.roles.includes(SUPER_ADMIN_CODE)
}
