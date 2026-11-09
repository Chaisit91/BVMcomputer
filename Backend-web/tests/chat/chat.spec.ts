import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, createFixtureCustomer, deleteFixtureCustomer, prisma } from '../support/fixtures'

// Covers TC-012..TC-013: any admin can reply without claiming a case first,
// and each message keeps the real sender's identity for internal traceability.

// Minimal valid 1x1 PNG, used across the attachment tests below.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

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

test.describe('Customer chat — attachments', () => {
  test('a customer can send an attachment-only message (no text) via the public endpoint', async ({ request }) => {
    const customer = await createFixtureCustomer()
    try {
      const res = await request.post(`/api/public/chats/${customer.id}/messages`, {
        multipart: { files: { name: 'photo.png', mimeType: 'image/png', buffer: TINY_PNG } },
      })
      expect(res.status()).toBe(201)
      const message = await res.json()
      expect(message.content).toBe('')
      expect(message.attachments).toHaveLength(1)
      expect(message.attachments[0]).toMatchObject({ fileName: 'photo.png', contentType: 'image/png' })
      expect(message.attachments[0].url).toContain('chat-attachments/')
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })

  test('an admin reply can carry both text and a file, and GET returns the attachment', async ({ request }) => {
    const customer = await createFixtureCustomer()
    const admin = await createFixtureAdmin('sales_staff')
    try {
      await request.post(`/api/public/chats/${customer.id}/messages`, { data: { content: 'ขอดูรูปสินค้าหน่อยครับ' } })
      const conversation = await prisma.chatConversation.findUniqueOrThrow({ where: { customerId: customer.id } })

      const reply = await request.post(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin.id, admin.role) },
        multipart: { content: 'นี่ครับ', files: { name: 'product.png', mimeType: 'image/png', buffer: TINY_PNG } },
      })
      expect(reply.status()).toBe(201)

      const messagesRes = await request.get(`/api/chats/${conversation.id}/messages`, {
        headers: { Cookie: sessionCookieHeader(admin.id, admin.role) },
      })
      const messages = await messagesRes.json()
      const adminReply = messages.find((m: any) => m.sender === 'admin')
      expect(adminReply.content).toBe('นี่ครับ')
      expect(adminReply.attachments).toHaveLength(1)
      expect(adminReply.attachments[0].fileName).toBe('product.png')
    } finally {
      await deleteFixtureCustomer(customer.id)
      await deleteFixtureAdmin(admin.id)
    }
  })

  test('the public endpoint rejects a disallowed file type', async ({ request }) => {
    const customer = await createFixtureCustomer()
    try {
      const res = await request.post(`/api/public/chats/${customer.id}/messages`, {
        multipart: { files: { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') } },
      })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })

  test('a file whose real bytes do not match its declared type is rejected (spoofed Content-Type)', async ({
    request,
  }) => {
    const customer = await createFixtureCustomer()
    try {
      const res = await request.post(`/api/public/chats/${customer.id}/messages`, {
        // Plain text content, but labeled as an image — passes the allowlist
        // check (the declared type is fine), fails the magic-byte sniff.
        multipart: {
          files: { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('<script>alert(1)</script>') },
        },
      })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })

  test('a message with neither content nor a file is rejected', async ({ request }) => {
    const customer = await createFixtureCustomer()
    try {
      const res = await request.post(`/api/public/chats/${customer.id}/messages`, { data: {} })
      expect(res.status()).toBe(400)
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })

  test('a made-up customerId is rejected before any upload is attempted', async ({ request }) => {
    const res = await request.post('/api/public/chats/not-a-real-customer-id/messages', {
      multipart: { files: { name: 'photo.png', mimeType: 'image/png', buffer: TINY_PNG } },
    })
    expect(res.status()).toBe(404)
  })

  test('sending too many messages in a short window is rate-limited', async ({ request }) => {
    const customer = await createFixtureCustomer()
    try {
      let lastStatus = 0
      for (let i = 0; i < 21; i++) {
        const res = await request.post(`/api/public/chats/${customer.id}/messages`, { data: { content: `msg ${i}` } })
        lastStatus = res.status()
      }
      expect(lastStatus).toBe(429)
    } finally {
      await deleteFixtureCustomer(customer.id)
    }
  })
})
