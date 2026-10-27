import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

// Covers TC-001..TC-005 from the project's test case matrix: team-lead /
// peer-team-lead / self-only / super_admin edit boundaries on AdminAccount.

test.describe('Admin RBAC — editing accounts', () => {
  test('team lead can edit general fields of a regular teammate in the same department', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      const res = await request.put(`/api/admins/${staff.id}`, {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        data: { firstName: 'Updated' },
      })
      expect(res.status()).toBe(200)
      expect((await res.json()).firstName).toBe('Updated')
    } finally {
      await deleteFixtureAdmin(staff.id)
      await deleteFixtureAdmin(lead.id)
    }
  })

  test('team lead cannot change a teammate email, personalEmail, or password', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      const res = await request.put(`/api/admins/${staff.id}`, {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        data: { email: 'hijacked@test.local', personalEmail: 'hijacked@gmail.com', password: 'hijacked123' },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.email).toBe(staff.email) // unchanged — field was stripped server-side
      expect(body.personalEmail).toBe(staff.personalEmail)
    } finally {
      await deleteFixtureAdmin(staff.id)
      await deleteFixtureAdmin(lead.id)
    }
  })

  test('team lead cannot touch another team lead at all (peer team lead)', async ({ request }) => {
    const lead1 = await createFixtureAdmin('sales_staff', true)
    const lead2 = await createFixtureAdmin('sales_staff', true)
    try {
      const res = await request.put(`/api/admins/${lead2.id}`, {
        headers: { Cookie: sessionCookieHeader(lead1.id, lead1.role) },
        data: { firstName: 'ShouldNotApply' },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(lead1.id)
      await deleteFixtureAdmin(lead2.id)
    }
  })

  test('regular staff cannot edit a teammate (only self)', async ({ request }) => {
    const staff1 = await createFixtureAdmin('sales_staff', false)
    const staff2 = await createFixtureAdmin('sales_staff', false)
    try {
      const resOther = await request.put(`/api/admins/${staff2.id}`, {
        headers: { Cookie: sessionCookieHeader(staff1.id, staff1.role) },
        data: { firstName: 'Nope' },
      })
      expect(resOther.status()).toBe(403)

      const resSelf = await request.put(`/api/admins/${staff1.id}`, {
        headers: { Cookie: sessionCookieHeader(staff1.id, staff1.role) },
        data: { firstName: 'SelfEditOk' },
      })
      expect(resSelf.status()).toBe(200)
      expect((await resSelf.json()).firstName).toBe('SelfEditOk')
    } finally {
      await deleteFixtureAdmin(staff1.id)
      await deleteFixtureAdmin(staff2.id)
    }
  })

  test('regular staff editing themselves cannot change role or isTeamLead', async ({ request }) => {
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      const res = await request.put(`/api/admins/${staff.id}`, {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        data: { isTeamLead: true, role: 'super_admin' },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(body.isTeamLead).toBe(false)
      expect(body.role).toBe('sales_staff')
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('super_admin can edit any account across departments', async ({ request }) => {
    const superAdmin = await createFixtureAdmin('super_admin', false)
    const staff = await createFixtureAdmin('inventory_manager', false)
    try {
      const res = await request.put(`/api/admins/${staff.id}`, {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
        data: { firstName: 'ChangedBySuperAdmin' },
      })
      expect(res.status()).toBe(200)
      expect((await res.json()).firstName).toBe('ChangedBySuperAdmin')
    } finally {
      await deleteFixtureAdmin(staff.id)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test('only super_admin can create new admin accounts', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    try {
      const res = await request.post('/api/admins', {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        data: {
          firstName: 'Blocked',
          lastName: 'Create',
          email: 'blocked-create@test.local',
          phone: '0000000000',
          password: 'whatever123',
          role: 'sales_staff',
        },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(lead.id)
      await prisma.adminAccount.deleteMany({ where: { email: 'blocked-create@test.local' } })
    }
  })

  test('only super_admin can delete admin accounts', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      const res = await request.delete(`/api/admins/${staff.id}`, {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(staff.id)
      await deleteFixtureAdmin(lead.id)
    }
  })
})
