import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin } from '../support/fixtures'

// UI-level companion to Backend-web's tests/rbac/admin-permissions.spec.ts —
// confirms the form itself reflects the same boundaries the API enforces.

test.describe('Admin edit page — field gating by role', () => {
  test('team lead sees general fields editable but identity fields disabled on a regular teammate', async ({
    page,
    context,
  }) => {
    const lead = await createFixtureAdmin('sales_staff', true)
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      await loginAs(context, lead.id, lead.role)
      await page.goto(`/admins/${staff.id}/edit`)
      await expect(page.locator('input[name="firstName"]')).toBeEnabled()
      await expect(page.locator('input[name="email"]')).toBeDisabled()
      await expect(page.locator('input[name="personalEmail"]')).toBeDisabled()
      await expect(page.getByText('แก้ไขได้เฉพาะเจ้าของบัญชีหรือผู้ดูแลระบบสูงสุด').first()).toBeVisible()
    } finally {
      await deleteFixtureAdmin(staff.id)
      await deleteFixtureAdmin(lead.id)
    }
  })

  test('team lead sees every field disabled and no save button on a peer team lead', async ({ page, context }) => {
    const lead1 = await createFixtureAdmin('sales_staff', true)
    const lead2 = await createFixtureAdmin('sales_staff', true)
    try {
      await loginAs(context, lead1.id, lead1.role)
      await page.goto(`/admins/${lead2.id}/edit`)
      await expect(page.locator('input[name="firstName"]')).toBeDisabled()
      await expect(page.locator('input[name="email"]')).toBeDisabled()
      await expect(page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' })).toHaveCount(0)
    } finally {
      await deleteFixtureAdmin(lead1.id)
      await deleteFixtureAdmin(lead2.id)
    }
  })

  test('a regular staff member can edit their own name and email', async ({ page, context }) => {
    const staff = await createFixtureAdmin('sales_staff', false)
    try {
      await loginAs(context, staff.id, staff.role)
      await page.goto(`/admins/${staff.id}/edit`)
      await expect(page.locator('input[name="firstName"]')).toBeEnabled()
      await expect(page.locator('input[name="email"]')).toBeEnabled()

      await page.fill('input[name="firstName"]', 'UpdatedBySelf')
      const saveResponse = page.waitForResponse(
        (res) => res.url().includes(`/api/admins/${staff.id}`) && res.request().method() === 'PUT',
      )
      await page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง' }).click()
      await saveResponse
      // A successful save navigates away to /admins — re-visit the edit page
      // rather than reload(), which would just reload whatever page the app
      // had already navigated to.
      await page.goto(`/admins/${staff.id}/edit`)
      await expect(page.locator('input[name="firstName"]')).toHaveValue('UpdatedBySelf')
    } finally {
      await deleteFixtureAdmin(staff.id)
    }
  })
})
