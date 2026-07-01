# 0004 — Auth security defaults

**Status:** Accepted

## Context

A seed encodes the defaults others copy to production, so the defaults must be the _safe_ ones,
not the convenient ones. Custom JWT auth, no external IdP.

## Decision

- **Access token in memory only** — a `shared/api/access-token` holder, never `localStorage`,
  never a JS-readable cookie, never the Redux store (so it can't be persisted or logged in
  DevTools).
- **Refresh token as an httpOnly cookie** — simulated here by MSW's persisted session store, since
  a browser-only mock can't set a real httpOnly cookie. The app never reads it and `document.cookie`
  stays clean.
- **Single-flight 401 refresh** — concurrent 401s await one shared refresh promise, then retry once.
- **RBAC enforced at the API.** Client checks (`<Can>`, route guards) are UX only; the MSW handlers
  return `403` on unauthorized writes.

## Consequences

- No token is reachable by XSS-readable storage.
- Session restore on reload relies solely on the (mock) refresh cookie — no auth state is persisted.
- Hiding a button is never treated as authorization; the server is the boundary.
