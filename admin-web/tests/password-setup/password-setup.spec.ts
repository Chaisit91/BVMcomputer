import { test, expect } from '@playwright/test'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'
// Reused directly from Backend-web rather than reimplementing the same
// sha256 token hashing a second time in this project.
import { createPasswordSetupToken } from '../../../Backend-web/src/utils/passwordSetupToken'

test.describe('Forgot password page', () => {
  test('a personalEmail that exists in the system shows the success message', async ({ page }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const personalEmail = `pw-ui-personal-${admin.id}@test.local`
    await prisma.adminAccount.update({ where: { id: admin.id }, data: { personalEmail } })

    try {
      await page.goto('/forgot-password')
      await page.getByPlaceholder('your.name@gmail.com').fill(personalEmail)
      await page.getByRole('button', { name: 'ส่งลิงก์ตั้งรหัสผ่านใหม่' }).click()
      await expect(page.getByText(/ส่งลิงก์สำหรับตั้งรหัสผ่าน/)).toBeVisible()
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('a personalEmail that does not exist shows a not-found error, not a fake success', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByPlaceholder('your.name@gmail.com').fill(`no-such-admin-${Date.now()}@test.local`)
    await page.getByRole('button', { name: 'ส่งลิงก์ตั้งรหัสผ่านใหม่' }).click()
    await expect(page.getByRole('alert')).toContainText('ไม่มีอีเมลนี้อยู่ในระบบ')
  })
})

test.describe('Set password page', () => {
  test('a valid token lets the user set a new password and shows the success state', async ({ page }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const { rawToken, tokenHash, expiresAt } = createPasswordSetupToken()
    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: expiresAt },
    })

    try {
      await page.goto(`/set-password?token=${rawToken}`)
      await page.getByPlaceholder('กรอกรหัสผ่านใหม่', { exact: true }).fill('BrandNewPass123')
      await page.getByPlaceholder('กรอกรหัสผ่านใหม่อีกครั้ง').fill('BrandNewPass123')
      await page.getByRole('button', { name: 'ตั้งรหัสผ่าน' }).click()
      await expect(page.getByText('ตั้งรหัสผ่านสำเร็จแล้ว')).toBeVisible()
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('an invalid or expired token shows an error instead of letting the form submit silently', async ({ page }) => {
    await page.goto('/set-password?token=not-a-real-token')
    await page.getByPlaceholder('กรอกรหัสผ่านใหม่', { exact: true }).fill('BrandNewPass123')
    await page.getByPlaceholder('กรอกรหัสผ่านใหม่อีกครั้ง').fill('BrandNewPass123')
    await page.getByRole('button', { name: 'ตั้งรหัสผ่าน' }).click()
    await expect(page.getByRole('alert')).toContainText('ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว')
  })
})
