# 0006 — Installable-shell PWA (no offline data)

**Status:** Accepted

## Context

An installable PWA is expected of an enterprise seed, but there is no real backend — a built `dist`
can't show data offline. We should not pretend otherwise.

## Decision

Use **vite-plugin-pwa** (Workbox `generateSW`) scoped to **installable + app-shell precache only**:

- Precache the built shell (HTML, JS, CSS, icon, manifest); `navigateFallback: index.html`.
- **API responses are never SW-cached** — TanStack Query owns server-state caching
  (`navigateFallbackDenylist: [/^\/api/]`, no `runtimeCaching`).
- Update flow: manual `registerSW` → `onNeedRefresh` dispatches `ui/showUpdateToast` → the toast's
  button calls `updateSW(true)`. No silent reload.
- Online/offline → `ui/setOffline` drives an offline banner.

## Consequences

- Only the Workbox SW ships in prod; MSW is dev/test only and `mockServiceWorker.js` is stripped
  from the build, so exactly one SW controls `/`.
- The shell loads offline; **data does not** — that needs a real API, and the seed says so.
- Icons are a hand-authored SVG (`public/icon.svg`); the raster assets-generator is the documented
  path if PNGs are needed.
