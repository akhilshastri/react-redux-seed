import { describe, expect, it } from 'vitest'

import { hasPermission } from './rbac'

describe('hasPermission', () => {
  it('grants admin every permission', () => {
    expect(hasPermission(['admin'], 'users.delete')).toBe(true)
    expect(hasPermission(['admin'], 'admin.access')).toBe(true)
  })

  it('limits viewer to reads', () => {
    expect(hasPermission(['viewer'], 'users.read')).toBe(true)
    expect(hasPermission(['viewer'], 'users.create')).toBe(false)
    expect(hasPermission(['viewer'], 'admin.access')).toBe(false)
  })

  it('is false with no roles', () => {
    expect(hasPermission([], 'users.read')).toBe(false)
  })
})
