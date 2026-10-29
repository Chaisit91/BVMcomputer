import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('User management — create, list, edit', () => {
  test('sales_staff can create a new user through the form, see it in the list, and edit it', async ({
    page,
    context,
  }) => {
    const staff = await createFixtureAdmin('sales_staff')
    const suffix = Date.now()
    const username = `pw-ui-user-${suffix}`
    let customerId: string | undefined
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto('/manage/users/new')
      await expect(page.getByRole('heading', { name: 'เพิ่มผู้ใช้งานใหม่ (Add New User)' })).toBeVisible()

      await page.getByPlaceholder('เช่น สมชาย รักดี').fill('Fixture Buyer')
      await page.getByPlaceholder('เช่น somchai_r').fill(username)
      await page.getByPlaceholder('เช่น somchai@email.com').fill(`${username}@test.local`)
      await page.getByPlaceholder('เช่น 081-234-5678').fill('0000000000')
      await page.getByPlaceholder('กรอกที่อยู่สำหรับจัดส่งสินค้าของลูกค้ารายนี้...').fill('123 Fixture Rd.')
      await page.getByRole('button', { name: 'เพิ่มผู้ใช้งานใหม่' }).click()

      await expect(page).toHaveURL(/\/manage\/users$/)
      await expect(page.getByText('Fixture Buyer')).toBeVisible()

      const created = await prisma.customer.findUniqueOrThrow({ where: { username } })
      customerId = created.id
      // customerCode is generated server-side (never collected by this form) —
      // confirms the account was actually persisted, not silently dropped.
      expect(created.customerCode).toMatch(/^CUS-/)

      await page.getByText('Fixture Buyer').click()
      await expect(page.locator('input[name="fullName"]')).toHaveValue('Fixture Buyer')
      await page.fill('input[name="fullName"]', 'Updated Buyer Name')
      await page.getByRole('button', { name: /บันทึก/ }).click()
      await expect(page).toHaveURL(/\/manage\/users$/)
      await expect(page.getByText('Updated Buyer Name')).toBeVisible()
    } finally {
      if (customerId) await prisma.customer.deleteMany({ where: { id: customerId } })
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('a non-sales role is forbidden from the user management pages', async ({ page, context }) => {
    const manager = await createFixtureAdmin('inventory_manager')
    try {
      await loginAs(context, manager.id, manager.role)
      await page.goto('/manage/users')
      await expect(page.getByText('ไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeVisible()
    } finally {
      await deleteFixtureAdmin(manager.id)
    }
  })
})
