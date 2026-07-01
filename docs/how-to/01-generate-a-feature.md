# 1. Generate a feature

```bash
npm run gen feature invoice
```

This creates a vertical slice under `src/features/invoice/`:

```
features/invoice/
  store/invoice-slice.ts     createSlice + selectors (client UI state)
  api/query-keys.ts          typed query-key factory
  api/use-invoice.ts         a list query (TanStack Query)
  components/invoice-page.tsx
  index.ts                   public API
```

…plus an MSW handler at `src/mocks/handlers/invoice.ts` that **auto-wires** via `import.meta.glob`.

## Wire the two printed next-steps

The generator can't safely edit the guarded data-router or the root reducer, so it prints them:

**1. Register the reducer** in `src/app/store/root-reducer.ts` (the key must equal the slice `name`):

```ts
export const rootReducer = combineReducers({
  // …existing slices
  invoice: invoiceSlice.reducer,
})
```

**2. Add a route** in `src/app/router/routes.tsx`, under the protected `DashboardLayout`:

```ts
{ path: paths.invoices, element: <InvoicePage /> }
```

Add `invoices: '/invoices'` to `src/app/router/paths.ts` and a `<NavLink>` in the dashboard layout.

Now `npm run dev` and visit `/invoices`. Next: [Domain & mock backend →](./02-domain-and-mock)
