import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/store'
import { type User } from '@/domain'
import { Can } from '@/features/auth'
import { useDebounce } from '@/shared/hooks'
import { Button, Checkbox, Input } from '@/shared/ui'
import { DataGrid } from '@/shared/ui/data-grid'

import { useDeleteUsers, useUsers } from '../api/use-users'
import {
  clearSelection,
  selectUsersUi,
  setPage,
  setSearch,
  setSelectedIds,
  setSorting,
} from '../store/users-slice'
import { UserDialog } from './user-dialog'

const EMPTY: User[] = []

// Module-level (stable identity) so the compiler + table don't reset on render.
const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    size: 48,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows on this page"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <span onClick={(event) => event.stopPropagation()}>
        <Checkbox
          aria-label={`Select ${row.original.name}`}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </span>
    ),
  },
  { accessorKey: 'name', header: 'Name', size: 260 },
  { accessorKey: 'email', header: 'Email', size: 380 },
  {
    id: 'role',
    header: 'Role',
    size: 140,
    accessorFn: (user) => user.roles[0] ?? '',
    cell: ({ getValue }) => <span className="capitalize">{String(getValue())}</span>,
  },
]

export const UsersTable = () => {
  const dispatch = useAppDispatch()
  const ui = useAppSelector(selectUsersUi)

  const [searchInput, setSearchInput] = useState(ui.search)
  const debouncedSearch = useDebounce(searchInput, 300)
  useEffect(() => {
    dispatch(setSearch(debouncedSearch))
  }, [debouncedSearch, dispatch])

  const query = useUsers({
    search: ui.search,
    sortBy: ui.sortBy,
    sortDir: ui.sortDir,
    page: ui.page,
    pageSize: ui.pageSize,
  })
  const total = query.data?.total ?? 0
  const pageCount = query.data?.pageCount ?? 0

  const sorting: SortingState = useMemo(
    () => [{ id: ui.sortBy, desc: ui.sortDir === 'desc' }],
    [ui.sortBy, ui.sortDir],
  )
  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: ui.page, pageSize: ui.pageSize }),
    [ui.page, ui.pageSize],
  )
  const rowSelection: RowSelectionState = useMemo(
    () => Object.fromEntries(ui.selectedIds.map((id) => [id, true])),
    [ui.selectedIds],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table memoizes itself; the compiler bails here by design (plan §4.5).
  const table = useReactTable({
    data: query.data?.rows ?? EMPTY,
    columns,
    state: { sorting, pagination, rowSelection },
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    // Server-driven: never auto-reset the page when data arrives, or the reset
    // dispatches back into Redux and loops ("Maximum update depth").
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    rowCount: total,
    pageCount,
    getRowId: (user) => user.id,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      const first = next[0] ?? { id: 'name', desc: false }
      dispatch(setSorting({ sortBy: first.id, sortDir: first.desc ? 'desc' : 'asc' }))
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      dispatch(setPage(next.pageIndex))
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      dispatch(setSelectedIds(Object.keys(next).filter((id) => next[id])))
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const deleteUsers = useDeleteUsers()

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (user: User) => {
    setEditing(user)
    setDialogOpen(true)
  }
  const onDelete = () => {
    if (ui.selectedIds.length === 0) return
    deleteUsers.mutate(ui.selectedIds, { onSuccess: () => dispatch(clearSelection()) })
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search users…"
          className="max-w-xs"
        />
        <div className="flex items-center gap-2">
          {ui.selectedIds.length > 0 ? (
            <Can permission="users.delete">
              <Button variant="destructive" onClick={onDelete} disabled={deleteUsers.isPending}>
                Delete ({ui.selectedIds.length})
              </Button>
            </Can>
          ) : null}
          <Can permission="users.create">
            <Button onClick={openCreate}>New user</Button>
          </Can>
        </div>
      </div>

      <DataGrid table={table} isLoading={query.isFetching} onRowClick={openEdit} />

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{total} users</span>
        <div className="flex items-center gap-3">
          <span>
            Page {ui.page + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} />
    </div>
  )
}
