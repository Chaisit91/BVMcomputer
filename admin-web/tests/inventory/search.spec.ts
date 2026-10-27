import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

test.describe('Inventory search — whitespace-insensitive', () => {
  test('typing a product name with no spaces still finds it on the CPU list page', async ({ page, context }) => {
    const admin = await createFixtureAdmin('inventory_manager')
    try {
      const cpu = await prisma.product.findFirst({ where: { category: 'cpu', name: { contains: ' ' } } })
      test.skip(!cpu, 'no CPU product with a space in its name is seeded — nothing to assert against')
      const noSpaceQuery = cpu!.name.replace(/\s+/g, '')

      await loginAs(context, admin.id, admin.role)
      await page.goto('/inventory/cpu')
      await page.getByPlaceholder('ค้นหารหัสสินค้า หรือ ชื่อซีพียู...').fill(noSpaceQuery)
      await expect(page.getByText(cpu!.name, { exact: false }).first()).toBeVisible()
    } finally {
      await deleteFixtureAdmin(admin.id)
    }
  })
})
