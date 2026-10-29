import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('Banner management — create, list, edit', () => {
  test('content_moderator can create a banner through the form, see it in the list, and edit it', async ({
    page,
    context,
  }) => {
    const moderator = await createFixtureAdmin('content_moderator')
    const name = `Fixture Banner ${Date.now()}`
    let bannerId: string | undefined
    try {
      await loginAs(context, moderator.id, moderator.role)
      await page.goto('/manage/banners/new')

      await page.getByPlaceholder('เช่น โปรโมชั่น Summer Sale 2024').fill(name)
      await page.getByPlaceholder('เช่น /promotion/summer').fill('https://example.com')
      await page.locator('input[type="date"]').first().fill('2026-01-01')
      await page.locator('input[type="date"]').nth(1).fill('2026-12-31')
      await page.getByRole('button', { name: 'เพิ่มแบนเนอร์ใหม่' }).click()

      await expect(page).toHaveURL(/\/manage\/banners$/)
      await expect(page.getByText(name)).toBeVisible()

      const created = await prisma.banner.findFirstOrThrow({ where: { name } })
      bannerId = created.id

      await page.getByRole('row', { name: new RegExp(name) }).getByLabel('แก้ไข').click()
      await expect(page.locator('input[name="name"]')).toHaveValue(name)
      const updatedName = `${name} Updated`
      await page.fill('input[name="name"]', updatedName)
      await page.getByRole('button', { name: /บันทึก/ }).click()
      await expect(page).toHaveURL(/\/manage\/banners$/)
      await expect(page.getByText(updatedName)).toBeVisible()
    } finally {
      if (bannerId) await prisma.banner.deleteMany({ where: { id: bannerId } })
      await deleteFixtureAdmin(moderator.id)
    }
  })

  test('a non-content role is forbidden from the banner pages', async ({ page, context }) => {
    const staff = await createFixtureAdmin('sales_staff')
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto('/manage/banners')
      await expect(page.getByText('ไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeVisible()
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })
})
