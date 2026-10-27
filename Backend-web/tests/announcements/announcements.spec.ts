import { test, expect } from '@playwright/test'
import { sessionCookieHeader } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

// Covers TC-015..TC-029: who can post where, cross-department visibility,
// delete permissions, attachments, and the unread-count/mark-seen cycle.

async function cleanupAnnouncement(id: string) {
  await prisma.announcement.deleteMany({ where: { id } })
}

test.describe('Announcements — posting permissions', () => {
  test('super_admin can broadcast to every department', async ({ request }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    let announcementId = ''
    try {
      const res = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
        multipart: { content: 'แจ้งทุกแผนก (ทดสอบอัตโนมัติ)' },
      })
      expect(res.status()).toBe(201)
      const body = await res.json()
      announcementId = body.id
      expect(body.department).toBeNull()
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test('super_admin can target one specific department', async ({ request }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    let announcementId = ''
    try {
      const res = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
        multipart: { content: 'แจ้งเฉพาะคลังสินค้า (ทดสอบอัตโนมัติ)', department: 'inventory_manager' },
      })
      expect(res.status()).toBe(201)
      const body = await res.json()
      announcementId = body.id
      expect(body.department).toBe('inventory_manager')
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test("a team lead's post is always scoped to their own department, even if a different one is requested", async ({
    request,
  }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    let announcementId = ''
    try {
      const res = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        multipart: { content: 'พยายามส่งข้ามแผนก (ทดสอบอัตโนมัติ)', department: 'inventory_manager' },
      })
      expect(res.status()).toBe(201)
      const body = await res.json()
      announcementId = body.id
      expect(body.department).toBe('sales_staff') // forced to the author's own department
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(lead.id)
    }
  })

  test('a regular staff member (not a team lead, not super_admin) cannot post', async ({ request }) => {
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      const res = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(staff.id, staff.role) },
        multipart: { content: 'ไม่ควรโพสต์ได้ (ทดสอบอัตโนมัติ)' },
      })
      expect(res.status()).toBe(403)
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })
})

test.describe('Announcements — visibility', () => {
  test('an admin in one department cannot see another department-scoped announcement', async ({ request }) => {
    const salesLead = await createFixtureAdmin('sales_staff', true)
    const contentStaff = await createFixtureAdmin('content_moderator', false)
    let announcementId = ''
    try {
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(salesLead.id, salesLead.role) },
        multipart: { content: 'เฉพาะฝ่ายขาย (ทดสอบอัตโนมัติ)' },
      })
      announcementId = (await created.json()).id

      const list = await request.get('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(contentStaff.id, contentStaff.role) },
      })
      const ids = (await list.json()).map((a: any) => a.id)
      expect(ids).not.toContain(announcementId)
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(salesLead.id)
      await deleteFixtureAdmin(contentStaff.id)
    }
  })

  test('super_admin sees every announcement regardless of department', async ({ request }) => {
    const salesLead = await createFixtureAdmin('sales_staff', true)
    const superAdmin = await createFixtureAdmin('super_admin')
    let announcementId = ''
    try {
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(salesLead.id, salesLead.role) },
        multipart: { content: 'เฉพาะฝ่ายขาย อีกอัน (ทดสอบอัตโนมัติ)' },
      })
      announcementId = (await created.json()).id

      const list = await request.get('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
      })
      const ids = (await list.json()).map((a: any) => a.id)
      expect(ids).toContain(announcementId)
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(salesLead.id)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })
})

test.describe('Announcements — delete permissions', () => {
  test('the author can delete their own announcement', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    try {
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        multipart: { content: 'ลบของตัวเอง (ทดสอบอัตโนมัติ)' },
      })
      const id = (await created.json()).id
      const res = await request.delete(`/api/announcements/${id}`, {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
      })
      expect(res.status()).toBe(204)
    } finally {
      await deleteFixtureAdmin(lead.id)
    }
  })

  test("a department's team lead can delete a teammate's announcement in their own department", async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const otherLead = await createFixtureAdmin('sales_staff', true)
    let announcementId = ''
    try {
      // otherLead posts into the shared department (same department value as `lead`'s)
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(otherLead.id, otherLead.role) },
        multipart: { content: 'โพสต์โดยหัวหน้าอีกคน (ทดสอบอัตโนมัติ)' },
      })
      announcementId = (await created.json()).id

      const res = await request.delete(`/api/announcements/${announcementId}`, {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
      })
      expect(res.status()).toBe(204)
      announcementId = '' // already deleted
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(lead.id)
      await deleteFixtureAdmin(otherLead.id)
    }
  })

  test('an unrelated staff member cannot delete someone else\'s announcement', async ({ request }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const contentStaff = await createFixtureAdmin('content_moderator', false)
    let announcementId = ''
    try {
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(lead.id, lead.role) },
        multipart: { content: 'ไม่เกี่ยวข้องกับ content staff (ทดสอบอัตโนมัติ)' },
      })
      announcementId = (await created.json()).id

      const res = await request.delete(`/api/announcements/${announcementId}`, {
        headers: { Cookie: sessionCookieHeader(contentStaff.id, contentStaff.role) },
      })
      expect(res.status()).toBe(403)
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(lead.id)
      await deleteFixtureAdmin(contentStaff.id)
    }
  })
})

test.describe('Announcements — attachments, links, unread count', () => {
  test('an announcement can carry a link and a file attachment', async ({ request }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    let announcementId = ''
    try {
      const res = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
        multipart: {
          content: 'มีลิงก์และไฟล์แนบ (ทดสอบอัตโนมัติ)',
          link: 'https://example.com/demo-doc',
          files: { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('playwright test attachment') },
        },
      })
      expect(res.status()).toBe(201)
      const body = await res.json()
      announcementId = body.id
      expect(body.linkUrl).toBe('https://example.com/demo-doc')
      expect(body.attachments).toHaveLength(1)
      expect(body.attachments[0].fileName).toBe('note.txt')
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test('unread count reflects visible announcements and drops to 0 after marking seen', async ({ request }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    const viewer = await createFixtureAdmin('sales_staff', false)
    let announcementId = ''
    try {
      const created = await request.post('/api/announcements', {
        headers: { Cookie: sessionCookieHeader(superAdmin.id, superAdmin.role) },
        multipart: { content: 'แจ้งเตือนทดสอบ unread (ทดสอบอัตโนมัติ)' },
      })
      announcementId = (await created.json()).id

      const before = await request.get('/api/announcements/unread-count', {
        headers: { Cookie: sessionCookieHeader(viewer.id, viewer.role) },
      })
      expect((await before.json()).count).toBeGreaterThan(0)

      await request.put('/api/announcements/seen', { headers: { Cookie: sessionCookieHeader(viewer.id, viewer.role) } })

      const after = await request.get('/api/announcements/unread-count', {
        headers: { Cookie: sessionCookieHeader(viewer.id, viewer.role) },
      })
      expect((await after.json()).count).toBe(0)
    } finally {
      if (announcementId) await cleanupAnnouncement(announcementId)
      await deleteFixtureAdmin(superAdmin.id)
      await deleteFixtureAdmin(viewer.id)
    }
  })
})
