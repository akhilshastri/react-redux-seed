import { UsersTable } from '@/features/users'

export const UsersPage = () => {
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-muted-foreground text-sm">
          Server-driven grid (search, sort, paginate) with create/edit/delete. The API enforces RBAC
          — viewers get a 403 on writes.
        </p>
      </div>
      <UsersTable />
    </div>
  )
}
