# 6. The DataGrid

`@/shared/ui/data-grid` renders a **caller-configured** TanStack Table instance with a sticky
header and virtualized rows. The caller owns the state wiring (server-driven), so the grid stays
presentational.

```tsx
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { DataGrid } from '@/shared/ui/data-grid'

const columns: ColumnDef<Invoice>[] = [
  { accessorKey: 'number', header: 'Number', size: 200 },
  { accessorKey: 'amount', header: 'Amount', size: 160 },
  { accessorKey: 'status', header: 'Status', size: 140 },
]

// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table memoizes itself.
const table = useReactTable({
  data: query.data?.rows ?? [],
  columns,
  manualSorting: true,
  manualPagination: true,
  autoResetPageIndex: false, // ← REQUIRED for server-driven data (see below)
  rowCount: query.data?.total ?? 0,
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  // onSortingChange / onPaginationChange dispatch to your slice
})

return <DataGrid table={table} isLoading={query.isFetching} onRowClick={openEdit} />
```

## Gotchas

- **`autoResetPageIndex: false` is mandatory** in server-driven mode. Without it, each new page of
  data auto-resets the page index, which dispatches back into Redux and loops
  ("Maximum update depth").
- Wire sorting/pagination/selection to your slice via the `onXChange` handlers; derive the table's
  `state` from the slice. Keep `columns` module-level (stable identity).
- The React Compiler bails on `useReactTable`/`useVirtualizer` by design — suppress with the
  explanatory `eslint-disable` ([ADR 0007](../adr/0007-react-compiler)).

Look at `features/users/components/users-table.tsx` for the full server-driven example.

Next: [Auth & RBAC →](./07-auth-and-rbac)
