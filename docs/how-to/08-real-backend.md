# 8. Swap MSW for a real backend

The seed ships with MSW as the backend, but nothing in the app is coupled to it. Swapping to a
real REST API is an **environment change**, not a code change.

## The one change

Set two env vars (see `.env.example`):

```bash
VITE_API_BASE_URL=https://api.example.com   # your API origin
VITE_API_MOCK=false                          # don't start MSW
```

- `VITE_API_MOCK` is opt-out: unset → mock in dev, real API in prod; `false` → real API even in dev.
- The `httpClient` already sends the `Authorization: Bearer <token>` header and
  `credentials: 'include'` (for the refresh cookie), so requests go straight to your API.
- MSW stays in the repo for tests and offline dev — it just doesn't start.

## What your backend must implement (the contract)

Endpoints are relative to `VITE_API_BASE_URL`. Auth uses a **Bearer access token** (returned by
login/refresh) and an **httpOnly refresh cookie** set by the server. The server enforces RBAC.

| Method & path                                    | Auth                    | Success                                            | Errors                |
| ------------------------------------------------ | ----------------------- | -------------------------------------------------- | --------------------- |
| `POST /auth/login` `{ email, password }`         | —                       | `200 { accessToken, user }` + `Set-Cookie` refresh | `401`                 |
| `POST /auth/refresh` (refresh cookie)            | cookie                  | `200 { accessToken, user }`                        | `401`                 |
| `GET /auth/me`                                   | Bearer                  | `200 User`                                         | `401`                 |
| `POST /auth/logout`                              | cookie                  | `204` + clear cookie                               | —                     |
| `GET /users?search&sortBy&sortDir&page&pageSize` | Bearer                  | `200 { rows: User[], total, pageCount }`           | `401`                 |
| `POST /users` `UserInput`                        | Bearer + `users.create` | `201 User`                                         | `401` / `403`         |
| `PATCH /users/:id` `UserInput`                   | Bearer + `users.update` | `200 User`                                         | `401` / `403` / `404` |
| `POST /users/bulk-delete` `{ ids }`              | Bearer + `users.delete` | `204`                                              | `401` / `403`         |

Shapes (`User`, `UserInput`, `Session`) are the Zod schemas in `src/domain/`. On a `401`, the client
runs a **single-flight refresh** and retries once; if refresh fails it logs out.

## Responses are validated

API calls pass their Zod schema to `httpClient`, so a response that violates the contract throws
at the boundary instead of corrupting the UI:

```ts
// src/features/auth/api/auth-api.ts
httpClient<Session>('/auth/login', { method: 'POST', body: input, schema: sessionSchema })
```

Add `schema:` to your own feature's calls the same way (mock data always matches; real APIs drift).

## Gotchas

- **CORS + cookies:** the API must send `Access-Control-Allow-Credentials: true` and an explicit
  `Access-Control-Allow-Origin` (not `*`) for the refresh cookie to work cross-origin.
- **RBAC is the server's job.** Client `<Can>`/guards are UX only — enforce `403` on the API.
- **PWA:** a production build still precaches only the app shell; it never caches `/api`
  ([ADR 0006](../adr/0006-installable-shell-pwa)).
