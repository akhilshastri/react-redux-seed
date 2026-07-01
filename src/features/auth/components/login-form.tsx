import { loginInputSchema } from '@/domain'
import { FormField, useZodForm } from '@/shared/forms'
import { Button } from '@/shared/ui'

import { useLogin } from '../api/use-auth-mutations'

export const LoginForm = () => {
  const login = useLogin()
  const form = useZodForm(loginInputSchema, {
    defaultValues: { email: '', password: '' },
  })

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => login.mutate(values))}
    >
      <FormField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        placeholder="admin@example.com"
      />
      <FormField
        control={form.control}
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="password"
      />
      {login.isError ? (
        <p className="text-destructive text-sm">Invalid email or password.</p>
      ) : null}
      <Button type="submit" disabled={login.isPending}>
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
