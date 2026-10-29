import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, createFixtureOrder, deleteFixtureOrder } from '../support/fixtures'

test.describe('Order management — view and update', () => {
  test('sales_staff can see an order in the list and update its payment/fulfillment status', async ({
    page,
    context,
  }) => {
    const staff = await createFixtureAdmin('sales_staff')
    const order = await createFixtureOrder()
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto('/manage/orders')
      await expect(page.getByText(order.orderCode)).toBeVisible()

      await page.goto(`/manage/orders/${order.id}/edit`)
      await page.locator('select').nth(1).selectOption('paid') // paymentStatus
      await page.locator('select').nth(2).selectOption('preparing') // orderStatus — requires paid first
      await page.getByPlaceholder('-').fill('TRACK-FIXTURE-123')
      await page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }).click()

      await expect(page).toHaveURL(/\/manage\/orders$/)

      await page.goto(`/manage/orders/${order.id}/edit`)
      await expect(page.getByPlaceholder('-')).toHaveValue('TRACK-FIXTURE-123')
    } finally {
      await deleteFixtureOrder(order.id)
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('a non-sales role is forbidden from the order pages', async ({ page, context }) => {
    const manager = await createFixtureAdmin('inventory_manager')
    try {
      await loginAs(context, manager.id, manager.role)
      await page.goto('/manage/orders')
      await expect(page.getByText('ไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeVisible()
    } finally {
      await deleteFixtureAdmin(manager.id)
    }
  })
})
