import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

// Covers the three "จัดการ" (manage) modules: customers (ผู้ใช้งาน), orders,
// and banners. All three are mounted under a single role per index.ts
// (`sales` for customers/orders, `content` for banners) — RBAC is identical
// within each module, so one create/read/update/delete round trip plus one
// cross-role 403 check is representative.

test.describe('Customers — CRUD + RBAC', () => {
  test('sales_staff can create, read, update, and delete a customer', async ({ request }) => {
    const staff = await createFixtureAdmin('sales_staff')
    let createdId: string | undefined
    try {
      const suffix = Date.now()
      const createRes = await request.post('/api/customers', {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        data: {
          customerCode: `FIX-${suffix}`,
          fullName: 'Fixture Customer',
          username: `fix-customer-${suffix}`,
          email: `fix-customer-${suffix}@test.local`,
          phone: '0000000000',
        },
      })
      expect(createRes.status()).toBe(201)
      const created = await createRes.json()
      createdId = created.id

      const updateRes = await request.put(`/api/customers/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        data: { fullName: 'Updated Customer' },
      })
      expect(updateRes.status()).toBe(200)
      expect((await updateRes.json()).fullName).toBe('Updated Customer')

      const deleteRes = await request.delete(`/api/customers/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
      })
      expect(deleteRes.status()).toBe(204)
      createdId = undefined
    } finally {
      if (createdId) await prisma.customer.deleteMany({ where: { id: createdId } })
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('a non-sales role is forbidden', async ({ request }) => {
    const manager = await createFixtureAdmin('inventory_manager')
    try {
      const res = await request.get('/api/customers', {
        headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(manager.id)
    }
  })
})

test.describe('Orders — CRUD + RBAC', () => {
  test('sales_staff can create, read, update, and delete an order', async ({ request }) => {
    const staff = await createFixtureAdmin('sales_staff')
    let createdId: string | undefined
    try {
      const orderCode = `FIX-ORDER-${Date.now()}`
      const createRes = await request.post('/api/orders', {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        data: {
          orderCode,
          customerName: 'Fixture Buyer',
          customerPhone: '0000000000',
          shippingAddress: '123 Fixture Rd.',
          postalCode: '10000',
          province: 'Bangkok',
          district: 'Fixture District',
          subdistrict: 'Fixture Subdistrict',
          paymentMethod: 'bank_transfer',
        },
      })
      expect(createRes.status()).toBe(201)
      const created = await createRes.json()
      createdId = created.id
      expect(created.orderCode).toBe(orderCode)

      const updateRes = await request.put(`/api/orders/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        data: { status: 'preparing', trackingNumber: 'TRACK-123' },
      })
      expect(updateRes.status()).toBe(200)
      const updated = await updateRes.json()
      expect(updated.status).toBe('preparing')
      expect(updated.trackingNumber).toBe('TRACK-123')

      const deleteRes = await request.delete(`/api/orders/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
      })
      expect(deleteRes.status()).toBe(204)
      createdId = undefined
    } finally {
      if (createdId) await prisma.order.deleteMany({ where: { id: createdId } })
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('a non-sales role is forbidden', async ({ request }) => {
    const manager = await createFixtureAdmin('inventory_manager')
    try {
      const res = await request.get('/api/orders', {
        headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(manager.id)
    }
  })
})

test.describe('Banners — CRUD + RBAC', () => {
  test('content_moderator can create, read, update, and delete a banner', async ({ request }) => {
    const moderator = await createFixtureAdmin('content_moderator')
    let createdId: string | undefined
    try {
      const createRes = await request.post('/api/banners', {
        headers: { Cookie: sessionCookieHeader(moderator.id, moderator.role) },
        data: {
          name: 'Fixture Banner',
          type: 'hero',
          targetLink: 'https://example.com',
          startDate: '2026-01-01T00:00:00.000Z',
          endDate: '2026-12-31T00:00:00.000Z',
        },
      })
      expect(createRes.status()).toBe(201)
      const created = await createRes.json()
      createdId = created.id

      const updateRes = await request.put(`/api/banners/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(moderator.id, moderator.role) },
        data: { name: 'Updated Banner' },
      })
      expect(updateRes.status()).toBe(200)
      expect((await updateRes.json()).name).toBe('Updated Banner')

      const deleteRes = await request.delete(`/api/banners/${createdId}`, {
        headers: { Cookie: sessionCookieHeader(moderator.id, moderator.role) },
      })
      expect(deleteRes.status()).toBe(204)
      createdId = undefined
    } finally {
      if (createdId) await prisma.banner.deleteMany({ where: { id: createdId } })
      await deleteFixtureAdmin(moderator.id)
    }
  })

  test('a bare yyyy-mm-dd date (what the <input type="date"> form field sends) is accepted', async ({ request }) => {
    const moderator = await createFixtureAdmin('content_moderator')
    let createdId: string | undefined
    try {
      const createRes = await request.post('/api/banners', {
        headers: { Cookie: sessionCookieHeader(moderator.id, moderator.role) },
        data: {
          name: 'Bare Date Banner',
          type: 'popup',
          targetLink: 'https://example.com',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      })
      expect(createRes.status()).toBe(201)
      createdId = (await createRes.json()).id
    } finally {
      if (createdId) await prisma.banner.deleteMany({ where: { id: createdId } })
      await deleteFixtureAdmin(moderator.id)
    }
  })

  test('endDate before startDate is rejected', async ({ request }) => {
    const moderator = await createFixtureAdmin('content_moderator')
    try {
      const res = await request.post('/api/banners', {
        headers: { Cookie: sessionCookieHeader(moderator.id, moderator.role) },
        data: {
          name: 'Invalid Banner',
          type: 'promo',
          targetLink: 'https://example.com',
          startDate: '2026-12-31T00:00:00.000Z',
          endDate: '2026-01-01T00:00:00.000Z',
        },
      })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureAdmin(moderator.id)
    }
  })

  test('a non-content role is forbidden', async ({ request }) => {
    const manager = await createFixtureAdmin('inventory_manager')
    try {
      const res = await request.get('/api/banners', {
        headers: { Cookie: sessionCookieHeader(manager.id, manager.role) },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(manager.id)
    }
  })
})
