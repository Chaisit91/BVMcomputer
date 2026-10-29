import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin } from '../support/fixtures'

// DashboardPage branches hard on role (DashboardPage.tsx): super_admin gets
// the full analytics dashboard (pulls from every department's endpoints,
// each individually role-gated on the backend); every other role gets
// DepartmentOverviewPage instead, specifically because those same backend
// calls would 403 for them.

test.describe('Dashboard — role-based view', () => {
  test('super_admin sees the full analytics dashboard', async ({ page, context }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    try {
      await loginAs(context, superAdmin.id, superAdmin.role)
      await page.goto('/dashboard')
      // The full dashboard fans out to every department's list endpoint plus
      // orders (DashboardPage.tsx) — comfortably over the default 5s on a
      // cold load, so give it real room instead of a flaky tight timeout.
      await expect(page.getByRole('heading', { name: 'สวัสดี, แอดมิน' })).toBeVisible({ timeout: 15_000 })
    } finally {
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  const departmentRoles: { role: 'inventory_manager' | 'sales_staff' | 'content_moderator'; title: string }[] = [
    { role: 'inventory_manager', title: 'ฝ่ายคลังสินค้า' },
    { role: 'sales_staff', title: 'ฝ่ายคำสั่งซื้อและบริการลูกค้า' },
    { role: 'content_moderator', title: 'ฝ่ายเนื้อหาและโปรโมชั่น' },
  ]

  for (const { role, title } of departmentRoles) {
    test(`${role} sees their own department overview instead of the full dashboard`, async ({ page, context }) => {
      const admin = await createFixtureAdmin(role)
      try {
        await loginAs(context, admin.id, admin.role)
        await page.goto('/dashboard')
        await expect(page.getByRole('heading', { name: title })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'สวัสดี, แอดมิน' })).toHaveCount(0)
      } finally {
        await deleteFixtureAdmin(admin.id)
      }
    })
  }
})
