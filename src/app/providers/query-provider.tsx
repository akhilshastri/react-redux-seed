import { QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, Suspense, lazy } from 'react'

import { queryClient } from '@/shared/api'

// Dev-only + lazy: the ternary's import() is dead-code-eliminated from prod.
const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : null

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools initialIsOpen={false} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  )
}
