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
