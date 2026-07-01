# 0003 — Cross-slice reactions via `extraReducers` + listener middleware

**Status:** Accepted

## Context

When the session ends, several things must happen: the `ui` slice resets, the `auth` slice
clears, and the TanStack Query cache is dropped. Wiring this by importing slices into each other
(or an event bus) couples them and hides control flow.

## Decision

Split reactions by kind, using native Redux tools:

- **Pure state coupling → `extraReducers`.** `loggedOut`/`sessionExpired` are `createAction`s in
  `shared/store`; both the `ui` slice (shared) and `auth` slice (feature) react to them. Defining
  the actions in `shared` lets both react **without** shared importing a feature.
- **Impure side effects → `createListenerMiddleware`** in `app/store/listeners.ts` — the one place
  side effects live. It only calls `queryClient.clear()`.
- **Navigation is declarative** via `<ProtectedRoute>` reacting to auth status — no
  `router.navigate` in the listener, which avoids a store↔router import cycle.

## Consequences

- Every reaction is a dispatched action, visible in Redux DevTools; no event bus, no extra deps.
- Re-entrancy on the logout path is handled by `cancelActiveListeners()` + an idempotent
  `queryClient.clear()`.
- If reactions ever grow genuinely many-to-many, revisit — until then, YAGNI.
