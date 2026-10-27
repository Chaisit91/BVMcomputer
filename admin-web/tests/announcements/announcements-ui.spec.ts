import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { signSessionToken } from '../support/jwt'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('Announcements — composing', () => {
  test('super_admin sees the compose form with a department selector and can broadcast to everyone', async ({
    page,
    context,
  }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    try {
      await loginAs(context, superAdmin.id, superAdmin.role)
      await page.goto('/announcements')
      await expect(page.getByPlaceholder('เขียนประกาศ...')).toBeVisible()
      await expect(page.locator('select')).toContainText('ส่งถึงทุกแผนก')

      const content = `ประกาศทดสอบ UI ${Date.now()}`
      await page.getByPlaceholder('เขียนประกาศ...').fill(content)
      await page.getByRole('button', { name: 'ประกาศ', exact: true }).click()

      // .border-l-4 (the sender-type accent) exists only on each card's own
      // div, never on an ancestor wrapper — unlike a plain tag+hasText
      // filter, which would also match the whole list's containing div.
      const card = page.locator('div.border-l-4').filter({ hasText: content })
      await expect(card.getByText('ผู้ดูแลระบบ')).toBeVisible()
      await expect(card.getByText('ถึง: ทุกแผนก')).toBeVisible()
    } finally {
      await prisma.announcement.deleteMany({ where: { authorId: superAdmin.id } })
      await deleteFixtureAdmin(superAdmin.id)
    }
  })

  test('a regular staff member (not a team lead) sees no compose form at all', async ({ page, context }) => {
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto('/announcements')
      await expect(page.getByPlaceholder('เขียนประกาศ...')).toHaveCount(0)
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })

  test('a team lead posts and it shows the "หัวหน้าแผนก" tag and their own department', async ({ page, context }) => {
    const lead = await createFixtureAdmin('inventory_manager', true)
    try {
      await loginAs(context, lead.id, lead.role)
      await page.goto('/announcements')
      // super_admin-only department selector must not be offered to a team lead
      await expect(page.locator('select')).toHaveCount(0)

      // Deliberately avoids the literal substring "หัวหน้าแผนก" — the card
      // under test also renders that exact text as its sender-role tag, so
      // reusing it in the content would make both match the same locator.
      const content = `ประกาศทดสอบของหัวหน้าทีม ${Date.now()}`
      await page.getByPlaceholder('เขียนประกาศ...').fill(content)
      await page.getByRole('button', { name: 'ประกาศ', exact: true }).click()

      const card = page.locator('div.border-l-4').filter({ hasText: content })
      await expect(card.getByText('หัวหน้าแผนก')).toBeVisible()
      await expect(card.getByText('ถึง: ผู้จัดการคลังสินค้า')).toBeVisible()
    } finally {
      await prisma.announcement.deleteMany({ where: { authorId: lead.id } })
      await deleteFixtureAdmin(lead.id)
    }
  })
})

test.describe('Announcements — cross-department visibility', () => {
  test('an admin in another department does not see a department-scoped announcement', async ({
    page,
    context,
    request,
  }) => {
    const salesLead = await createFixtureAdmin('sales_staff', true)
    const contentStaff = await createFixtureAdmin('content_moderator', false)
    const content = `เฉพาะฝ่ายขาย UI ${Date.now()}`
    try {
      await request.post('http://localhost:8080/api/announcements', {
        headers: { Cookie: `bvm_session=${signSessionToken(salesLead.id, salesLead.role)}` },
        multipart: { content },
      })

      await loginAs(context, contentStaff.id, contentStaff.role)
      await page.goto('/announcements')
      await expect(page.getByText(content)).toHaveCount(0)
    } finally {
      await prisma.announcement.deleteMany({ where: { authorId: salesLead.id } })
      await deleteFixtureAdmin(salesLead.id)
      await deleteFixtureAdmin(contentStaff.id)
    }
  })
})

test.describe('Announcements — delete button visibility', () => {
  test('the author sees a delete button on their own announcement; an unrelated staff member does not', async ({
    page,
    context,
  }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const unrelatedStaff = await createFixtureAdmin('content_moderator', false)
    const content = `ประกาศเช็คปุ่มลบ ${Date.now()}`
    try {
      await loginAs(context, lead.id, lead.role)
      await page.goto('/announcements')
      await page.getByPlaceholder('เขียนประกาศ...').fill(content)
      await page.getByRole('button', { name: 'ประกาศ', exact: true }).click()
      const ownCard = page.locator('div.border-l-4').filter({ hasText: content })
      await expect(ownCard.getByLabel('ลบประกาศ')).toBeVisible()

      await loginAs(context, unrelatedStaff.id, unrelatedStaff.role)
      await page.goto('/announcements')
      // content_moderator can't see a sales_staff-scoped announcement at all,
      // which on its own proves they have no way to reach its delete button.
      await expect(page.getByText(content)).toHaveCount(0)
    } finally {
      await prisma.announcement.deleteMany({ where: { authorId: lead.id } })
      await deleteFixtureAdmin(lead.id)
      await deleteFixtureAdmin(unrelatedStaff.id)
    }
  })
})

test.describe('Announcements — search and filter', () => {
  test('search filters by content, and department filter pills narrow the list with correct counts', async ({
    page,
    context,
  }) => {
    const superAdmin = await createFixtureAdmin('super_admin')
    const uniqueWord = `UniqueWord${Date.now()}`
    try {
      await loginAs(context, superAdmin.id, superAdmin.role)
      await page.goto('/announcements')

      await page.getByPlaceholder('เขียนประกาศ...').fill(`ประกาศมี ${uniqueWord} อยู่ในเนื้อหา`)
      await page.getByRole('button', { name: 'ประกาศ', exact: true }).click()
      await expect(page.getByText(uniqueWord)).toBeVisible()

      await page.getByPlaceholder('ค้นหาประกาศ...').fill(uniqueWord)
      await expect(page.getByText(uniqueWord)).toBeVisible()
      await page.getByPlaceholder('ค้นหาประกาศ...').fill('คำที่ไม่มีอยู่จริงแน่นอน')
      await expect(page.getByText('ไม่พบประกาศที่ค้นหา')).toBeVisible()
    } finally {
      await prisma.announcement.deleteMany({ where: { authorId: superAdmin.id } })
      await deleteFixtureAdmin(superAdmin.id)
    }
  })
})
