import { Navigate, Outlet } from 'react-router'

import { paths } from '@/app/router/paths'
import { useAuth } from '@/features/auth'

/** Layout for unauthenticated pages. Bounces authed users to home. */
export const AuthLayout = () => {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to={paths.home} replace />

  return (
    <div className="bg-background text-foreground grid min-h-dvh place-items-center px-4">
      <Outlet />
    </div>
  )
}
