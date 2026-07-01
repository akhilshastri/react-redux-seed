import { useAppSelector } from '@/app/store'
import { type Permission, hasPermission } from '@/domain'

import { selectAuthRoles } from '../store/auth-slice'

export const usePermissions = () => {
  const roles = useAppSelector(selectAuthRoles)
  return {
    roles,
    can: (permission: Permission) => hasPermission(roles, permission),
  }
}
