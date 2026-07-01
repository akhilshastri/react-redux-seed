# AGENTS.md

Guidance for AI agents and new engineers working in this repo. Read
[`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md) and
[`docs/adr/`](docs/adr/) for the full rationale; this file is the fast, as-built summary.

## What this is

An enterprise React seed: Vite 8 + React 19 (React Compiler) + TS 6, **Redux Toolkit** (client
state), **TanStack Query** (server state), React Router v8, RHF + Zod, TanStack Table/Virtual
DataGrid, shadcn-style UI on Tailwind v4, **MSW** as the backend, installable PWA shell.
Package manager is **npm** (not bun).

## Rules that matter

1. **State split (golden rule):** server state → TanStack Query; client/UI state → Redux slices.
   Never mirror server data into Redux. RTK Query is intentionally not used (ADR 0002).
2. **Dependency direction:** `app → features → shared → domain` (see `CONTRIBUTING.md`). The typed
   Redux hooks from `app/store` are the one sanctioned upward import.
3. **Cross-slice reactions** (ADR 0003): pure coupling → `extraReducers` on the shared
   `loggedOut`/`sessionExpired` actions; impure side effects → the listener middleware in
   `app/store/listeners.ts` (only `queryClient.clear()`); logout navigation is **declarative** via
   `<ProtectedRoute>` — do **not** add `router.navigate` to the listener (import cycle).
4. **Auth security** (ADR 0004): access token in the `shared/api/access-token` holder (memory only,
   never persisted/DevTools); refresh is a simulated httpOnly cookie (MSW session store); http
   client does single-flight 401 refresh; RBAC is enforced at the API (`403`), client `<Can>` is UX.
5. **MSW** (ADR 0005) is dev/test only; handlers auto-wire via `import.meta.glob`; `resetDb()`
   isolates tests. In prod the Workbox SW owns `/` and `mockServiceWorker.js` is stripped from
   the build (ADR 0006).

## As-built notes (where reality differs from a naive read)

- **React Compiler** is on and confirmed (`_c(...)` in output). `useReactTable` and `useVirtualizer`
  are `react-hooks/incompatible-library` bails, suppressed with an explanatory `eslint-disable` —
  this is expected, not a smell (ADR 0007).
- **DataGrid** is server-driven with `autoResetPageIndex: false` — without it, new data dispatches
  back into Redux and loops ("Maximum update depth").
- **shadcn primitives** are hand-authored in `src/shared/ui` (no CLI). Dialog uses Radix.
- **Cold-start auth refresh** runs in an `AppProviders` effect (render is gated on MSW readiness) —
  never at module-eval, or it races the mock backend.
- The **import-boundary is a convention**, not a lint rule. The `feature` generator emits a slice +
  handler; reducer + route registration are **printed next-steps** (a guarded data-router can't be
  safely auto-edited).

## Before you commit

`npm run typecheck && npm run lint && npm test && npm run build` all green. Conventional Commits.
For UI changes, `npm run e2e`. Update the relevant ADR when you change a decision here.
