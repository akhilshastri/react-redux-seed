import { type LoginInput, type Session, type User, sessionSchema, userSchema } from '@/domain'
import { httpClient } from '@/shared/api'

export const loginRequest = (input: LoginInput) =>
  httpClient<Session>('/auth/login', { method: 'POST', body: input, schema: sessionSchema })

export const refreshRequest = () =>
  httpClient<Session>('/auth/refresh', { method: 'POST', schema: sessionSchema })

export const meRequest = () => httpClient<User>('/auth/me', { schema: userSchema })

export const logoutRequest = () => httpClient<void>('/auth/logout', { method: 'POST' })
