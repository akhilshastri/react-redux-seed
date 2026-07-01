import { useState } from 'react'
import { z } from 'zod'

import { useHealthQuery } from '@/shared/api'
import { FormField, useZodForm } from '@/shared/forms'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

const demoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email'),
})
type DemoValues = z.infer<typeof demoSchema>

export const HomePage = () => {
  const health = useHealthQuery()
  const [submitted, setSubmitted] = useState<DemoValues | null>(null)
  const form = useZodForm(demoSchema, { defaultValues: { name: '', email: '' } })

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Phase 1 — core integrations</CardTitle>
          <CardDescription>
            Redux store, TanStack Query (MSW), forms, theming, router.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <span className="text-muted-foreground">Health query (MSW): </span>
          {health.isPending ? (
            <span className="text-muted-foreground">loading…</span>
          ) : health.isError ? (
            <span className="text-destructive">error</span>
          ) : (
            <span className="font-medium text-green-600 dark:text-green-400">
              {health.data.status}
            </span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo form (React Hook Form + Zod)</CardTitle>
          <CardDescription>Validates on submit; shows inline errors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid max-w-sm gap-4"
            noValidate
            onSubmit={form.handleSubmit((values) => setSubmitted(values))}
          >
            <FormField control={form.control} name="name" label="Name" placeholder="Ada Lovelace" />
            <FormField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="ada@example.com"
            />
            <Button type="submit">Submit</Button>
            {submitted ? (
              <p className="text-muted-foreground text-sm">
                Submitted: {submitted.name} · {submitted.email}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
