import { test, expect } from '@playwright/test'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'
import { createPasswordSetupToken } from '../../src/utils/passwordSetupToken'
import { comparePassword } from '../../src/utils/password'

// Covers TC-007..TC-010: one-time token use, expiry, and the "forgot
// password" request endpoint's found/not-found behavior.

test.describe('Password setup via email', () => {
  test('a valid token sets the new password and cannot be reused', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const { rawToken, tokenHash, expiresAt } = createPasswordSetupToken()
    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: expiresAt },
    })

    try {
      const firstUse = await request.post('/api/public/admin-password-setup', {
        data: { token: rawToken, newPassword: 'BrandNewPass123' },
      })
      expect(firstUse.status()).toBe(204)

      const updated = await prisma.adminAccount.findUniqueOrThrow({ where: { id: admin.id } })
      expect(await comparePassword('BrandNewPass123', updated.passwordHash)).toBe(true)
      expect(updated.passwordSetupTokenHash).toBeNull()

      const secondUse = await request.post('/api/public/admin-password-setup', {
        data: { token: rawToken, newPassword: 'AnotherPass123' },
      })
      expect(secondUse.status()).toBe(400)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('an expired token is rejected', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const { rawToken, tokenHash } = createPasswordSetupToken()
    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: new Date(Date.now() - 1000) },
    })

    try {
      const res = await request.post('/api/public/admin-password-setup', {
        data: { token: rawToken, newPassword: 'BrandNewPass123' },
      })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('a password shorter than 8 characters is rejected', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const { rawToken, tokenHash, expiresAt } = createPasswordSetupToken()
    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: expiresAt },
    })

    try {
      const res = await request.post('/api/public/admin-password-setup', {
        data: { token: rawToken, newPassword: 'short' },
      })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('requesting a reset for a personalEmail that exists sends a token and returns 200', async ({ request }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const personalEmail = `pw-personal-${admin.id}@test.local`
    await prisma.adminAccount.update({ where: { id: admin.id }, data: { personalEmail } })

    try {
      const res = await request.post('/api/public/admin-password-setup/request', { data: { personalEmail } })
      expect(res.status()).toBe(200)
      const updated = await prisma.adminAccount.findUniqueOrThrow({ where: { id: admin.id } })
      expect(updated.passwordSetupTokenHash).not.toBeNull()
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('requesting a reset for an unknown personalEmail returns 404 and does not reveal success', async ({ request }) => {
    const res = await request.post('/api/public/admin-password-setup/request', {
      data: { personalEmail: `no-such-admin-${Date.now()}@test.local` },
    })
    expect(res.status()).toBe(404)
  })
})
