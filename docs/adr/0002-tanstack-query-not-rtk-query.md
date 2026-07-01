# 0002 — TanStack Query for server state (not RTK Query)

**Status:** Accepted

## Context

We chose Redux Toolkit ([ADR 0001](0001-redux-toolkit-for-client-state.md)), which ships **RTK
Query** — the idiomatic Redux server-state tool. We still need a server-cache layer.

## Decision

Keep **TanStack Query** for all server state; do **not** adopt RTK Query. Redux is
client-state-only. Server data never enters the Redux store.

## Consequences

- Each tool does the one job it is best at, preserving a clean server-vs-client split.
- On logout, the listener middleware calls `queryClient.clear()` — the two layers stay decoupled.
- Trade-off: two "state" libraries to learn. Accepted — TanStack Query's cache ergonomics
  (invalidation, `keepPreviousData`, devtools) are worth it, and mixing both is a common,
  well-understood pattern.
