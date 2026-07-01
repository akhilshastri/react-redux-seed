import { z } from 'zod'

export const roleSchema = z.enum(['admin', 'viewer'])
export type Role = z.infer<typeof roleSchema>

export type Permission =
  'users.read' | 'users.create' | 'users.update' | 'users.delete' | 'admin.access'

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: ['users.read', 'users.create', 'users.update', 'users.delete', 'admin.access'],
  viewer: ['users.read'],
}

/** Client-side check — UX only. The API enforces the real thing (403). */
export const hasPermission = (roles: readonly Role[], permission: Permission): boolean =>
  roles.some((role) => ROLE_PERMISSIONS[role].includes(permission))
