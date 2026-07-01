import { useQuery } from '@tanstack/react-query'

import { httpClient } from './http-client'

export interface HealthResponse {
  status: string
}

/** Demo query that resolves against the MSW `GET /api/health` handler. */
export const useHealthQuery = () =>
  useQuery({
    queryKey: ['health'],
    queryFn: () => httpClient<HealthResponse>('/health'),
  })
