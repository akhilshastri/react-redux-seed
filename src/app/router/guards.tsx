import { Navigate, Outlet, useLocation } from 'react-router'

import { type Permission } from '@/domain'
import { useAuth, usePermissions } from '@/features/auth'

import { paths } from './paths'

const FullscreenLoader = () => (
  <div className="bg-background text-muted-foreground grid min-h-dvh place-items-center">
    <span className="text-sm">Loading…</span>
  </div>
)

/** Gates a subtree on authentication. Redirects to /login when unauthenticated. */
export const ProtectedRoute = () => {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'unknown') return <FullscreenLoader />
  if (status === 'unauthenticated') {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** Gates a subtree on a permission (client UX; the API still enforces 403). */
export const RequireRole = ({ permission }: { permission: Permission }) => {
  const { can } = usePermissions()
  if (!can(permission)) return <Navigate to={paths.home} replace />
  return <Outlet />
}
