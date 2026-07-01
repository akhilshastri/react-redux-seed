import { z } from 'zod'

import { type UserInput, userSchema } from '@/domain'
import { httpClient } from '@/shared/api'

import { type UsersQueryParams } from './query-keys'

export const usersListSchema = z.object({
  rows: z.array(userSchema),
  total: z.number().int().nonnegative(),
  pageCount: z.number().int().positive(),
})
export type UsersListResult = z.infer<typeof usersListSchema>

export const listUsers = (params: UsersQueryParams) => {
  const query = new URLSearchParams({
    search: params.search,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  return httpClient<UsersListResult>(`/users?${query.toString()}`, { schema: usersListSchema })
}

export const createUser = (input: UserInput) =>
  httpClient('/users', { method: 'POST', body: input, schema: userSchema })

export const updateUser = (id: string, input: UserInput) =>
  httpClient(`/users/${id}`, { method: 'PATCH', body: input, schema: userSchema })

export const bulkDeleteUsers = (ids: string[]) =>
  httpClient<void>('/users/bulk-delete', { method: 'POST', body: { ids } })
