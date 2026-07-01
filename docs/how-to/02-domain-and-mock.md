# 2. Domain & mock backend

## Domain model

Domain models are framework-agnostic Zod schemas in `src/domain/`. Generate one:

```bash
npm run gen domain invoice
```

Then flesh it out and re-export it from `src/domain/index.ts`:

```ts
// src/domain/invoice.ts
import { z } from 'zod'

export const invoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  amount: z.number().positive(),
  status: z.enum(['draft', 'sent', 'paid']),
})
export type Invoice = z.infer<typeof invoiceSchema>

export const invoiceInputSchema = invoiceSchema.omit({ id: true })
export type InvoiceInput = z.infer<typeof invoiceInputSchema>
```

The same schema validates the form and (optionally) the API response.

## Mock the backend

The `feature` generator already created `src/mocks/handlers/invoice.ts`. Flesh it out with real
handlers and seed data in `src/mocks/db.ts`:

```ts
// src/mocks/handlers/invoice.ts
import { HttpResponse, http } from 'msw'
import { authenticate } from '../db'

export const invoiceHandlers = [
  http.get('/api/invoice', ({ request }) => {
    if (!authenticate(request))
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    return HttpResponse.json(/* rows */ [])
  }),
]
```

Handlers auto-wire — no shared-file edit. For writes, enforce RBAC with a `403`
(see [Auth & RBAC](./07-auth-and-rbac)). MSW is the backend for dev **and** tests.

Next: [Client state (Redux) →](./03-client-state-redux)
