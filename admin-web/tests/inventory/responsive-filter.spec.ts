import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin } from '../support/fixtures'

// Regression test for the reported bug: the filter panel used to stay
// `sticky` unconditionally, which on mobile (where the layout stacks instead
// of using a sidebar) covered the entire screen.

test.describe('Inventory filter panel — responsive sticky behavior', () => {
  let adminId: string

  test.beforeEach(async ({}, testInfo) => {
    const admin = await createFixtureAdmin('inventory_manager')
    adminId = admin.id
    testInfo.annotations.push({ type: 'fixture-admin-id', description: admin.id })
  })

  test.afterEach(async () => {
    await deleteFixtureAdmin(adminId)
  })

  test('desktop: the filter panel stays sticky while scrolling', async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await loginAs(context, adminId, 'inventory_manager')
    await page.goto('/inventory/cpu')
    // The list loads async after mount — scrolling before it's done measures
    // a page that's still growing, which shifts the sticky "near bottom"
    // clamp between the two scrolls and produces a false failure here.
    await expect(page.getByText('แสดงทั้งหมด')).toBeVisible()

    const aside = page.locator('aside')
    // The very first scroll transitions the panel from its normal flow
    // position to its stuck one — that jump is expected. Sticky is proven by
    // comparing two points *after* it has already engaged: further scrolling
    // must not move it again.
    await page.mouse.wheel(0, 600)
    const afterFirstScroll = await aside.boundingBox()
    await page.mouse.wheel(0, 600)
    const afterSecondScroll = await aside.boundingBox()

    expect(afterFirstScroll).not.toBeNull()
    expect(afterSecondScroll).not.toBeNull()
    expect(Math.abs((afterSecondScroll?.y ?? 0) - (afterFirstScroll?.y ?? 0))).toBeLessThan(5)
  })

  test('mobile: the filter panel scrolls away normally and never covers the content below it', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await loginAs(context, adminId, 'inventory_manager')
    await page.goto('/inventory/cpu')
    await expect(page.getByText('แสดงทั้งหมด')).toBeVisible()

    const aside = page.locator('aside')
    const before = await aside.boundingBox()
    await page.mouse.wheel(0, 1200)
    const after = await aside.boundingBox()

    expect(before).not.toBeNull()
    expect(after).not.toBeNull()
    // Not sticky on mobile — it must have scrolled up and out of view with
    // the rest of the page, not held its position.
    expect((before?.y ?? 0) - (after?.y ?? 0)).toBeGreaterThan(200)
  })
})
