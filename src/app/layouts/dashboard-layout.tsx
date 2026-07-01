import { NavLink, Outlet } from 'react-router'

import { paths } from '@/app/router/paths'
import { Can, useAuth, useLogout } from '@/features/auth'
import { APP_NAME } from '@/shared/config/constants'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

import { ThemeToggle } from './theme-toggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm transition-colors hover:text-foreground',
    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
  )

export const DashboardLayout = () => {
  const { user } = useAuth()
  const logout = useLogout()

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">{APP_NAME}</span>
            <nav className="flex items-center gap-4">
              <NavLink to={paths.home} end className={navLinkClass}>
                Home
              </NavLink>
              <Can permission="admin.access">
                <NavLink to={paths.admin} className={navLinkClass}>
                  Admin
                </NavLink>
              </Can>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user ? <span className="text-muted-foreground text-sm">{user.email}</span> : null}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
