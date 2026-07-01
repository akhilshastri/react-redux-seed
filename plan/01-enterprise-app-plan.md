# Enterprise React App — Build Plan (Redux Toolkit)

**Status:** Complete · **Date:** 2026-06-30 (updated 2026-07-01) · **Redux Toolkit build — all phases (0–8) built & verified green.**

A greenfield, enterprise-grade React SPA built on **Node.js + Vite**, with **React Compiler**
enabled, **Redux Toolkit** (client state), TanStack Query (server state), TanStack Table + Virtual
(data grid), React Router v8 (library/data mode), and React Hook Form + Zod (forms).
It is an installable **PWA** (app-shell) and keeps cross-cutting reactions explicit via the
**Redux listener middleware** in one place (`app/listeners.ts`) — no event bus, no store↔store
imports. Includes a code **scaffolder** (Plop) for domain types, features, and mock handlers.

API is **REST, mocked entirely with MSW** (no real backend). Auth is **custom JWT**.
Single app, **no app CI/deployment** — `npm run build` just produces `dist/`. (The one exception,
added post-build: a docs-only workflow publishes the **how-to documentation site** to GitHub
Pages — see Phase 8.) **No Storybook.**

> **Original build note (honest history):** this seed was first built and verified green on
> **Zustand** (7 phases + a docs Phase 8, all live-verified in-browser). This revision
> re-architects the **client-state layer onto Redux Toolkit**. Everything that does _not_ touch
> client state is **unchanged and already proven**: TanStack Query (server state), the custom-JWT
> auth security model, MSW-as-backend, the DataGrid, the PWA shell, the scaffolder, the testing
> harness, the docs site, and the React Compiler toolchain. The Zustand build history lives in git
> (prior revision of this file).
>
> **Build outcome (2026-07-01):** the Redux Toolkit version is now **built and verified green
> across all phases (0–8)** — one commit per phase (`feat: … (Phase N)`), each passing
> typecheck + lint + build, with 6 Vitest + 2 Playwright tests green and the key flows verified
> live in-browser (auth for both roles, the server-driven users grid + CRUD + API 403, theme
> persistence, and the installable PWA shell). Notable real deviations from this plan's sketch are
> recorded per phase below and in `AGENTS.md`: the compiler wiring uses `@rolldown/plugin-babel`'s
> default export; logout navigation is declarative via `<ProtectedRoute>` (no router in the
> listener); the DataGrid needs `autoResetPageIndex: false` to avoid a server-driven reset loop;
> and the httpOnly refresh cookie is simulated by MSW's persisted session store. Phase 8's docs
> site builds + serves locally; **actual GitHub Pages publishing needs a git remote** (none is
> configured on this local repo).

---

## 1. Decisions (confirmed)

| Area                       | Choice                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime / package manager  | **Node.js + npm** (no bun)                                                                                                                                  |
| Compiler                   | **React Compiler 1.0** enabled via Babel (see §4.7)                                                                                                         |
| UI layer                   | **shadcn/ui** — Tailwind CSS v4 + Radix primitives, components copied into `src/shared/ui`                                                                  |
| Router mode                | **React Router v8 — Library / Data mode** (`createBrowserRouter`), SPA, no SSR                                                                              |
| Data fetching              | **TanStack Query owns server state**; React Router used for navigation + guards                                                                             |
| **Client state**           | **Redux Toolkit** — one store, feature/shared **slices** (`createSlice`), typed hooks                                                                       |
| **Server state tool**      | **TanStack Query kept; RTK Query deliberately _not_ adopted** (rationale §10, F21)                                                                          |
| **Cross-slice reactions**  | **Redux `createListenerMiddleware`** in `app/listeners.ts` (+ `extraReducers` for pure state coupling); no event bus, no store↔store imports (§4.9)         |
| **Persistence**            | **Tiny custom localStorage listener** (whitelist: theme + non-sensitive session); **not** `redux-persist` (§4.1)                                            |
| PWA                        | **vite-plugin-pwa** (Workbox `generateSW`) — installable + app-shell precache; **no offline data** (data needs a real API) (§4.8)                           |
| Enterprise scope (day one) | Auth (custom JWT) + protected routes · RBAC/permissions · Theming/dark mode (no i18n)                                                                       |
| API                        | **REST, MSW-mocked only** — no real backend; MSW serves dev _and_ tests                                                                                     |
| Validation                 | **Zod v4**, schemas live in `domain/` and are reused by RHF + API parsing                                                                                   |
| Scaffolder                 | **Plop** generators (`npm run gen`)                                                                                                                         |
| CI / Deploy                | **None for the app** — build produces `dist/` only. **Exception:** a docs-only GitHub Actions workflow publishes the how-to site to GitHub Pages (Phase 8). |
| Storybook                  | **Excluded.**                                                                                                                                               |

### Golden rule of state

- **Server state → TanStack Query** (anything fetched via the REST/MSW layer; cached, refetched, invalidated).
- **Client state → Redux Toolkit slices** (auth/session, theme, sidebar, modals, table filter UI, wizard steps).
- Never mirror server data into Redux. Components select **narrow slices** via memoized selectors
  (`createSelector`); never select the whole store.

### Why Redux but still TanStack Query (not RTK Query)

Redux Toolkit ships **RTK Query**, which is the idiomatic Redux server-state tool. We **kept
TanStack Query** anyway: it is best-in-class for server cache, it was already proven against MSW in
the prior build, and keeping it preserves the clean **server (Query) vs client (Redux) split** —
each tool does the one job it is best at. RTK Query was considered and **not** chosen (§10, F21).
Redux is therefore **client-state-only** here; server data never enters the Redux store.

---

## 2. Dependencies (Redux additions verified from npm on 2026-06-30; rest carried from 2026-06-28)

### Runtime

| Package                        | Version    | Purpose                                                                                                    |
| ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------- |
| react / react-dom              | 19.2.7     | UI runtime (React 19 → React Compiler needs no runtime package)                                            |
| react-router                   | 8.0.1      | Routing (data mode) — the standalone `react-router` package; `react-router-dom` is legacy                  |
| **@reduxjs/toolkit**           | **2.12.0** | **Client state — `configureStore`, `createSlice`, `createListenerMiddleware`; bundles Immer + Reselect**   |
| **react-redux**                | **9.3.0**  | **React bindings — `<Provider>`, `useSelector`/`useDispatch` (typed via `.withTypes`); supports React 19** |
| @tanstack/react-query          | 5.101.2    | **Server state (kept)**                                                                                    |
| @tanstack/react-query-devtools | 5.101.2    | Query devtools (dev only)                                                                                  |
| @tanstack/react-table          | 8.21.3     | Headless data grid ("TanStack Grid")                                                                       |
| @tanstack/react-virtual        | 3.14.4     | Row virtualization for the grid                                                                            |
| react-hook-form                | 7.80.0     | Forms                                                                                                      |
| @hookform/resolvers            | 5.4.0      | RHF ↔ Zod bridge                                                                                           |
| zod                            | 4.4.3      | Schema validation                                                                                          |
| react-error-boundary           | latest     | Declarative error boundaries                                                                               |
| clsx + tailwind-merge          | latest     | `cn()` class composition                                                                                   |
| class-variance-authority       | latest     | Variant styling (shadcn)                                                                                   |
| lucide-react                   | latest     | Icon set (shadcn default)                                                                                  |

