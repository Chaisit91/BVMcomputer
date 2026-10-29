import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('Admin accounts — list and create', () => {
  test('super_admin can create a new admin account through the form and see it in the list', async ({
    page,
    context,
  }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    const suffix = Date.now()
    const email = `pw-ui-newadmin-${suffix}@test.local`
    const personalEmail = `pw-ui-newadmin-personal-${suffix}@test.local`
    let newAdminId: string | undefined
    try {
      await loginAs(context, superAdmin.id, superAdmin.role)
      await page.goto('/admins')
      await expect(page.getByRole('heading', { name: 'บัญชีผู้ดูแล (Admin Accounts)' })).toBeVisible()

      await page.getByRole('link', { name: 'เพิ่มผู้ดูแลใหม่' }).click()
      await expect(page).toHaveURL(/\/admins\/new$/)

      await page.getByPlaceholder('กรอกชื่อ').fill('New')
      await page.getByPlaceholder('กรอกนามสกุล').fill('Fixture Admin')
      await page.getByPlaceholder('example@bvm.com').fill(email)
      await page.getByPlaceholder('your.name@gmail.com').fill(personalEmail)
      await page.getByPlaceholder('0XX-XXX-XXXX').fill('0000000000')
      await page.locator('select[name="role"]').selectOption('sales_staff')
      await page.locator('input[type="password"]').first().fill('fixturepass123')
      await page.locator('input[type="password"]').nth(1).fill('fixturepass123')
      await page.getByRole('button', { name: 'สร้างบัญชีผู้ดูแล' }).click()

      await expect(page).toHaveURL(/\/admins$/)
      await expect(page.getByText('New Fixture Admin')).toBeVisible()

      const created = await prisma.adminAccount.findUniqueOrThrow({ where: { email } })
      newAdminId = created.id
    } finally {
      if (newAdminId) await deleteFixtureAdmin(newAdminId)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test('a non-super_admin role can view the admin list but not create a new account', async ({ page, context }) => {
    const staff = await createFixtureAdmin('sales_staff')
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto('/admins')
      await expect(page.getByRole('heading', { name: 'ทีมของฉัน (My Team)' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'เพิ่มผู้ดูแลใหม่' })).toHaveCount(0)

      await page.goto('/admins/new')
      await expect(page.getByText('ไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeVisible()
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })
})
