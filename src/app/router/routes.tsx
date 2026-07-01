import { createBrowserRouter } from 'react-router'

import { RootErrorBoundary } from '@/app/error/root-error-boundary'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { AdminPage } from '@/app/pages/admin-page'
import { HomePage } from '@/app/pages/home-page'
import { LoginPage } from '@/app/pages/login-page'
import { NotFoundPage } from '@/app/pages/not-found-page'

import { ProtectedRoute, RequireRole } from './guards'
import { paths } from './paths'

export const router = createBrowserRouter([
  {
    errorElement: <RootErrorBoundary />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: paths.login, element: <LoginPage /> }],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: paths.home, element: <HomePage /> },
              {
                element: <RequireRole permission="admin.access" />,
                children: [{ path: paths.admin, element: <AdminPage /> }],
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])