> **Removed:** `zustand` (replaced by Redux Toolkit).
> **Not installed (bundled in RTK):** `immer` (powers `createSlice`'s mutating syntax) and
> `reselect` (`createSelector`) ship inside `@reduxjs/toolkit` — do **not** add them separately.
> **Not installed:** `redux-persist` — persistence is a ~20-line custom localStorage listener
> (§4.1), deliberately, to persist only a whitelist and avoid redux-persist's rehydration
> machinery. **Redux DevTools** needs no package (browser extension; `configureStore` wires it,
> dev-only).

### Build / compiler / styling

| Package                     | Version | Purpose                                                                |
| --------------------------- | ------- | ---------------------------------------------------------------------- |
| vite                        | 8.1.0   | Build/dev server (Rolldown-based)                                      |
| @vitejs/plugin-react        | 6.0.3   | React + Fast Refresh (oxc/Rust — **no longer runs Babel internally**)  |
| @rolldown/plugin-babel      | 0.2.3   | Runs Babel passes (React Compiler) since plugin-react v6 dropped Babel |
| babel-plugin-react-compiler | 1.0.0   | **React Compiler**                                                     |
| @babel/core                 | 8.0.1   | Peer dep of the Babel plugin                                           |
| typescript                  | 6.0.3   | Types (strict)                                                         |
| tailwindcss                 | v4      | Styling (via `@tailwindcss/vite`)                                      |
| vite-tsconfig-paths         | latest  | Path-alias resolution                                                  |

> **Not installed:** `react-compiler-runtime` (only needed for React 17/18 — we are on React 19,
> which ships `react/compiler-runtime` built in).

### PWA

| Package                    | Version | Purpose                                           |
| -------------------------- | ------- | ------------------------------------------------- |
| vite-plugin-pwa            | 1.3.0   | Service worker + web manifest (Workbox)           |
| workbox-window             | 7.4.1   | Client-side SW registration + update prompt       |
| @vite-pwa/assets-generator | 1.0.2   | (dev) generate the icon set from one source image |

> **Cross-slice reactions:** **no dependency** — the Redux **listener middleware**
> (`createListenerMiddleware`) ships inside `@reduxjs/toolkit`. No event-bus library (§4.9).

### Quality / test

| Package                                | Version                       | Purpose                                      |
| -------------------------------------- | ----------------------------- | -------------------------------------------- |
| eslint                                 | 10.6.0                        | Lint (flat config only)                      |
| typescript-eslint                      | 8.62.0                        | TS lint rules (meta package)                 |
| eslint-plugin-react-hooks              | latest (`recommended-latest`) | React hooks **+ React Compiler lint rules**  |
| eslint-plugin-jsx-a11y / perfectionist | latest                        | a11y + import ordering                       |
| prettier + prettier-plugin-tailwindcss | 3.9.1                         | Formatting                                   |
| vitest                                 | 4.1.9                         | Unit/integration runner                      |
| @testing-library/react                 | 16.3.2                        | Component testing                            |
| @testing-library/jest-dom              | 6.9.1                         | DOM matchers                                 |
| msw                                    | 2.14.6                        | **The API** — mocks REST for dev _and_ tests |
| @playwright/test                       | 1.61.1                        | E2E                                          |
| husky + lint-staged + commitlint       | latest                        | Pre-commit gates + conventional commits      |

> **"TanStack Grid" clarification:** there is no product by that name. The TanStack data
> grid is **TanStack Table v8** (headless) + **TanStack Virtual v3** (virtualization),
> wrapped here as a single reusable `DataGrid` component.

### Docs site (added post-build, 2026-06-30)

| Package   | Version | Purpose                                                                                  |
| --------- | ------- | ---------------------------------------------------------------------------------------- |
| vitepress | 1.6.4   | Static-site generator for the `docs/how-to/` series, published to GitHub Pages (Phase 8) |

---

## 3. Proposed project structure

Feature-sliced (FSD-lite) + a composition root. Vertical feature slices own their UI,
state, API, and types; cross-cutting building blocks live in `shared/`; framework-agnostic
models live in `domain/`. **The single Redux store, typed hooks, and listeners are assembled in
the composition root (`app/`)**; individual `*-slice.ts` files live with the feature/shared layer
that owns them and flow _downward_ into the store.

```
react-redux-seed/
├── public/
├── src/
│   ├── app/                          # Composition root (wiring, not features)
│   │   ├── store/
│   │   │   ├── store.ts              # configureStore: combines reducers + listener middleware + DevTools
│   │   │   ├── hooks.ts              # typed useAppDispatch / useAppSelector / useAppStore
│   │   │   ├── listeners.ts          # createListenerMiddleware + startAppListening (cross-slice side effects)
│   │   │   ├── root-reducer.ts       # combineReducers(all slice reducers)
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   ├── app-providers.tsx     # composes all providers in correct order
│   │   │   ├── store-provider.tsx    # react-redux <Provider store={store}>  (NEW — Redux needs a provider)
│   │   │   ├── query-provider.tsx    # QueryClientProvider + devtools
│   │   │   ├── router-provider.tsx   # RouterProvider
│   │   │   ├── theme-provider.tsx    # applies theme class from the theme slice
│   │   │   └── index.ts
│   │   ├── router/
│   │   │   ├── routes.tsx            # route tree (lazy route modules)
│   │   │   ├── guards.tsx            # <ProtectedRoute>, <RequireRole>
│   │   │   ├── paths.ts             # typed path constants + builders
│   │   │   └── index.ts
│   │   ├── layouts/                  # AppShell, AuthLayout, DashboardLayout
│   │   ├── error/                    # root + per-route error boundaries
│   │   ├── pwa/                      # registerSW + update-prompt toast + offline banner
│   │   └── app.tsx
│   │
│   ├── domain/                       # Framework-agnostic models + zod schemas
│   │   ├── auth/                     # auth.types.ts, auth.schema.ts (JWT/session), index.ts
│   │   ├── user/                     # user.types.ts, user.schema.ts, index.ts
│   │   ├── rbac/                     # role + permission model
│   │   └── index.ts
│   │
│   ├── features/                     # Vertical slices (public API via index.ts only)
│   │   ├── auth/
│   │   │   ├── api/                  # useLogin, useRefresh, useSession (TanStack Query)
│   │   │   ├── components/           # LoginForm (RHF + zod)
│   │   │   ├── store/                # auth-slice.ts (createSlice): status + non-sensitive user/roles
│   │   │   │                         #   + auth-selectors.ts  (access token is NOT here — §4.6)
│   │   │   ├── hooks/                # useAuth, usePermissions (wrap typed selectors)
│   │   │   └── index.ts
│   │   └── users/                    # example CRUD slice (DataGrid + forms)
│   │       ├── api/                  # query keys + query/mutation hooks (TanStack Query)
│   │       ├── components/           # UsersTable, UserForm, UserDialog
│   │       ├── store/                # users-slice.ts — client-only UI state (filters, selection)
│   │       ├── hooks/
│   │       ├── types/
│   │       └── index.ts
│   │
│   ├── shared/                       # Cross-cutting, reusable building blocks
│   │   ├── api/
│   │   │   ├── http-client.ts        # typed fetch wrapper + JWT injection + 401 single-flight refresh
│   │   │   ├── access-token.ts       # in-memory access-token holder (get/set) — NOT in the store (§4.6)
│   │   │   ├── query-client.ts       # QueryClient + sane defaults + global error
│   │   │   ├── query-keys.ts         # key-factory helper
│   │   │   └── api-error.ts          # normalized ApiError
│   │   ├── store/
│   │   │   ├── ui-slice.ts           # sidebar, modals, global UI flags, offline + update toast
│   │   │   ├── theme-slice.ts        # light/dark/system (persisted)
│   │   │   ├── persistence.ts        # loadPersistedState() + persistence listener (whitelist → localStorage)
│   │   │   └── index.ts
│   │   ├── ui/                       # shadcn components live here
│   │   │   ├── button.tsx, input.tsx, dialog.tsx, ...
│   │   │   └── data-grid/            # DataGrid (Table + Virtual), useDataGrid, columns helpers
│   │   ├── forms/
│   │   │   ├── use-zod-form.ts       # RHF + zodResolver wrapper (typed)
│   │   │   ├── form-field.tsx        # Controller + shadcn field + error display
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── env.ts                # zod-parsed import.meta.env (typed, fail-fast)
│   │   │   ├── constants.ts
│   │   │   └── feature-flags.ts
│   │   ├── lib/                      # cn(), formatters, pure utils
│   │   ├── hooks/                    # generic hooks (useDebounce, useMediaQuery)
│   │   └── types/                    # global utility types
│   │
│   ├── mocks/                        # MSW — this is the "backend"
│   │   ├── browser.ts                # setupWorker (dev)
│   │   ├── server.ts                 # setupServer (tests)
│   │   ├── db.ts                     # in-memory seed data / fixtures
│   │   └── handlers/                 # REST handlers per resource (auth, users, ...)
│   │
│   ├── test/
│   │   ├── setup.ts                  # jsdom + jest-dom + MSW server lifecycle
│   │   └── test-utils.tsx            # render() wrapped with all providers (incl. a fresh Redux store)
│   │
│   ├── styles/
│   │   ├── globals.css               # tailwind v4 @import + design tokens
│   │   └── themes.css                # light/dark CSS variables
│   │
│   ├── main.tsx                      # boots MSW worker before render (dev)
│   └── vite-env.d.ts
│
├── e2e/                              # Playwright specs
├── plop-templates/                  # scaffolder .hbs templates (slice/feature/domain/query/component)
├── scripts/
│   └── plopfile.ts                  # generator definitions
├── public/
│   ├── mockServiceWorker.js          # generated by `msw init` (dev/test mock backend)
│   └── icons/                        # PWA icons (generated by @vite-pwa/assets-generator)
│   # web manifest is emitted by vite-plugin-pwa at build time
├── .husky/
├── .env.example
├── components.json                  # shadcn config
├── eslint.config.ts                 # flat config
├── prettier.config.mjs
├── tsconfig.json + tsconfig.app.json + tsconfig.node.json
├── vite.config.ts                   # React Compiler + PWA wiring (see §4.7, §4.8)
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

### Path aliases

`@/*` → `src/*`. Optional finer aliases: `@app`, `@features`, `@shared`, `@domain`.
Wired via `tsconfig` paths + `vite-tsconfig-paths`.

### Dependency direction (enforced by lint import rules)

`app` → `features` → `shared` → `domain`.
`domain` depends on nothing. Features never import other features' internals (only their
public `index.ts`). `shared` never imports from `features`.

**Redux-specific structure rules:**

- **Slice _logic_ flows downward.** `*-slice.ts` files (reducers + action creators + colocated
  selectors) are produced by `createSlice` and **import nothing from `app/`**. They live with their
  owner: cross-cutting ones in `shared/store/` (`ui-slice`, `theme-slice`), feature ones in
  `features/<f>/store/`. `app/store/root-reducer.ts` imports them all (app → down, allowed).
- **The store singleton and typed hooks are the one sanctioned upward import.** Components in any
  layer may import `useAppSelector` / `useAppDispatch` (and the `RootState` / `AppDispatch` _types_)
  from `app/store`. This is the single allowed `→ app` edge, because the Redux store is the app's
  **one runtime singleton** — the analog of how Zustand stores were globally importable. The lint
  import-boundary rule gets one explicit allow-entry for `app/store/hooks` and `app/store` types;
  everything else still obeys the direction. (Decision + rationale in §10, F22.)
- **Selectors are colocated with their slice and `RootState`-typed.** A slice exports its own
  selectors (`selectTheme`, `selectAuthStatus`); features prefer wrapping them in a hook
  (`useAuth`, `usePermissions`) so components don't reach into `state.auth` shape directly.

**Where a type belongs (`domain/` vs a feature's `types/`):** a concept that is shared,
persisted, or part of the API contract → `domain/` (e.g. `User`, `Role`). A type that only
describes a feature's local view/UI state (column config, filter form shape) → that feature's
`types/`. Rule of thumb: if a second feature could need it, it's `domain/`.

---

## 4. Default integrations (what "wired by default" means)

### 4.1 Redux Toolkit

- **`configureStore` (`app/store/store.ts`)** combines the root reducer and:
  - **DevTools** auto-enabled in dev, auto-disabled in production (no package, no flag needed).
  - **Default middleware** — thunk + dev-only `immutableStateInvariant` + `serializableStateInvariant`
    checks (catch accidental mutation / non-serializable values early).
  - **Listener middleware** prepended: `getDefaultMiddleware().prepend(listenerMiddleware.middleware)`
    (§4.9).
  - **`preloadedState`** seeded from `loadPersistedState()` for instant theme/session hydration.
- **`createSlice` per concern** — Immer is built in, so reducers use the "mutating" syntax safely;
  action creators + action types are generated; everything is typed from `initialState`. This
  replaces the old Zustand `create-store.ts` factory entirely — there is **one** store, configured
  once, so no per-store factory exists.
- **Typed hooks (`app/store/hooks.ts`):** `useAppDispatch = useDispatch.withTypes<AppDispatch>()`,
  `useAppSelector = useSelector.withTypes<RootState>()`, `useAppStore = useStore.withTypes<...>()`.
  Components use these, never the raw react-redux hooks.
- **Selectors prevent over-render.** Narrow `useAppSelector` calls + **`createSelector`** (Reselect,
  bundled in RTK) for any **derived/computed** selection so the reference is memoized. This is the
  Redux analog of Zustand's `useShallow`, and it is **complementary to the React Compiler** — the
  compiler memoizes component bodies but **cannot** stabilize a selector's return identity; that is
  Reselect's job (§4.7 note).
- **Async:** `createAsyncThunk` is available, but **server-state async stays in TanStack Query**
  (login/refresh/me, users CRUD). Thunks are reserved for the rare _client-side_ async flow. Auth
  slices hold only session status/user — not fetching.
- **Default slices:** `theme-slice` (mode + persisted), `ui-slice` (sidebar/modals/offline/update
  toast), and the feature-scoped `auth-slice` (status + non-sensitive user/roles; **token not
  here** — §4.6).
- **Persistence (custom, deliberate):** `shared/store/persistence.ts` exposes `loadPersistedState()`
  (reads a **whitelist** of keys — `theme`, non-sensitive session — from `localStorage` into
  `preloadedState`) and a **persistence listener** (registered on the listener middleware, or a
  throttled `store.subscribe`) that writes only those whitelisted slices back on change. We do
  **not** use `redux-persist`: a whitelist write is ~20 lines, avoids rehydration/`PersistGate`
  machinery, and guarantees the access token can never be persisted (it isn't in the store at all).

### 4.2 TanStack Query _(kept — unchanged)_

- **`query-client.ts`** central config: `staleTime` (e.g. 60s), `gcTime` (5m),
  `retry` (smart — skip 4xx), `refetchOnWindowFocus: false` (enterprise default).
- **Global error handling** via `QueryCache`/`MutationCache` `onError` → toast + 401 →
  auth refresh/logout.
- **Query-key factories** per feature (`userKeys.all / lists / list(filters) / detail(id)`).
- **Devtools** mounted in dev only.
- Optional: thin route `loader`s call `queryClient.ensureQueryData` for prefetch; components
  still `useQuery`.
- **Boundary with Redux:** Query owns the server cache; Redux never stores fetched rows. On logout,
  the listener middleware calls `queryClient.clear()` (§4.9).

### 4.3 React Router (v8, data mode) _(unchanged)_

- **`createBrowserRouter`** with a typed route tree; **lazy route modules** via `route.lazy`
  for code-splitting.
- **Layouts as nested routes** (AuthLayout vs DashboardLayout/AppShell).
- **Guards:** `<ProtectedRoute>` reads the auth slice (via `useAuth`); `<RequireRole permission=...>`
  reads RBAC.
- **Error boundaries:** root boundary + per-route `errorElement`.
- **`paths.ts`** typed path constants + builders (no stringly-typed navigation).

### 4.4 React Hook Form + Zod _(unchanged)_

- **`use-zod-form.ts`** wraps `useForm` + `zodResolver`, inferring types from the domain schema.
- **`form-field.tsx`** = RHF `Controller` + shadcn field primitives + inline error display.
- Schemas imported from `domain/` so the same Zod schema validates the form and (optionally)
  the API response.

### 4.5 DataGrid (TanStack Table + Virtual) _(unchanged; client UI state in Redux)_

- Reusable `shared/ui/data-grid` wrapping Table v8 + Virtual v3.
- Features: sorting, global + column filters, pagination (client & server via `manual*`
  flags), column visibility, row selection, sticky header, virtualized rows.
- Server-driven mode integrates with TanStack Query (filters/sort/page → query key → MSW).
- The grid's **client-side UI state** that must outlive the component or be shared (e.g. the
  `users` filter/selection) lives in that feature's slice (`users-slice`); transient table state can
  stay in the table instance.

### 4.6 Auth (custom JWT) + RBAC + Theming

> Security note: a seed encodes the defaults others copy to production, so the defaults here
> are the _safe_ ones, not the convenient ones.

- **Token storage (hardened, Redux-aware):** the **access token lives in memory only**, in a small
  **`shared/api/access-token.ts` holder** (a module variable with `get/set`) — **not in the Redux
  store**. Keeping it out of the store means it is (a) never written to `localStorage` by the
  persistence whitelist and (b) never captured in Redux DevTools' action/state log. The **refresh
  token is modeled as an httpOnly, SameSite cookie** that the MSW `/auth/*` handlers `Set-Cookie`
  and the browser sends automatically; JS never reads it. On a cold load the app calls
  `/auth/refresh` (cookie sent automatically) to re-hydrate the access token holder. The **persisted
  auth slice** holds only **non-sensitive** session info (user id, roles, status) for instant UI,
  never tokens.
- **`http-client`** reads the in-memory access token from the holder. On **401** it runs a
  **single-flight refresh**: one shared in-flight refresh promise that all concurrent 401s await,
  then they retry once with the new token; if refresh fails it dispatches `auth/sessionExpired`
  once and clears the holder. (No refresh storm; the classic concurrent-401 bug, handled
  explicitly.)
- MSW handlers implement `/auth/login`, `/auth/refresh`, `/auth/me`. `LoginForm` is RHF + Zod.
  Login/refresh are **TanStack Query mutations**; on success they set the token holder and dispatch
  `auth/loggedIn` (session info) to the slice.
- **RBAC (two layers, both real):**
  - _Client (UX only):_ `domain/rbac` defines `Role`/`Permission` + matrix; `usePermissions`
    hook (reads the auth slice via a typed selector); `<Can permission=...>` component;
    `<RequireRole>` route guard — these only hide UI and are **not security** (the code is already
    in the bundle).
  - _Server (enforcement):_ the **MSW handlers enforce permissions and return `403`** on
    unauthorized calls, so the seed demonstrates that authorization is enforced at the API,
    not the button. Documented loudly in the README/ADR.
- **Theming:** `theme-slice` (light/dark/system, persisted) → `theme-provider` reads it with
  `useAppSelector` and toggles `class="dark"` on `<html>`; tokens as CSS variables (shadcn
  convention).

### 4.7 React Compiler (the important piece)

**Why it changed:** `@vitejs/plugin-react` v6 dropped its internal Babel (JSX + Fast Refresh
now run in Rust/oxc). The old `react({ babel: { plugins: [...] } })` form **does not work on
Vite 8** — the compiler must run through a separate `@rolldown/plugin-babel` pass.

**Install (dev):** `babel-plugin-react-compiler@1.0.0`, `@rolldown/plugin-babel@0.2.3`,
`@babel/core@8.0.1`. No runtime package (React 19).

**Config shape (`vite.config.ts`):**

```ts
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { babel } from '@rolldown/plugin-babel'

plugins: [
  react(),
  babel({ include: /\.[jt]sx?$/, babelConfig: reactCompilerPreset() }),
  tailwindcss(),
]
// build.sourcemap = true  → keep compiled output debuggable
```

**Ordering — settled:** **`react()` first, then the babel/compiler pass** (the official react.dev
order, not the babel-first blog order). Verified on the prior build: the transformed output imports
`react/compiler-runtime` and components open with `_c(n)` (memo cache) while Fast Refresh
(`createHotContext`) still works.

**Fallback — the compiler is optional, the app is not.** This is a five-deep bleeding-edge
toolchain (Vite 8 / plugin-react v6 / `@rolldown/plugin-babel@0.2.3` / `babel-plugin-react-compiler@1.0.0`
/ `@babel/core@8.0.1`). The compiler is an _optimization_, not a feature. **Explicit escape hatch:**
if ordering won't link or HMR is unusable, **proceed compiler-OFF** (drop the `babel()` plugin; the
app is identical, just unmemoized) and revisit later.

**Redux + React Compiler note:** the two are complementary, not redundant. react-redux's
`useSelector` already controls re-renders by comparing the selected value; the compiler memoizes
component bodies. **Neither stabilizes a selector's _return identity_** — a selector that builds a
new object/array each call still re-renders. That is **Reselect's** job (`createSelector`, §4.1),
so keep memoizing derived selectors regardless of the compiler. (This parallels the DataGrid bail in
§4.5 / Phase 3: some hooks-heavy library code the compiler leaves alone, by design.)

**ESLint:** the compiler's lint rules ship in **`eslint-plugin-react-hooks`**
(`recommended-latest`) — enabled in the flat config so violations surface during development.

### 4.8 PWA (installable app-shell — no offline data) _(unchanged; `ui-store`→`ui-slice`)_

Implemented with **`vite-plugin-pwa`** (Workbox `generateSW`). **Scope:** installable + app-shell
precache only. The app **does not claim offline _data_** — there is no real backend, so a built
`dist` needs a real API to show anything.

- **Manifest** generated by the plugin (name, theme/background colors, icons, `display:
standalone`); icons produced from one source image via **`@vite-pwa/assets-generator`**.
- **SW strategy:** `generateSW` — precache the built **app shell + static assets** only.
  **API responses are NOT service-worker cached** — TanStack Query owns server-state caching.
- **Update flow:** `workbox-window` `registerSW` (`registerType: 'prompt'`) detects a new SW →
  **dispatches `ui/showUpdateToast()`** to the Redux store directly (no event bus) → "Refresh to
  update" → `updateSW()`. No silent auto-reload.
- **Online/offline:** an `online/offline` listener **dispatches `ui/setOffline(bool)`** so the UI
  can show an offline banner. (Banner only — it does not make data calls succeed offline.)

**MSW ↔ PWA service-worker split (clean, no conflict):** only **one** SW controls a scope.

- **Dev:** PWA SW off (`devOptions.enabled: false`, default) → MSW's SW serves mocked data. ✓
- **Vitest:** MSW `setupServer` (Node) — no SW. ✓ **Playwright:** MSW **browser** worker. ✓
- **Production `dist`:** the **Workbox SW** runs (shell precache); **MSW is dev/test only.**
  `public/mockServiceWorker.js` is excluded from the build so nothing registers a second SW.

### 4.9 Cross-slice reactions — Redux listener middleware (no event bus)

**Problem:** when auth logs out, the Query cache must clear, the `ui` slice must reset, and the
router must navigate to login. Wiring that by having slices import one another or by scattering
subscriptions in components would couple them and hide side-effects.

**Pattern (chosen):** Redux gives us **one store**, so most coupling is just _cross-slice_ and
splits cleanly into two idiomatic mechanisms:

1. **Pure state reactions → `extraReducers`.** A slice declares how it reacts to _another_ slice's
   action. e.g. the `ui` slice resets itself when auth logs out — no side effects, just state:
   ```ts
   // shared/store/ui-slice.ts
   extraReducers: (builder) => {
     builder.addMatcher(isAnyOf(loggedOut, sessionExpired), () => initialUiState)
   }
   ```
2. **Impure side effects → `createListenerMiddleware`** in **`app/store/listeners.ts`**, configured
   once in `configureStore`. It lives in `app/` on purpose — the composition root may import both
   features and shared, so it can reference `queryClient`, `router`, and any slice's actions without
   violating §3.
   ```ts
   // app/store/listeners.ts  (sketch)
   export const listenerMiddleware = createListenerMiddleware()
   const startAppListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()

   startAppListening({
     matcher: isAnyOf(loggedOut, sessionExpired),
     effect: async (_action, api) => {
       if (api.getState().auth.tearingDown) return // re-entrancy guard
       api.dispatch(beginTeardown())
       queryClient.clear()
       router.navigate(paths.login)
       // ui reset is handled purely by extraReducers above
     },
   })
   ```

**Why this, not an event bus:** at this scale (a few slices, ~2 reactions) `extraReducers` +
listener middleware is the _native_ Redux toolset — type-checked, visible in DevTools (every
reaction is an action), and needs no extra dependency. A typed bus would be hidden control flow for
no benefit. (If reactions ever grow genuinely many-to-many, revisit — YAGNI until then.)

**Discipline:**

- **All cross-slice _side effects_ live in `app/store/listeners.ts`** — never slice-to-slice imports
  of thunks, never ad-hoc `store.subscribe` scattered in components. Pure cross-slice state coupling
  lives in the reacting slice's `extraReducers`.
- Listeners are **app-lifetime singletons** (registered once in `configureStore`), so there is no
  unsubscribe-leak surface.
- Teardown reactions are **idempotent + re-entrancy-guarded** (a `tearingDown` flag in the auth
  slice) so a `sessionExpired`-during-logout can't loop on the security-critical path.
- The PWA update prompt and offline state are plain `ui` slice **dispatches** from `app/pwa/` — no
  indirection (§4.8).

---

## 5. Scaffolder (Plop)

Generators run via Node (`npm run gen <type>`), reading templates from `plop-templates/`.

**Core generators only** (fewer templates to rot on each stack bump):

| Generator | Produces                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`  | A domain entity: `*.types.ts` + `*.schema.ts` (Zod) + `index.ts`.                                                                                       |
| `feature` | Full vertical slice: `api/ components/ store/ hooks/ types/ index.ts`, pre-wired. The `store/` holds a `createSlice` **`<name>-slice.ts` + selectors**. |
| `mock`    | An MSW handler file + db fixture for a resource.                                                                                                        |

Deliberately **not** generators: `component` and `route` (the shadcn CLI and the router
already own those), and standalone `slice`/`query` (folded into `feature`). Add them later
only if a real need appears.

**No string-injection codegen.** Generators create files; they do **not** splice snippets into
central files. Wiring is **convention-based discovery** where it can be: MSW handlers and routes are
collected with `import.meta.glob`, so a new handler file is picked up with zero edits.

**Slice registration (one honest manual step).** A generated feature slice must be added to
`app/store/root-reducer.ts`. Two options, in order of preference:

- **Printed next-step (default):** the `feature` generator **prints** the one-line reducer
  registration to paste into `root-reducer.ts` — same approach the prior build used for a generated
  feature's _route_. Explicit, greppable, no magic.
- **Glob auto-registration (optional):** `root-reducer.ts` may `import.meta.glob('../../features/**/*-slice.ts', { eager: true })` and assemble `combineReducers` from each slice's exported
  `{ name, reducer }`. This makes slices zero-edit like handlers, at the cost of a little indirection
  in how `RootState`'s keys are derived. Pick per taste; the default is the printed next-step.

---

## 6. Tooling & quality gates

- **TypeScript:** `strict` + `noUncheckedIndexedAccess`; project references (`app` vs `node`).
- **ESLint flat config:** typescript-eslint, **react-hooks (incl. React Compiler rules)**,
  jsx-a11y, perfectionist (import order), plus an **import-boundary rule** enforcing the
  dependency direction in §3 — with the single documented allow-entry for `app/store/hooks` +
  `app/store` types (§3). No Redux-specific lint plugin is needed; RTK's runtime
  immutability/serializability checks (dev middleware) cover what a linter cannot.
- **Prettier** + `prettier-plugin-tailwindcss`.
- **Husky + lint-staged** pre-commit (lint + format + typecheck on staged), **commitlint**
  (Conventional Commits).
- **Testing:** Vitest + RTL + jsdom + MSW (unit/integration); Playwright (E2E). `test-utils`
  renders with all providers **including a freshly-created Redux store per test** (never the app
  singleton — see Phase 5); MSW is the shared mock backend.
- **Env:** `shared/config/env.ts` Zod-parses `import.meta.env` and fails fast on misconfig;
  `.env.example` documents required vars.
- **No CI pipeline / deploy step for the app** — quality gates run locally via the scripts above.
  (The how-to docs site adds one docs-only GitHub Actions → Pages workflow; see Phase 8.)

### npm scripts (planned)

`dev` · `build` (→ `dist/`) · `preview` · `lint` · `format` · `typecheck` ·
`test` · `test:watch` · `e2e` · `gen` · `prepare` (husky) · `msw:init` ·
**`docs:dev` · `docs:build` · `docs:preview`** (Phase 8 — VitePress docs site).

---

## 7. Phased task plan

> Each phase is independently reviewable. Acceptance criteria are the "done" bar.
> **Re-plan note:** the non-state-management work (router, MSW backend, DataGrid, scaffolder,
> testing harness, PWA, docs) is **Redux-agnostic and already proven on the Zustand build**; the
> phases below re-plan the build with Redux Toolkit as the client-state layer. The state-touching
> phases (**1, 2, 3**) carry the real changes; the rest only swap `*-store` references to
> `*-slice` + dispatch.

### Phase 0 — Project baseline · ✅ BUILT & VERIFIED (2026-07-01)

- Init Vite + React + TS app (Node/npm), Tailwind v4, path aliases, ESLint/Prettier, Husky,
  `env.ts`, full folder skeleton, `.env.example`, README stub.
- **Done when:** `npm run dev` serves a blank shell; `npm run lint`, `npm run typecheck`,
  `npm run build` (emits `dist/`) all pass.
- **Redux delta:** none (no state yet).
- **As-built:** dev/lint/typecheck/build all green; the dev server served the shell (HTTP 200) with
  HMR. **Deviations from the sketch:** (1) used a manual `resolve.alias` (`@`→`src`) instead of
  native `resolve.tsconfigPaths` — zero-dep and always resolves; (2) dropped the TS 6-deprecated
  `baseUrl`; (3) the ESLint 10 flat config uses `reactHooks.configs.flat['recommended-latest']` (the
  flat-config namespace) + `perfectionist/sort-imports` (natural); (4) jsx-a11y + the import-boundary
  rule remain deferred.

### Phase 1 — Core integrations + Redux store + React Compiler · ✅ BUILT & VERIFIED (2026-07-01)

- React Compiler wiring (§4.7) + ESLint compiler rules; QueryClient + provider + devtools;
  `http-client` + `access-token` holder; **Redux `configureStore` + `app/store/{store,hooks,root-reducer}.ts`**
  - `ui-slice` + `theme-slice`; **`react-redux <Provider>`** added to the provider stack;
    **`app/store/listeners.ts`** (listener middleware) with the `loggedOut/sessionExpired → queryClient.clear()`
  - `ui` reset reaction **scaffolded as an extension point** (auth slice lands Phase 2); the live
    reaction shipped now is `online/offline → ui/setOffline`; the **persistence** load+listener
    (theme whitelist); Router data mode + layouts + error boundaries; shadcn init + base UI
    primitives; RHF `use-zod-form` + `form-field`; MSW worker bootstrapped in `main.tsx`.
- **Done when:** the provider stack (incl. `<Provider store>`) renders a route; a sample form
  validates with Zod; a sample query resolves against MSW; the theme slice toggles dark mode and
  **persists across reload**; Redux DevTools shows dispatched actions in dev and is absent from the
  prod bundle; **and the React Compiler toolchain links** — HMR preserves state _and_ the
  transformed output shows `_c(n)`. **If the compiler won't link / HMR is unusable → take the §4.7
  escape hatch (compiler OFF) and proceed.** (Deep compiler validation is Phase 3.)
- **Redux delta vs prior build:** Zustand `create-store` factory + three independent stores →
  one `configureStore` with `ui`/`theme` slices, typed hooks, `<Provider>`, listener middleware,
  and the custom persistence listener. **Timing rule still applies:** anything that calls the mock
  backend at startup must run **after** MSW is ready (Phase 2's cold-start refresh) — trigger it
  from an `AppProviders` effect, not at module-eval (§9).
- **As-built:** verified live in-browser — the provider stack renders a route, `GET /api/health`
  resolves against MSW (`ok`), the Zod demo form validates, and the theme toggle **persists across
  reload**; no console errors. **React Compiler confirmed active** (`_c(` memo cache in the built
  output; escape hatch not needed). **Deviations from the sketch:** (1) the real compiler wiring is
  `plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]` using
  `@rolldown/plugin-babel`'s **default** export — the plan's `import { babel }` named import and
  `babelConfig:` form were wrong; (2) shadcn primitives (button/input/label/card) are
  **hand-authored** rather than via the interactive CLI — Radix (dialog) is deferred to Phase 3;
  (3) `useZodForm` needs a resolver double-cast to collapse zod v4 / resolvers v5's input/output
  split; (4) Query devtools are DEV-gated via a dead-code-eliminated ternary.

### Phase 2 — Enterprise cross-cutting (auth, RBAC, theming) · ✅ BUILT & VERIFIED (2026-07-01)

- Auth feature: **`auth-slice`** (status + non-sensitive user/roles; `tearingDown` guard), login,
  refresh, guards, 401 single-flight handling, with MSW auth handlers; the access token in the
  `shared/api/access-token` holder (not the store); the Phase-1 listener reaction goes **live**
  (`loggedOut/sessionExpired → queryClient.clear() + ui reset + navigate`); RBAC (`domain/rbac`,
  `usePermissions`, `<Can>`, `<RequireRole>`) reading the auth slice via typed selectors;
  theming/dark-mode toggle on `theme-slice`.
- **Done when:** unauthenticated users are redirected to login; access/refresh token flow works
  against MSW; **session restores on reload** via cold-start `/auth/refresh`; role-gated route + UI
  hide correctly; theme persists across reload; logout clears the Query cache + redirects; the
  httpOnly refresh token is invisible to `document.cookie`; the access token never appears in
  `localStorage` **or** in the Redux DevTools state.
- **Redux delta:** `auth-store` (zustand persist) → `auth-slice` + the in-memory token holder;
  cross-store `store.subscribe` bindings → `extraReducers` (pure ui reset) + one listener (impure).
- **As-built:** verified live for **both roles** — unauth → `/login`; login `200`; **session
  restores on reload** via cold-start `POST /auth/refresh`; viewer is bounced from `/admin` while
  admin gets the route + the `<Can>`-gated nav link; logout clears the Query cache + redirects; the
  access token is **in-memory only** (absent from both `document.cookie` and `localStorage`).
  **Deviations from the §4.9 sketch:** (1) logout navigation is **declarative via `<ProtectedRoute>`**
  reacting to auth status — no `router.navigate` in the listener, which avoids a store↔router import
  cycle; (2) the `tearingDown` flag is replaced by `listenerApi.cancelActiveListeners()` + an
  idempotent `queryClient.clear()`; (3) the httpOnly refresh cookie is **simulated** by MSW
  persisting its own session store (a browser-only mock can't set a real httpOnly cookie); (4) **no**
  auth state is persisted — the session is restored purely via that mock cookie, so nothing
  auth-related touches `localStorage`. The listener's only job is `queryClient.clear()`.

### Phase 3 — DataGrid + example `users` feature · ✅ BUILT & VERIFIED (2026-07-01)

- `DataGrid` (Table + Virtual); `users` slice (**`users-slice`** — client-only filter/selection UI
  state): list (server-driven grid via MSW + TanStack Query), create/edit (RHF + Zod dialog),
  delete, with Query invalidation; MSW `users` handlers + db.
- **Done when:** users grid sorts/filters/paginates against MSW; create/edit/delete update the
  Query cache; virtualized rows scroll smoothly; RBAC enforced **at the API** (viewer create → 403;
  admin → 201/200/204). **React Compiler stress-check here** (the real one): the render-heavy grid
  stays correct + the transformed module shows `_c(n)` under scroll/sort; if the compiler misbehaves
  on this code, fall back to compiler-OFF (§4.7).
- **Redux delta:** `users` client UI state (filters, selection) moves from a Zustand store to
  `users-slice`, selected via memoized `createSelector`s. Server data stays entirely in TanStack
  Query (no change). The DataGrid's `useReactTable` remains a documented compiler bail (TanStack
  Table memoizes itself); the rest of the page compiles.

### Phase 4 — Scaffolder · ✅ BUILT & VERIFIED (2026-07-01)

- Plop generators + templates for the reviewed three — **domain, feature, mock** (§5);
  `npm run gen` script.
- **Done when:** `npm run gen feature foo` produces a compiling, lint-clean slice (incl. a
  `createSlice` `foo-slice` + an MSW handler) wired into the app, with the reducer-registration
  next-step printed (or auto-globbed) and the handler auto-wired via `import.meta.glob`.
- **Redux delta:** the `feature` template emits a `createSlice` `*-slice.ts` + selectors instead of
  a Zustand store; the generator prints the one-line `root-reducer.ts` registration (§5). MSW
  handler auto-wiring is unchanged.

### Phase 5 — Testing harness · ✅ BUILT & VERIFIED (2026-07-01)

- **Vitest + RTL** use MSW `setupServer` (Node — no service worker).
- **Playwright drives a real browser, so it cannot use `setupServer`.** It runs against the
  **dev server (or a preview build with the MSW browser worker enabled)** — never against the
  shipped `dist`. Same shared handlers, different MSW entry point.
- Smoke E2E: login → users grid.
- **Done when:** `npm test` and `npm run e2e` pass on a fresh checkout; the E2E target's MSW
  worker is explicitly the browser worker, not `setupServer`.
- **Redux delta:** `test-utils` must wrap each render in a **freshly created store**
  (`makeStore(preloadedState?)`) wrapped in `<Provider>`, never the app singleton — so tests are
  isolated and can seed `preloadedState`. This is the Redux equivalent of resetting Zustand stores
  between tests; `setup.ts` keeps the MSW lifecycle + `resetDb` + RTL cleanup.

### Phase 6 — PWA (installable shell) · ✅ BUILT & VERIFIED (2026-07-01)

- `vite-plugin-pwa` manifest + icons; Workbox app-shell precache; `registerSW` update flow →
  **`dispatch(ui/showUpdateToast())`** (direct, no bus); offline banner via `online/offline` →
  **`dispatch(ui/setOffline())`**; exclude `mockServiceWorker.js` from the build (§4.8 SW split).
- **Done when:** a production `npm run build` + `npm run preview` is installable and loads the
  **app shell** offline, and shows the update toast when a new build is served. (No offline-data
  claim.)
- **Redux delta:** the update/offline signals dispatch to the `ui` slice instead of calling a
  Zustand `ui-store` method — same single source of truth, now an action.

### Phase 7 — Docs · ✅ BUILT & VERIFIED (2026-07-01)

- README (run/scaffold/conventions), ADRs for the §1 decisions (incl. React Compiler,
  MSW-as-backend, **Redux Toolkit for client state**, **listener-middleware cross-slice reactions**,
  **TanStack-Query-not-RTK-Query**, auth-security defaults, and the installable-shell PWA), and a
  CONTRIBUTING note on the dependency-direction rule (+ the typed-hooks carve-out). Keep `AGENTS.md`
  in sync.
- **Done when:** a new dev can clone, run, and scaffold a feature using only the docs.
- **Redux delta:** rewrite the state-management ADR(s) from Zustand to Redux Toolkit; add the two
  new ADRs (RTK-Query-not-adopted; typed-hooks dependency-direction carve-out). The MSW, PWA, auth,
  and compiler ADRs are unchanged.

---

## Phase 8 — Documentation site & GitHub Pages publishing (post-build) · ✅ BUILT (2026-07-01)

A "how-to" guide series for **users** of the seed, plus a published docs site. **This is the one
place the "no deploy" rule (§1, §8) is carved out:** a docs-only pipeline, not application CI/CD.
_(Redux-agnostic — the guide content updates Zustand references to Redux slices/dispatch, but the
build + Pages pipeline is unchanged.)_

- **How-to series (`docs/how-to/`):** the basic→advanced guides thread an `invoices`/`invoice`
  running example. The **client-state guide** (formerly "client state (Zustand)") becomes
  **"client state (Redux Toolkit)"** — slice, selectors, typed hooks; the **cross-store reactions**
  guide becomes **"cross-slice reactions (listener middleware)"**. The server-state (Query), forms,
  DataGrid, auth/RBAC, theming/PWA, testing, and real-backend guides are unchanged in shape.
- **Publishing (VitePress → GitHub Pages):** `docs/.vitepress/config.mts`, `docs/index.md`,
  `docs:dev|build|preview` scripts, and a docs-only workflow `.github/workflows/deploy-docs.yml`.
- **Done when:** a push to `main` touching `docs/**` builds and publishes the site, and the public
  URL serves the guides.
- **Carried-over operational notes (still apply):** set Pages Source = **GitHub Actions**; the
  deploy step falls back to `npm install` if `npm ci` trips on a platform-specific lockfile edge
  case.

---

## 8. Resolved decisions (your answers)

1. **API:** REST, **MSW-mocked only** — no real backend. MSW is the single mock backend for
   dev _and_ tests; handlers + seed data live in `src/mocks/`.
2. **Auth:** **custom JWT** — access token in an **in-memory holder** (not the Redux store), refresh
   token as an **httpOnly cookie** (MSW-simulated), single-flight refresh on 401. See §4.6.
3. **Scope:** **single app** — no monorepo/workspaces.
4. **Client state:** **Redux Toolkit** (one store, slices, typed hooks, listener middleware). Server
   state stays on **TanStack Query** — **RTK Query deliberately not adopted** (§10, F21).
5. **CI:** **none for the app** — quality gates are local (husky/lint-staged) only. _(Post-build:
   a docs-only GitHub Actions workflow builds the how-to site — Phase 8.)_
6. **Deploy:** **none for the app** — `npm run build` produces `dist/`. _(Post-build exception: the
   how-to docs site is published to GitHub Pages — Phase 8.)_
7. **Storybook:** **excluded.**

### Remaining assumptions (flag if wrong)

- **i18n** stays out of scope for v1; structure is left i18n-ready but unwired.
- **JWT storage:** access token **in-memory holder only**; refresh token as an **httpOnly cookie**
  simulated by MSW; persisted Redux holds only non-sensitive session info (user id, roles, status).
  The token is intentionally **outside** the store so it is never persisted or shown in DevTools.
- **MSW in the production build:** MSW serves **dev + tests only**; the Workbox SW owns production
  (installable shell). `dist` needs a real API for data.
- **Persistence:** custom localStorage whitelist listener, **not** `redux-persist` (§4.1). Revisit
  only if persisted state grows complex (migrations, nested transforms).

---

## 9. Risks / notes

- **React Compiler ordering (Vite 8 / plugin-react v6):** settled — `react()` first, then the
  babel/compiler pass (react.dev order). Any tutorial using `react({ babel: {...} })` is stale on
  this stack — all Babel passes go through `@rolldown/plugin-babel`.
- **React Router v7→v8 package move:** use `react-router` (not `react-router-dom`).
- **Tailwind v4 + shadcn:** confirm the shadcn CLI + `components.json` target the v4 token
  format and React 19.
- **Zod v4:** API differs from v3 — ground schema/form code in current Zod v4 docs.
- **Redux store is a singleton — keep it out of tests.** Tests must build a **fresh store per
  render** (`makeStore`), never import the app store, or state leaks between tests (Phase 5).
- **Selector identity / over-render:** `useSelector` returning a freshly-built object/array
  re-renders every dispatch. Memoize derived selections with **`createSelector`**; the React
  Compiler does **not** fix this (§4.7).
- **Keep server data out of Redux.** Fetched rows belong to TanStack Query; mirroring them into a
  slice reintroduces the cache-sync bugs Query exists to prevent (golden rule, §1).
- **MSW in two runtimes:** the Service Worker (`public/mockServiceWorker.js` via `msw init`) for the
  browser/dev + Playwright, and `setupServer` for Vitest — keep handlers shared so dev and tests
  can't drift.
- **MSW + Vite HMR (dev-only):** editing an app-graph module can leave the worker without the
  glob-registered handlers, so API calls 404 until a full reload re-runs `main.tsx`. Cosmetic in
  dev; irrelevant in production (no HMR in `dist`).
- **App bootstrap must run after MSW (timing):** anything that calls the mock backend at startup
  (the auth cold-start refresh) has to run _after_ `enableMocking()` resolves, not at module-eval —
  trigger it from an `AppProviders` effect (render gated on MSW readiness). The prior build hit this
  and it wiped sessions on reload; the same rule applies under Redux.
- **MSW ↔ PWA service worker:** only one SW controls a scope — see §4.8. MSW in dev/test, Workbox SW
  in prod; `mockServiceWorker.js` excluded from the build; never two at `/`.
- **PWA caching vs Query:** never let Workbox runtime-cache API responses — TanStack Query is the
  server-state cache; SW-caching API data causes stale results.
- **Cross-slice reactions discipline:** pure state coupling in the reacting slice's `extraReducers`;
  all impure side effects in `app/store/listeners.ts` (listener middleware). No slice-to-slice thunk
  imports, no ad-hoc `store.subscribe` in components. Listeners are app-lifetime; the teardown
  reaction is idempotent + re-entrancy-guarded (`tearingDown`) so `sessionExpired`/`loggedOut` can't
  loop (§4.9).
- **Concurrent-401 refresh storm (classic JWT bug):** the http-client **must** use a single-flight
  refresh (one shared in-flight promise) — see §4.6.
- **Security defaults a seed must not get wrong:** access token in a memory holder (never
  localStorage, never the persisted store, never DevTools); client RBAC is cosmetic — MSW handlers
  return `403` so enforcement is demonstrated at the API. (§4.6.)
- **`@babel/core` peer dep:** must be installed explicitly for `@rolldown/plugin-babel`.
- **"Wired by default" caveat:** items marked _optional_ in §4 (router loader prefetch, glob slice
  auto-registration) and the compiler until Phase 1 confirms it are **not** guaranteed-wired.

---

## 10. Adversarial review — resolutions

Dispositions below (✅ accepted & applied, 🟡 user decision, ⚪ rejected/deferred with reason).
Findings F1–F20 carried from the prior review; F1–F4 and F16 are re-stated in Redux terms, and
**F21–F22 are new to this Redux re-plan.**

| #       | Finding                                                                                                                   | Disposition                                                                                                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1      | Cross-store comms shouldn't couple stores or scatter subscriptions                                                        | ✅ **No event bus.** One Redux store → `extraReducers` (pure) + `createListenerMiddleware` in `app/store/listeners.ts` (impure). Even more idiomatic than the prior `store.subscribe` (§4.9)                                                                                                                                                                         |
| F2      | Re-entrant hidden control flow on the logout/session path                                                                 | ✅ Teardown reaction idempotent + re-entrancy-guarded via the `tearingDown` field in the auth slice (§4.9, §9)                                                                                                                                                                                                                                                       |
| F3      | Free-floating reactions → forgotten-cleanup leaks                                                                         | ✅ Listeners registered once in `configureStore` (app-lifetime); components never subscribe (§4.9)                                                                                                                                                                                                                                                                   |
| F4      | Reaction traffic invisible to devtools                                                                                    | ✅ Reactions are dispatched **actions** — fully visible in Redux DevTools (a Redux win over the prior `subscribe`)                                                                                                                                                                                                                                                   |
| F5–F6   | PWA + no backend = prod app with no data source                                                                           | ✅ **PWA scoped to installable shell**; no offline-data claim; MSW stays dev/test (§4.8)                                                                                                                                                                                                                                                                             |
| F7      | Playwright (real browser) can't use `setupServer`                                                                         | ✅ Phase 5 + §4.8: Playwright uses the **browser** worker                                                                                                                                                                                                                                                                                                            |
| F8      | `mockServiceWorker.js` ships in `dist` even when unused                                                                   | ✅ Excluded from the build (§4.8)                                                                                                                                                                                                                                                                                                                                    |
| F9      | 5-deep bleeding-edge compiler toolchain, no fallback                                                                      | ✅ Explicit **compiler-OFF escape hatch** (§4.7, Phase 1)                                                                                                                                                                                                                                                                                                            |
| F10     | Ordering "vibe check" with no plan C                                                                                      | ✅ Escape hatch is plan C; ordering settled (react-first)                                                                                                                                                                                                                                                                                                            |
| F11     | Phase-1 compiler check too early to be meaningful                                                                         | ✅ Real stress-validation in **Phase 3** (DataGrid)                                                                                                                                                                                                                                                                                                                  |
| F13     | Import-boundary rule                                                                                                      | ✅ Kept light; one documented allow-entry for the typed hooks (F22)                                                                                                                                                                                                                                                                                                  |
| F14     | Per-slice barrels can defeat tree-shaking                                                                                 | ⚪ Keep thin barrels; revisit if Rolldown warns. Taste                                                                                                                                                                                                                                                                                                               |
| F15     | `domain/` vs feature `types/` ownership ambiguous                                                                         | ✅ Rule in §3 ("if a second feature could need it → `domain/`")                                                                                                                                                                                                                                                                                                      |
| F16     | Token storage = XSS theft risk; must not persist tokens                                                                   | ✅ **Hardened + Redux-aware:** access token in a `shared/api/access-token` **memory holder**, _not_ in the store — so it's neither persisted (whitelist) nor logged in DevTools; refresh as httpOnly cookie (§4.6)                                                                                                                                                   |
| F17     | Client-only RBAC teaches "hide the button"                                                                                | ✅ MSW handlers enforce `403`; client RBAC labeled UX-only (§4.6)                                                                                                                                                                                                                                                                                                    |
| F18     | Scaffolder over-scoped + fragile string-injection wiring                                                                  | ✅ Trimmed to 3 gens; `import.meta.glob` wiring; slice registration is a printed next-step (§5)                                                                                                                                                                                                                                                                      |
| F19     | 401 refresh single-flight hand-waved                                                                                      | ✅ Single-flight refresh explicit (§4.6, §9)                                                                                                                                                                                                                                                                                                                         |
| F20     | "Wired by default" overstates optional items                                                                              | ✅ Caveat in §9                                                                                                                                                                                                                                                                                                                                                      |
| **F21** | **Why adopt Redux but keep TanStack Query instead of RTK Query?**                                                         | 🟡 **User decision: keep TanStack Query.** Best-in-class server cache, already proven against MSW, and it preserves the clean server-vs-client split. Redux is **client-state-only**; RTK Query considered and **not** adopted. Documented as an ADR (§1, §4.2, Phase 7)                                                                                             |
| **F22** | **Typed hooks (`useAppSelector`) import from `app/` — an upward edge that violates §3's `app→features→shared` direction** | ✅ **Narrow sanctioned carve-out:** components may import the typed hooks + `RootState`/`AppDispatch` _types_ from `app/store` — the single allowed `→ app` edge, because the store is the app's one runtime singleton. Slice _logic_ still flows downward (slices import nothing from `app/`). The import-boundary lint rule gets one explicit allow-entry (§3, §6) |

### Decisions (now resolved)

- **F-state — client state:** **Redux Toolkit**, one store, feature/shared slices, typed hooks,
  `createListenerMiddleware` for cross-slice side effects. Replaces Zustand entirely. (§4.1, §4.9)
- **F21 — server state:** **TanStack Query kept; RTK Query not adopted.** Redux is client-state-only.
  (§1, §4.2)
- **F22 — typed-hooks boundary:** sanctioned single upward import for the store singleton + typed
  hooks; slice logic flows downward. (§3)

---

## Appendix A — Prior Zustand build: verified-green outcomes (as-built history)

These are the **real, live-verified results of the original Zustand implementation** (7 phases +
docs Phase 8, all green). They are preserved verbatim in substance as the evidence that the
**non-state architecture works end to end** — routing, MSW-as-backend, the auth flow, the DataGrid,
the scaffolder, the test harness, the PWA shell, and the docs pipeline are all Redux-agnostic and
already proven here. Names in this appendix (`ui-store`, `auth-store`, `app/bindings.ts`,
`store.subscribe`) are **Zustand-era** and are superseded by the Redux design in §3–§4/§7; read them
as history, not as the target structure.

### Phase 0 — Project baseline · ✅ DONE (2026-06-28)

- **Done when:** `npm run dev` serves a blank shell; `npm run lint`, `npm run typecheck`,
  `npm run build` (emits `dist/`) all pass. — **all verified green.**
- **Deviations:** (1) path aliases use Vite 8's native `resolve.tsconfigPaths` instead of the
  `vite-tsconfig-paths` plugin (drops a dep + deprecated `tsconfck`); (2) `eslint-plugin-jsx-a11y`
  deferred to Phase 1 (no ESLint 10 support yet); (3) the §3 import-boundary lint rule deferred to
  Phase 1 (no features to guard yet).

### Phase 1 — Core integrations + React Compiler · ✅ DONE (2026-06-29)

- **Outcome:** acceptance met live in-browser — home + 404 routes render in the themed shell (dark
  via system pref); the demo query resolves against MSW (`GET /api/health` → `200 ok`); the demo
  form shows Zod errors on invalid input and submits on valid; no console errors. **Compiler
  confirmed active** — the transformed `HomePage` imports `react/compiler-runtime` and opens with
  `const $ = _c(11)` (memo cache), with Fast Refresh (`createHotContext`) coexisting; the escape
  hatch was **not** needed. **§4.7 ordering settled: `react()` first, then the babel/compiler pass.**
- **Deviations:** (1) the `logged-out → queryClient.clear() + ui-store.reset()` reaction was
  **scaffolded as a documented extension point** in `app/bindings.ts`, not live — it depended on
  `auth-store` (Phase 2); the live binding shipped was `online/offline → ui-store`. (2) devtools
  lazy + DEV-gated. (3) jsx-a11y + the §3 import-boundary rule remained deferred.

### Phase 2 — Enterprise cross-cutting · ✅ DONE (2026-06-29)

- **Outcome:** verified for both roles — unauth `/` → `/login`; viewer & admin login
  (`POST /auth/login 200`); **session restores on reload** (`POST /auth/refresh 200`); viewer is
  bounced from `/admin` and sees no admin panel/link while admin gets both; logout clears the query
  cache + redirects; theme persists. The httpOnly refresh token is invisible to `document.cookie`
  (P2.2 probe). Access token in memory only; refresh as httpOnly cookie; single-flight 401 refresh;
  MSW enforces 401/403 (client RBAC is UX-only).
- **Bug found + fixed during acceptance:** `bootstrapAuth` ran at module-eval (when `app-providers`
  is imported), which is _before_ `main.tsx` starts MSW — so the cold-start refresh raced ahead of
  the mock backend, failed, and cleared **every** session on reload. Moved the bootstrap to an
  `AppProviders` effect (render is gated on MSW readiness), guarded once. _(This timing rule is
  carried into the Redux re-plan — §9, Phase 1/2.)_
- **Deviation:** `app/bindings.ts` used the base `store.subscribe((state, prev))` form, not the
  selector form — identical behavior without adding `subscribeWithSelector` middleware.

### Phase 3 — DataGrid + example `users` feature · ✅ DONE (2026-06-29)

- **Outcome:** as admin — grid loads server-driven (203 rows, 9 pages); server-side filter
  (`Turing` → 12, `Zzztest` → 1) and sort; pagination; create via the dialog
  (`POST /users 201` → invalidate → refetch → the new row appears), with a real
  `401 → refresh → 201` retry observed on an expired token; rows virtualized (23 DOM rows of a
  25-row page). RBAC enforced **at the API**: viewer create → **403**; admin create/update/delete →
  201/200/204. Mutations invalidate `userKeys.all`.
- **React Compiler stress-check — passed, no fallback needed:** the render-heavy `UsersPage` is
  compiled (transformed module opens with `_c(53)`); the `DataGrid` correctly **bails** (its
  `useReactTable` is "incompatible-library", surfaced by the react-hooks lint rule and suppressed
  with an explanatory disable) — TanStack Table memoizes itself, the grid stays correct under
  filter/sort/paginate/create, and the rest of the app stays optimized.
- **Deviations:** (1) the CRUD form edits a **single** primary `role` (`userInputSchema`), stored as
  the `roles` array. (2) Column **visibility** UI was not built. (3) Per-row action buttons were
  replaced by **row-click-to-edit + checkbox bulk-delete** (keeps columns module-level, stable
  identity, no table resets).

### Phase 4 — Scaffolder · ✅ DONE (2026-06-29)

- **Outcome:** `npm run gen feature scaffoldtest` generated the slice (types, query keys, list
  query, store, page, index) + an MSW handler; `npm run typecheck` and `npm run lint` passed on the
  generated output with the handler **auto-wired** via the handlers `import.meta.glob` (zero edits
  to a shared file). `domain` and `mock` generators likewise. Throwaway test output was removed.
- **Deviations:** (1) the plopfile is **ESM JS at the repo root** (`plopfile.mjs`), not
  `scripts/plopfile.ts`. (2) **No** `store`/`query`/`component`/`route` generators. (3) Route
  auto-discovery is impractical for a guarded data-router, so a generated feature's route is a
  **printed next-step**, while its MSW handler genuinely auto-wires. The `domain` entity is a single
  `{{name}}.ts` (schema + type). _(In the Redux re-plan the generated `store/` emits a `createSlice`
  slice + selectors, and slice registration is likewise a printed next-step — §5.)_

### Phase 5 — Testing harness · ✅ DONE (2026-06-29)

- **Outcome:** `npm test` → **5 Vitest tests pass** (rbac unit; `useHealthQuery` integration
  resolving against the MSW `setupServer`; `DemoForm` component via `userEvent` for Zod validation +
  submit). `npm run e2e` → **2 Playwright tests pass** in headless Chromium against the dev server's
  MSW **browser** worker (unauth → `/login`; admin login → dashboard → users grid). `test-utils`
  renders with QueryClient + MemoryRouter; `setup.ts` runs the MSW lifecycle + `resetDb` + RTL
  cleanup between tests.
- **Deviations:** (1) `vitest.config.ts` is **separate** from `vite.config.ts` so tests skip the
  React Compiler babel pass and Tailwind, with an explicit `@` alias. (2) Vitest uses **explicit
  imports** (`globals: false`). _(The Redux re-plan adds one requirement: `test-utils` wraps each
  render in a freshly created store — Phase 5.)_

### Phase 6 — PWA (installable shell) · ✅ DONE (2026-06-29)

- **Outcome:** `npm run build` emits `manifest.webmanifest` (standalone, theme color, icons) +
  `sw.js` + the Workbox runtime, and the build plugin **removes `mockServiceWorker.js` from `dist`**.
  In `npm run preview`: the SW registers and, after a navigation, **controls** the page; the Workbox
  precache holds the **full app shell** — `index.html` + every JS chunk + CSS + icons + manifest
  (11 entries), and **not** the MSW worker — so the shell loads offline; the page is installable.
  `/api` is **not** runtime-cached; `navigateFallback` serves the cached shell for offline
  navigations. The update toast / offline banner were `ui-store`-driven from `app/pwa/` (no bus).
- **Deviations:** (1) a **hand-authored SVG** manifest icon instead of `@vite-pwa/assets-generator`
  raster output. (2) `injectRegister: false` — the SW is registered manually so `onNeedRefresh` can
  signal `ui-store` directly. (3) `workbox-window` is pulled transitively. _(Redux re-plan: the same
  update/offline signals become `ui` slice dispatches — Phase 6.)_

### Phase 7 — Docs · ✅ DONE (2026-06-29)

- **Outcome:** README rewritten from the Phase 0 stub into a complete guide (stack, quick start with
  seeded login accounts, every script, FSD structure, golden rules, scaffolding, testing, PWA, and
  the MSW-only scope). `CONTRIBUTING.md` documents the dependency-direction rule + the add-a-feature
  flow + pre-commit gates. Seven ADRs in `docs/adr/` capture the key decisions. `AGENTS.md` synced to
  the as-built state.

### Phase 8 — Documentation site & GitHub Pages publishing · ✅ DONE (2026-06-30, post-build)

- **Outcome:** live at **https://akhilshastri.github.io/react-zustand-seed/** (home + every how-to
  page return HTTP 200). VitePress build is clean (dead-link checking on; repo-root links ignored).
- **Issues found + fixed during bring-up:** (1) Pages defaulted to "deploy from a branch" → set
  Source = **GitHub Actions**. (2) `npm ci` failed on the Linux runner because the Windows-generated
  `package-lock.json` was incomplete (npm optional-deps bug after adding VitePress) → regenerated the
  lockfile, and the deploy step falls back to `npm install`.
- **Deviations:** (1) adds a single **docs-only** GitHub Actions workflow — the app itself still has
  **no CI/deploy**. (2) the `npm install` fallback trades strict `npm ci` reproducibility for
  resilience. (3) the React Compiler Babel pass / app build are untouched.

---

## Sources

### React Compiler (carried)

- [Installation – React (react.dev)](https://react.dev/learn/react-compiler/installation)
- [React Compiler 1.0 + Vite 8 — recca0120](https://recca0120.github.io/en/2026/04/14/react-compiler-vite-v6/)
- [vite-plugin-react — React Compiler Integration (DeepWiki)](https://deepwiki.com/vitejs/vite-plugin-react/3.3-react-compiler-integration)

### Redux Toolkit (this re-plan)

- [Redux Toolkit — Quick Start & `configureStore`](https://redux-toolkit.js.org/)
- [Usage with TypeScript — typed `useAppSelector`/`useAppDispatch` (`.withTypes`)](https://redux-toolkit.js.org/usage/usage-with-typescript)
- [`createListenerMiddleware` API](https://redux-toolkit.js.org/api/createListenerMiddleware)
- [`createSlice` + `extraReducers`/`addMatcher`](https://redux-toolkit.js.org/api/createSlice)
- [Deriving Data with Selectors (Reselect / `createSelector`)](https://redux.js.org/usage/deriving-data-selectors)
- [React Redux — `<Provider>` & hooks](https://react-redux.js.org/)

```

```
