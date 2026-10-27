import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, createFixtureCustomer, deleteFixtureCustomer, prisma } from '../support/fixtures'

// Covers TC-012..TC-013: any admin can reply without claiming a case first,
// and each message keeps the real sender's identity for internal traceability.

test.describe('Customer chat', () => {
  test('a customer message via the public endpoint opens a conversation', async ({ request }) => {
    const customer = await createFixtureCustomer()
    try {
      const res = await request.post(`/api/public/chats/${customer.id}/messages`, {
        data: { content: 'สวัสดีครับ อยากสอบถามสินค้า' },
      })
      expect(res.status()).toBe(201)
      const message = await res.json()
      expect(message.sender).toBe('customer')

      const conversation = await prisma.chatConversation.findUnique({ where: { customerId: customer.id } })
      expect(conversation).not.toBeNull()
      expect(conversation?.unreadCount).toBe(1)
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })

  test('any admin can reply to a conversation without claiming it first, and the real sender is tracked per message', async ({
    request,
  }) => {
    const customer = await createFixtureCustomer()
    const admin1 = await createFixtureAdmin('sales_staff')
    const admin2 = await createFixtureAdmin('sales_staff')
    try {
      await request.post(`/api/public/chats/${customer.id}/messages`, { data: { content: 'มีของชิ้นนี้ไหมครับ' } })
      const conversation = await prisma.chatConversation.findUniqueOrThrow({ where: { customerId: customer.id } })

      const reply1 = await request.post(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin1.id, admin1.role) },
        data: { content: 'มีครับ' },
      })
      expect(reply1.status()).toBe(201)

      const reply2 = await request.post(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin2.id, admin2.role) },
        data: { content: 'เสริมอีกนิดครับ' },
      })
      expect(reply2.status()).toBe(201) // admin2 can reply too — no "claim" blocks this

      const messagesRes = await request.get(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin1.id, admin1.role) },
      })
      const messages = await messagesRes.json()
      const adminMessages = messages.filter((m: any) => m.sender === 'admin')
      expect(adminMessages.map((m: any) => m.senderAdminId)).toEqual([admin1.id, admin2.id])
    } finally {
      await deleteFixtureCustomer(customer.id)
      await deleteFixtureAdmin(admin1.id)
      await deleteFixtureAdmin(admin2.id)
    }
  })

  test('replying resets unreadCount back to 0', async ({ request }) => {
    const customer = await createFixtureCustomer()
    const admin = await createFixtureAdmin('sales_staff')
    try {
      await request.post(`/api/public/chats/${customer.id}/messages`, { data: { content: 'ข้อความ 1' } })
      await request.post(`/api/public/chats/${customer.id}/messages`, { data: { content: 'ข้อความ 2' } })
      const conversation = await prisma.chatConversation.findUniqueOrThrow({ where: { customerId: customer.id } })
      expect(conversation.unreadCount).toBe(2)

      await request.post(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin.id, admin.role) },
        data: { content: 'ตอบแล้วครับ' },
      })
      const after = await prisma.chatConversation.findUniqueOrThrow({ where: { id: conversation.id } })
      expect(after.unreadCount).toBe(0)
    } finally {
      await deleteFixtureCustomer(customer.id)
      await deleteFixtureAdmin(admin.id)
    }
  })
})
