import { test, expect } from '@playwright/test'
import { createFixtureAdminWithPassword, deleteFixtureAdmin } from '../support/fixtures'

// The one flow every other test in this suite deliberately bypasses (via
// loginAs's signed-cookie injection) — this is the only place the real
// LoginPage form and /api/auth/login are driven end to end.

test.describe('Login page', () => {
  test('correct credentials log the admin in and land on the dashboard', async ({ page }) => {
    const admin = await createFixtureAdminWithPassword('sales_staff', 'fixturepass123')
    try {
      await page.goto('/login')
      await page.getByPlaceholder('กรอกอีเมลหรือชื่อผู้ใช้').fill(admin.email)
      await page.getByPlaceholder('กรอกรหัสผ่าน').fill('fixturepass123')
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      await expect(page).toHaveURL(/\/dashboard$/)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('wrong password shows a generic error and does not log in', async ({ page }) => {
    const admin = await createFixtureAdminWithPassword('sales_staff', 'fixturepass123')
    try {
      await page.goto('/login')
      await page.getByPlaceholder('กรอกอีเมลหรือชื่อผู้ใช้').fill(admin.email)
      await page.getByPlaceholder('กรอกรหัสผ่าน').fill('totallyWrongPassword')
      await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()

      await expect(page.getByRole('alert')).toHaveText('เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง')
      await expect(page).toHaveURL(/\/login$/)
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('visiting a protected page while logged out redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })
})
