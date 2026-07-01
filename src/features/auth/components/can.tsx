import { type ReactNode } from 'react'

import { type Permission } from '@/domain'

import { usePermissions } from '../hooks/use-permissions'

interface CanProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

/** Renders children only if the current user has the permission (UX only). */
export const Can = ({ permission, children, fallback = null }: CanProps) => {
  const { can } = usePermissions()
  return <>{can(permission) ? children : fallback}</>
}
