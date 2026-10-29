import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin } from '../support/fixtures'

// Smoke + RBAC coverage for every inventory list page (permissions.ts gates
// the whole /inventory prefix to inventory_manager). One parameterized check
// per category is representative since all 12 pages share the same
// ProtectedRoute gate — a per-category heading assertion still catches a
// broken route/import for any single category.

const categories = [
  { path: '/inventory/cpu', heading: 'ซีพียู (CPU)' },
  { path: '/inventory/gpu', heading: 'การ์ดจอทั้งหมดในคลัง' },
  { path: '/inventory/motherboard', heading: 'เมนบอร์ด (Motherboard)' },
  { path: '/inventory/ram', heading: 'แรมคอมพิวเตอร์ (RAM Inventory)' },
  { path: '/inventory/storage', heading: 'ฮาร์ดดิสก์ และ เอสเอสดี (HDD & SSD Storage)' },
  { path: '/inventory/case', heading: 'เคสคอมพิวเตอร์ (Computer Case)' },
  { path: '/inventory/psu', heading: 'พาวเวอร์ซัพพลาย (Power Supply)' },
  { path: '/inventory/cooling', heading: 'ชุดระบายความร้อน (Cooling System)' },
  { path: '/inventory/desktop-pc', heading: 'คอมพิวเตอร์ตั้งโต๊ะ' },
  { path: '/inventory/promo-sets', heading: 'คอมพิวเตอร์เซ็ตโปรโมชั่น' },
  { path: '/inventory/custom-build', heading: 'จัดสเปคคอม' },
  { path: '/inventory/computer-upgrade', heading: 'จัดการอัพเกรดคอมพิวเตอร์' },
]

test.describe('Inventory list pages — role gate', () => {
  for (const category of categories) {
    test(`${category.path}: inventory_manager can open it`, async ({ page, context }) => {
      const manager = await createFixtureAdmin('inventory_manager')
      try {
        await loginAs(context, manager.id, manager.role)
        await page.goto(category.path)
        await expect(page.getByRole('heading', { name: category.heading })).toBeVisible()
      } finally {
        await deleteFixtureAdmin(manager.id)
      }
    })

    test(`${category.path}: a non-inventory role is forbidden`, async ({ page, context }) => {
      const staff = await createFixtureAdmin('sales_staff')
      try {
        await loginAs(context, staff.id, staff.role)
        await page.goto(category.path)
        await expect(page.getByText('ไม่มีสิทธิ์เข้าถึงหน้านี้')).toBeVisible()
      } finally {
        await deleteFixtureAdmin(staff.id)
      }
    })
  }
})
