import { type User, type UserInput } from '@/domain'
import { httpClient } from '@/shared/api'

import { type UsersQueryParams } from './query-keys'

export interface UsersListResult {
  rows: User[]
  total: number
  pageCount: number
}

export const listUsers = (params: UsersQueryParams) => {
  const query = new URLSearchParams({
    search: params.search,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    page: String(params.page),
    pageSize: String(params.pageSize),
  })
  return httpClient<UsersListResult>(`/users?${query.toString()}`)
}

export const createUser = (input: UserInput) =>
  httpClient<User>('/users', { method: 'POST', body: input })

export const updateUser = (id: string, input: UserInput) =>
  httpClient<User>(`/users/${id}`, { method: 'PATCH', body: input })

export const bulkDeleteUsers = (ids: string[]) =>
  httpClient<void>('/users/bulk-delete', { method: 'POST', body: { ids } })
