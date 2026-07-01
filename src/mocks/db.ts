import { type Role, type User } from '@/domain'

interface Account extends User {
  password: string
}

/** Seed login accounts. Passwords are plain — this is a mock backend. */
const accounts: Account[] = [
  {
    id: 'u_admin',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['admin'],
    password: 'password',
  },
  {
    id: 'u_viewer',
    name: 'Viewer User',
    email: 'viewer@example.com',
    roles: ['viewer'],
    password: 'password',
  },
]

export const findAccountByEmail = (email: string): Account | undefined =>
  accounts.find((account) => account.email === email)

export const findAccountById = (id: string): Account | undefined =>
  accounts.find((account) => account.id === id)

export const toUser = (account: Account): User => ({
  id: account.id,
  name: account.name,
  email: account.email,
  roles: account.roles,
})

// --- Access tokens (stateless, self-describing: `at.<userId>.<expiryMs>`) ---

export const makeAccessToken = (userId: string, ttlMs = 15 * 60 * 1000): string =>
  `at.${userId}.${Date.now() + ttlMs}`

export const verifyAccessToken = (token: string | null | undefined): string | null => {
  if (!token) return null
  const [prefix, userId, expStr] = token.split('.')
  if (prefix !== 'at' || !userId) return null
  const exp = Number(expStr)
  if (!Number.isFinite(exp) || exp < Date.now()) return null
  return userId
}

export const authenticate = (request: Request): string | null => {
  const header = request.headers.get('Authorization')
  if (!header?.startsWith('Bearer ')) return null
  return verifyAccessToken(header.slice('Bearer '.length))
}

export const rolesFor = (userId: string): Role[] => findAccountById(userId)?.roles ?? []

// --- Users resource (CRUD, server-driven list) ---

const FIRST = [
  'Ada',
  'Alan',
  'Grace',
  'Linus',
  'Margaret',
  'Dennis',
  'Katherine',
  'Edsger',
  'Barbara',
  'Donald',
  'Ken',
  'Tim',
  'Guido',
  'Bjarne',
  'James',
  'Anders',
  'Brendan',
  'Rasmus',
  'John',
]
const LAST = [
  'Lovelace',
  'Turing',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Ritchie',
  'Johnson',
  'Dijkstra',
  'Liskov',
  'Knuth',
  'Thompson',
  'Berners-Lee',
  'van Rossum',
  'Stroustrup',
  'Gosling',
  'Eich',
]

const seedUsers = (): User[] => {
  const rows: User[] = []
  for (let i = 0; i < 203; i += 1) {
    const first = FIRST[i % FIRST.length] ?? 'Ada'
    const last = LAST[(i * 7) % LAST.length] ?? 'Turing'
    const role: Role = i % 5 === 0 ? 'admin' : 'viewer'
    const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, '')
    rows.push({
      id: `usr_${i + 1}`,
      name: `${first} ${last}`,
      email: `${handle}${i + 1}@example.com`,
      roles: [role],
    })
  }
  return rows
}

let users: User[] = seedUsers()

export interface ListUsersParams {
  search: string
  sortBy: string
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}

export interface ListUsersResult {
  rows: User[]
  total: number
  pageCount: number
}

const sortValue = (user: User, key: string): string =>
  key === 'email' ? user.email : key === 'role' ? (user.roles[0] ?? '') : user.name

export const listUsers = ({
  search,
  sortBy,
  sortDir,
  page,
  pageSize,
}: ListUsersParams): ListUsersResult => {
  let result = users
  const query = search.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }
  const dir = sortDir === 'asc' ? 1 : -1
  result = [...result].sort(
    (a, b) => sortValue(a, sortBy).localeCompare(sortValue(b, sortBy)) * dir,
  )

  const total = result.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = page * pageSize
  return { rows: result.slice(start, start + pageSize), total, pageCount }
}

export const createUser = (input: { name: string; email: string; role: Role }): User => {
  const user: User = {
    id: `usr_${Date.now().toString(36)}`,
    name: input.name,
    email: input.email,
    roles: [input.role],
  }
  users = [user, ...users]
  return user
}

export const updateUser = (
  id: string,
  input: { name: string; email: string; role: Role },
): User | undefined => {
  const current = users.find((user) => user.id === id)
  if (!current) return undefined
  current.name = input.name
  current.email = input.email
  current.roles = [input.role]
  return current
}

export const deleteUsers = (ids: string[]): void => {
  const set = new Set(ids)
  users = users.filter((user) => !set.has(user.id))
}

/**
 * Simulated httpOnly refresh cookie. A real app uses a server-set httpOnly
 * cookie; a browser-only MSW backend can't create one, so the "cookie" is the
 * mock backend's own persisted session store. The app never reads this key and
 * it never touches document.cookie — so the access token stays out of any
 * JS-readable storage, which is the property that matters.
 */
const REFRESH_KEY = '__rrs_mock_refresh_session__'

interface RefreshSession {
  userId: string
}

export const startRefreshSession = (userId: string): void => {
  try {
    localStorage.setItem(REFRESH_KEY, JSON.stringify({ userId } satisfies RefreshSession))
  } catch {
    // ignore
  }
}

export const readRefreshSession = (): RefreshSession | null => {
  try {
    const raw = localStorage.getItem(REFRESH_KEY)
    return raw ? (JSON.parse(raw) as RefreshSession) : null
  } catch {
    return null
  }
}

export const endRefreshSession = (): void => {
  try {
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // ignore
  }
}

/** Reset all in-memory + persisted mock state between tests. */
export const resetDb = (): void => {
  users = seedUsers()
  endRefreshSession()
}
