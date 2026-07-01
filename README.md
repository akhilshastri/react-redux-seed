# React Redux Seed

An enterprise-grade React SPA seed. Batteries included, opinions documented.

**Stack:** Vite 8 + React 19 (React Compiler) + TypeScript 6 · **Redux Toolkit** (client state) ·
**TanStack Query** (server state) · React Router v8 (data mode) · React Hook Form + Zod (forms) ·
TanStack Table + Virtual (DataGrid) · shadcn-style UI on Tailwind v4 · **MSW** as the mock backend ·
installable **PWA** shell · Vitest + Testing Library + Playwright · Plop scaffolder.

> Full build plan and rationale: [`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md).
> Architecture decisions: [`docs/adr/`](docs/adr/). Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

There is no real backend — **MSW is the API** (dev + tests). Sign in with a seed account:

| Email                | Password   | Role                                 |
| -------------------- | ---------- | ------------------------------------ |
| `admin@example.com`  | `password` | admin (full CRUD)                    |
| `viewer@example.com` | `password` | viewer (read-only; writes get a 403) |

## Scripts

| Script                            | What it does                                                   |
| --------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                     | Vite dev server (MSW browser worker is the backend)            |
| `npm run build`                   | Typecheck (`tsc -b`) then build to `dist/`                     |
| `npm run preview`                 | Preview the production build (Workbox SW; **no** mock backend) |
| `npm run lint`                    | ESLint (flat config)                                           |
| `npm run format`                  | Prettier write                                                 |
| `npm run typecheck`               | Typecheck without emit                                         |
| `npm test` / `npm run test:watch` | Vitest (jsdom + MSW `setupServer`)                             |
| `npm run e2e`                     | Playwright (against the dev server's MSW browser worker)       |
| `npm run gen`                     | Plop scaffolder (`npm run gen feature <name>`)                 |

## The golden rule of state

- **Server state → TanStack Query** — anything fetched from the API. Cached, refetched, invalidated.
- **Client state → Redux Toolkit** — auth/session, theme, sidebar, and grid UI (filters, selection).
- **Never mirror server data into Redux.** Components select narrow slices via memoized selectors.

RTK Query is deliberately **not** used — see [ADR 0002](docs/adr/0002-tanstack-query-not-rtk-query.md).

## Project structure (FSD-lite + composition root)

```
src/
  app/        composition root — store, providers, router, layouts, error, pwa
  domain/     framework-agnostic models + Zod schemas (User, Role, auth)
  features/   vertical slices (auth, users) — public API via index.ts only
  shared/     cross-cutting: api, store slices, ui, forms, hooks, config, lib
  mocks/      MSW — the "backend" (handlers auto-wired via import.meta.glob)
  test/       Vitest setup + a fresh-store-per-test render helper
```

**Dependency direction** (a convention, documented in [`CONTRIBUTING.md`](CONTRIBUTING.md)):
`app → features → shared → domain`. The Redux store singleton + typed hooks are the one
sanctioned upward import (any layer may use `useAppSelector`/`useAppDispatch`).

## Scaffolding a feature

```bash
npm run gen feature invoice
```

Generates a `createSlice` slice + selectors, query keys, a list query, a page, and an MSW handler.
The handler auto-wires (glob); registering the reducer + route are printed as next-steps.
`npm run gen domain <name>` and `npm run gen mock <name>` also exist.

## Auth & security (what a seed should get right)

- Access token lives **in memory only** — never `localStorage`, never a cookie, never Redux DevTools.
- The refresh token is modeled as an **httpOnly cookie** (simulated by MSW's persisted session store).
- Concurrent 401s share a **single-flight refresh**; the http client retries once.
- Client RBAC (`<Can>`, route guards) is **UX only** — the MSW handlers enforce `403` at the API.

See [ADR 0004](docs/adr/0004-auth-security-defaults.md).

## PWA (installable shell — no offline data)

`npm run build` emits a Workbox service worker that precaches the **app shell** only. There is no
real API, so a built `dist` needs one to show data. MSW is dev/test only; the Workbox SW owns prod.
See [ADR 0006](docs/adr/0006-installable-shell-pwa.md).

## Swap to a real backend

Nothing is coupled to MSW. Point the app at a real API with two env vars — no code change:

```bash
VITE_API_BASE_URL=https://api.example.com
VITE_API_MOCK=false
```

The http client already sends the Bearer token + refresh cookie, and API responses are validated
against their Zod schemas at the boundary. The endpoint contract is in
[how-to/08](docs/how-to/08-real-backend.md).

## Testing

- **Vitest** (jsdom) uses MSW's Node `setupServer`; each render gets a **fresh Redux store**.
- **Playwright** drives a real browser, so it uses MSW's **browser worker** via the dev server —
  never the shipped `dist`.
