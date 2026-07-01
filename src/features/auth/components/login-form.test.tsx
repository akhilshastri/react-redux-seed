import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/test-utils'

import { LoginForm } from './login-form'

describe('LoginForm', () => {
  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument()
  })

  it('authenticates with valid credentials against MSW', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(store.getState().auth.status).toBe('authenticated'))
    expect(store.getState().auth.user?.email).toBe('admin@example.com')
  })
})
