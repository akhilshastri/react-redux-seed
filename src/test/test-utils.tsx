import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import { type ReactElement, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { makeStore } from '@/app/store'

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string
}

/** Render with a FRESH store + query client per test (never the app singleton). */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: Options = {},
) => {
  const store = makeStore(undefined)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    </Provider>
  )

  return { store, queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}
