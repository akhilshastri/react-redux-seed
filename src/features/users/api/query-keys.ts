import { type SortDir } from '../store/users-slice'

export interface UsersQueryParams {
  search: string
  sortBy: string
  sortDir: SortDir
  page: number
  pageSize: number
}

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...userKeys.lists(), params] as const,
}
