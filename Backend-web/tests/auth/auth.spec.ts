import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, createFixtureAdminWithPassword, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('POST /api/auth/login', () => {
  test('correct email and password returns the user and sets a session cookie', async ({ request }) => {
    const admin = await createFixtureAdminWithPassword('sales_staff', 'fixturepass123')
    try {
      const res = await request.post('/api/auth/login', {
        data: { identifier: admin.email, password: 'fixturepass123' },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.user.id).toBe(admin.id)
      expect(res.headers()['set-cookie']).toContain('bvm_session=')
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('wrong password is rejected with a generic message (no detail on which field was wrong)', async ({
    request,
  }) => {
    const admin = await createFixtureAdminWithPassword('sales_staff', 'fixturepass123')
    try {
      const res = await request.post('/api/auth/login', {
        data: { identifier: admin.email, password: 'wrongpassword' },
      })
      expect(res.status()).toBe(401)
      expect((await res.json()).message).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('an unknown email is rejected with the same generic message', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { identifier: 'does-not-exist@test.local', password: 'whatever123' },
    })
    expect(res.status()).toBe(401)
    expect((await res.json()).message).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  })

  test('a successful login records a login-history entry', async ({ request }) => {
    const admin = await createFixtureAdminWithPassword('sales_staff', 'fixturepass123')
    try {
      await request.post('/api/auth/login', { data: { identifier: admin.email, password: 'fixturepass123' } })
      const history = await prisma.adminLoginHistory.findMany({ where: { adminId: admin.id } })
      expect(history.length).toBe(1)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })
})

test.describe('GET /api/auth/me', () => {
  test('a valid session cookie returns the current user', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    try {
      const res = await request.get('/api/auth/me', {
        headers: { Cookie: sessionCookieHeader(admin.id, admin.role) },
      })
      expect(res.status()).toBe(200)
      expect((await res.json()).user.id).toBe(admin.id)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('no session cookie is unauthorized', async ({ request }) => {
    const res = await request.get('/api/auth/me')
    expect(res.status()).toBe(401)
  })
})

test.describe('POST /api/auth/logout', () => {
  test('clears the session cookie', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    try {
      const res = await request.post('/api/auth/logout', {
        headers: { Cookie: sessionCookieHeader(admin.id, admin.role) },
      })
      expect(res.status()).toBe(204)
      expect(res.headers()['set-cookie']).toMatch(/bvm_session=;/)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })
})
