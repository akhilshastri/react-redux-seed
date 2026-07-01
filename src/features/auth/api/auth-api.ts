import { type LoginInput, type Session, type User } from '@/domain'
import { httpClient } from '@/shared/api'

export const loginRequest = (input: LoginInput) =>
  httpClient<Session>('/auth/login', { method: 'POST', body: input })

export const refreshRequest = () => httpClient<Session>('/auth/refresh', { method: 'POST' })

export const meRequest = () => httpClient<User>('/auth/me')

export const logoutRequest = () => httpClient<void>('/auth/logout', { method: 'POST' })
