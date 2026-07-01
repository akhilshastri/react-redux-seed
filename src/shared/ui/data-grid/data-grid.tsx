import { type Table, flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

import { cn } from '@/shared/lib'

interface DataGridProps<TData> {
  table: Table<TData>
  isLoading?: boolean
  onRowClick?: (row: TData) => void
  height?: number
  emptyMessage?: string
}

const sortGlyph: Record<string, string> = { asc: '↑', desc: '↓' }

/**
 * Reusable data grid: renders a (caller-configured) TanStack Table instance with
 * a sticky header and virtualized rows. The caller owns state wiring (server-driven
 * sorting/pagination/selection via `manual*` flags) so this stays presentational.
 */
export const DataGrid = <TData,>({
  table,
  isLoading,
  onRowClick,
  height = 560,
  emptyMessage = 'No results.',
}: DataGridProps<TData>) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual manages its own memoization; the compiler bails here by design (plan §4.5).
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 44,
    overscan: 8,
  })

  return (
    <div ref={containerRef} className="relative overflow-auto rounded-md border" style={{ height }}>
      <table className="grid w-full text-sm">
        <thead className="bg-background sticky top-0 z-10 grid">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full border-b">
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                return (
                  <th
                    key={header.id}
                    className="text-muted-foreground flex items-center px-3 py-2 text-left font-medium"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex cursor-pointer items-center gap-1 select-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortGlyph[header.column.getIsSorted() as string] ?? null}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        <tbody className="relative grid" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rows.length === 0 && !isLoading ? (
            <tr className="flex w-full">
              <td className="text-muted-foreground w-full p-6 text-center">{emptyMessage}</td>
            </tr>
          ) : null}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  'hover:bg-muted/50 absolute flex w-full border-b',
                  onRowClick && 'cursor-pointer',
                )}
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="flex items-center px-3 py-2"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>

      {isLoading ? (
        <div className="bg-background/50 text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center text-sm">
          Loading…
        </div>
      ) : null}
    </div>
  )
}
