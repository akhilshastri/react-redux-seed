import { HttpResponse, http } from 'msw'

import { loginInputSchema } from '@/domain'

import {
  authenticate,
  endRefreshSession,
  findAccountByEmail,
  findAccountById,
  makeAccessToken,
  readRefreshSession,
  startRefreshSession,
  toUser,
} from '../db'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const parsed = loginInputSchema.safeParse(await request.json())
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid input' }, { status: 400 })
    }
    const account = findAccountByEmail(parsed.data.email)
    if (!account || account.password !== parsed.data.password) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }
    startRefreshSession(account.id)
    return HttpResponse.json({ accessToken: makeAccessToken(account.id), user: toUser(account) })
  }),

  http.post('/api/auth/refresh', () => {
    const session = readRefreshSession()
    const account = session ? findAccountById(session.userId) : undefined
    if (!account) {
      return HttpResponse.json({ message: 'Session expired' }, { status: 401 })
    }
    return HttpResponse.json({ accessToken: makeAccessToken(account.id), user: toUser(account) })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const userId = authenticate(request)
    const account = userId ? findAccountById(userId) : undefined
    if (!account) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(toUser(account))
  }),

  http.post('/api/auth/logout', () => {
    endRefreshSession()
    return new HttpResponse(null, { status: 204 })
  }),
]
