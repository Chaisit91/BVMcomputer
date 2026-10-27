import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, createFixtureCustomer, deleteFixtureCustomer, prisma } from '../support/fixtures'

test.describe('Customer chat — UI', () => {
  test('a new customer message shows up in the chat list, and replying shows the real admin name', async ({
    page,
    context,
    request,
  }) => {
    const admin = await createFixtureAdmin('sales_staff')
    const customer = await createFixtureCustomer()
    try {
      await request.post(`http://localhost:8080/api/public/chats/${customer.id}/messages`, {
        data: { content: 'มีการ์ดจอรุ่นนี้ในสต็อกไหมครับ' },
      })

      await loginAs(context, admin.id, admin.role)
      await page.goto('/manage/chats')
      await expect(page.getByText(customer.fullName)).toBeVisible()

      await page.getByText(customer.fullName).click()
      await expect(page.getByText('มีการ์ดจอรุ่นนี้ในสต็อกไหมครับ')).toBeVisible()

      await page.getByPlaceholder('พิมพ์ข้อความตอบลูกค้า...').fill('มีครับ พร้อมส่ง')
      await page.getByLabel('ส่งข้อความ').click()

      await expect(page.getByText('มีครับ พร้อมส่ง')).toBeVisible()
      // The admin's real name is shown above their own reply bubble — this
      // is the "who actually answered" traceability, not the chat text itself.
      // Scoped to <main> since the same name also appears in the Topbar's
      // own account menu.
      await expect(page.locator('main').getByText(`${admin.firstName} ${admin.lastName}`)).toBeVisible()
    } finally {
      await deleteFixtureCustomer(customer.id)
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('a second admin can reply to the same conversation without claiming it first', async ({ page, context, request }) => {
    const admin1 = await createFixtureAdmin('sales_staff')
    const admin2 = await createFixtureAdmin('sales_staff')
    const customer = await createFixtureCustomer()
    try {
      await request.post(`http://localhost:8080/api/public/chats/${customer.id}/messages`, {
        data: { content: 'สอบถามเรื่องการจัดส่งครับ' },
      })
      const conversation = await prisma.chatConversation.findUniqueOrThrow({ where: { customerId: customer.id } })

      await loginAs(context, admin2.id, admin2.role)
      await page.goto(`/manage/chats/${conversation.id}`)
      await page.getByPlaceholder('พิมพ์ข้อความตอบลูกค้า...').fill('ตอบจาก admin2 ครับ')
      await page.getByLabel('ส่งข้อความ').click()
      await expect(page.getByText('ตอบจาก admin2 ครับ')).toBeVisible()
    } finally {
      await deleteFixtureCustomer(customer.id)
      await deleteFixtureAdmin(admin1.id)
      await deleteFixtureAdmin(admin2.id)
    }
  })
})
