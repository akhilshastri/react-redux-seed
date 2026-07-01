# 0005 — MSW as the backend

**Status:** Accepted

## Context

The seed needs a realistic REST API without standing up a server, and the same behavior in dev and
tests.

## Decision

Use **MSW** as the single mock backend. Handlers live in `src/mocks/handlers/` and are auto-wired
via `import.meta.glob`. Two runtimes share the same handlers:

- **Dev + Playwright:** the MSW **browser** service worker (`public/mockServiceWorker.js`).
- **Vitest:** MSW's Node `setupServer`.

## Consequences

- Dev and tests can't drift — one set of handlers, seeded via `src/mocks/db.ts` with a `resetDb()`
  for test isolation.
- MSW is **dev/test only**; a production build has no backend and needs a real API for data.
- Only one service worker may control a scope — the Workbox PWA SW owns prod, and
  `mockServiceWorker.js` is stripped from the build ([ADR 0006](0006-installable-shell-pwa.md)).
