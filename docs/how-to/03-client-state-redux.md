# 3. Client state (Redux Toolkit)

Client/UI state lives in a `createSlice` slice — **not** server data. For invoices, that's the grid
filters and selection.

```ts
// src/features/invoice/store/invoice-slice.ts
import { type PayloadAction, createSlice } from '@reduxjs/toolkit'

interface InvoiceUiState {
  search: string
  selectedIds: string[]
}
const initialState: InvoiceUiState = { search: '', selectedIds: [] }

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload
      state.selectedIds = []
    },
  },
  selectors: {
    selectInvoiceUi: (state) => state,
  },
})

export const { setSearch } = invoiceSlice.actions
export const { selectInvoiceUi } = invoiceSlice.selectors
```

Immer is built in (safe "mutating" syntax). The slice key in `root-reducer.ts` **must** equal the
slice `name` so colocated `selectors` resolve.

## Read and write from a component

Use the **typed hooks** (`useAppSelector` / `useAppDispatch`) — the one sanctioned import from
`app/store`:

```tsx
import { useAppDispatch, useAppSelector } from '@/app/store'
import { selectInvoiceUi, setSearch } from '../store/invoice-slice'

const ui = useAppSelector(selectInvoiceUi)
const dispatch = useAppDispatch()
dispatch(setSearch('acme'))
```

Memoize derived selectors with `createSelector` — the React Compiler does not stabilize selector
identity ([ADR 0001](../adr/0001-redux-toolkit-for-client-state)).

Next: [Server state (Query) →](./04-server-state-query)
