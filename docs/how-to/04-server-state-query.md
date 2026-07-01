# 4. Server state (TanStack Query)

Fetched data belongs to TanStack Query, never Redux. Define a query-key factory and hooks.

```ts
// src/features/invoice/api/query-keys.ts
export const invoiceKeys = {
  all: ['invoice'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (search: string) => [...invoiceKeys.lists(), { search }] as const,
}
```

```ts
// src/features/invoice/api/use-invoices.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type InvoiceInput } from '@/domain'
import { httpClient } from '@/shared/api'
import { invoiceKeys } from './query-keys'

export const useInvoices = (search: string) =>
  useQuery({
    queryKey: invoiceKeys.list(search),
    queryFn: () => httpClient(`/invoice?search=${encodeURIComponent(search)}`),
  })

export const useCreateInvoice = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: InvoiceInput) => httpClient('/invoice', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: invoiceKeys.all }),
  })
}
```

- `httpClient` (`shared/api`) injects the access token and does single-flight 401 refresh.
- Mutations **invalidate** the list so the grid refetches.
- On logout the listener middleware calls `queryClient.clear()` — you don't wire that per feature.

Why not RTK Query? [ADR 0002](../adr/0002-tanstack-query-not-rtk-query).

Next: [Forms (RHF + Zod) →](./05-forms)
