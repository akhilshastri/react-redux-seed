import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'

import { ApiError } from './api-error'

/** Retry unless it's a 4xx (client) error — those won't succeed on retry. */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (import.meta.env.DEV) console.error('[query]', error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (import.meta.env.DEV) console.error('[mutation]', error)
    },
  }),
})
