# 0. Get started

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

There is no real backend — **MSW is the API**. Sign in with a seed account:

| Email                | Password   | Role               |
| -------------------- | ---------- | ------------------ |
| `admin@example.com`  | `password` | admin (full CRUD)  |
| `viewer@example.com` | `password` | viewer (read-only) |

## The mental model

- **Server state → TanStack Query.** Anything fetched from the API.
- **Client/UI state → Redux Toolkit slices.** Auth, theme, grid filters/selection.
- **Never mirror server data into Redux.**

Layers flow one way: `app → features → shared → domain`. A feature owns its `api/`, `store/`,
`components/`, and exposes a public `index.ts`.

## What you'll build

The next guides build an **`invoices`** feature end to end: scaffold it, define the domain model,
mock the backend, add client + server state, a form, a data grid, and role-gated access.

Next: [Generate a feature →](./01-generate-a-feature)
