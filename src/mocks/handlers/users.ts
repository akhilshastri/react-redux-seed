import { HttpResponse, http } from 'msw'

import { type Permission, hasPermission, userInputSchema } from '@/domain'

import { authenticate, createUser, deleteUsers, listUsers, rolesFor, updateUser } from '../db'

/** 401 if unauthenticated, 403 if the token's roles lack the permission. */
const guard = (request: Request, permission: Permission): Response | null => {
  const userId = authenticate(request)
  if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(rolesFor(userId), permission)) {
    return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
  }
  return null
}

export const usersHandlers = [
  http.get('/api/users', ({ request }) => {
    if (!authenticate(request)) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const result = listUsers({
      search: url.searchParams.get('search') ?? '',
      sortBy: url.searchParams.get('sortBy') ?? 'name',
      sortDir: url.searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc',
      page: Number(url.searchParams.get('page') ?? 0),
      pageSize: Number(url.searchParams.get('pageSize') ?? 25),
    })
    return HttpResponse.json(result)
  }),

  http.post('/api/users', async ({ request }) => {
    const denied = guard(request, 'users.create')
    if (denied) return denied
    const parsed = userInputSchema.safeParse(await request.json())
    if (!parsed.success) return HttpResponse.json({ message: 'Invalid input' }, { status: 400 })
    return HttpResponse.json(createUser(parsed.data), { status: 201 })
  }),

  http.patch('/api/users/:id', async ({ request, params }) => {
    const denied = guard(request, 'users.update')
    if (denied) return denied
    const parsed = userInputSchema.safeParse(await request.json())
    if (!parsed.success) return HttpResponse.json({ message: 'Invalid input' }, { status: 400 })
    const updated = updateUser(String(params.id), parsed.data)
    if (!updated) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(updated)
  }),

  http.post('/api/users/bulk-delete', async ({ request }) => {
    const denied = guard(request, 'users.delete')
    if (denied) return denied
    const body = (await request.json()) as { ids?: string[] }
    deleteUsers(body.ids ?? [])
    return new HttpResponse(null, { status: 204 })
  }),
]
