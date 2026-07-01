# 5. Forms (React Hook Form + Zod)

Forms use `useZodForm` (RHF pre-wired with a Zod resolver) and `FormField` (a labelled input with
inline errors), both from `@/shared/forms`. The schema comes from `domain/`.

```tsx
import { invoiceInputSchema } from '@/domain'
import { FormField, useZodForm } from '@/shared/forms'
import { Button } from '@/shared/ui'
import { useCreateInvoice } from '../api/use-invoices'

export const InvoiceForm = ({ onDone }: { onDone: () => void }) => {
  const create = useCreateInvoice()
  const form = useZodForm(invoiceInputSchema, {
    defaultValues: { number: '', amount: 0, status: 'draft' },
  })

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => create.mutate(values, { onSuccess: onDone }))}
    >
      <FormField control={form.control} name="number" label="Number" placeholder="INV-001" />
      <FormField control={form.control} name="amount" label="Amount" type="number" />
      {create.isError ? (
        <p className="text-destructive text-sm">Could not save (admin only).</p>
      ) : null}
      <Button type="submit" disabled={create.isPending}>
        Save
      </Button>
    </form>
  )
}
```

- Validation is inferred from the schema; errors show inline under each field.
- `useZodForm` targets schemas without input/output transforms (the common case).
- Put dialogs in a Radix `Dialog` from `@/shared/ui` (see the users `UserDialog`).

Next: [The DataGrid →](./06-datagrid)
