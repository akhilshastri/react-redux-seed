import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { type UserInput } from '@/domain'

import { type UsersQueryParams, userKeys } from './query-keys'
import { bulkDeleteUsers, createUser, listUsers, updateUser } from './users-api'

export const useUsers = (params: UsersQueryParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UserInput) => createUser(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UserInput }) => updateUser(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export const useDeleteUsers = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteUsers(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}
