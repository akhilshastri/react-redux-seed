# 0001 — Redux Toolkit for client state

**Status:** Accepted

## Context

The app needs a predictable client-state container for auth/session, theme, and grid UI
(filters, selection) — state that is not server data.

## Decision

Use **Redux Toolkit**: one `configureStore`, feature/shared slices via `createSlice` (Immer +
DevTools built in), typed `useAppSelector`/`useAppDispatch` hooks, and memoized selectors
(`createSelector`) for derived data. Slices live with their owning layer (`shared/store/*`,
`features/*/store/*`) and are combined by `app/store/root-reducer.ts`.

## Consequences

- One store, one DevTools timeline; every state change is an inspectable action.
- The store singleton + typed hooks are the single sanctioned upward import (any layer may use
  them) — slice _logic_ still flows downward.
- The React Compiler memoizes component bodies but not selector return identity — memoize derived
  selectors with `createSelector` regardless.
- Persistence is a small localStorage whitelist (theme only), not `redux-persist`.
