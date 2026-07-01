# 7. Auth & RBAC

## Gate a route

Routes under `<ProtectedRoute>` require authentication; `<RequireRole>` requires a permission.

```tsx
// src/app/router/routes.tsx
{
  element: <RequireRole permission="invoices.manage" />,
  children: [{ path: paths.invoices, element: <InvoicePage /> }],
}
```

Add the permission to `src/domain/rbac.ts` (`Permission` union + `ROLE_PERMISSIONS` matrix).

## Hide UI you can't use

```tsx
import { Can } from '@/features/auth'

;<Can permission="invoices.manage">
  <Button onClick={openCreate}>New invoice</Button>
</Can>
```

## Enforce it at the API (this is the real boundary)

Client checks are **UX only**. The MSW handler must return `403` for unauthorized writes:

```ts
import { authenticate, rolesFor } from '../db'
import { hasPermission } from '@/domain'

http.post('/api/invoice', ({ request }) => {
  const userId = authenticate(request)
  if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(rolesFor(userId), 'invoices.manage'))
    return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
  // …create
})
```

## What you get for free

- Access token in memory only; refresh via a (simulated) httpOnly cookie; single-flight 401 refresh.
- On logout: the Query cache clears, the `ui` slice resets, and `<ProtectedRoute>` redirects to
  `/login` — all wired centrally.

Full rationale: [ADR 0004 — Auth security defaults](../adr/0004-auth-security-defaults).
