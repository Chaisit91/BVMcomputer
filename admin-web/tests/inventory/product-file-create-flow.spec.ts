import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

// A brand-new product has no id yet, so the image/model-asset sections stage
// files locally and upload them only after the product is actually created
// (see ProductFileSection's "staging" mode) — this is the one path that
// can't be exercised against an existing product like the other two specs do.
test.describe('Staged file upload on the "add new product" page', () => {
  test('files picked before saving are uploaded right after the new CPU is created', async ({ page, context }) => {
    const admin = await createFixtureAdmin('inventory_manager')
    const uniqueName = `PW Fixture CPU ${Date.now()}`
    try {
      await loginAs(context, admin.id, admin.role)
      await page.goto('/inventory/cpu/new')

      await page.locator('#product-image-input').setInputFiles({
        name: 'new-cpu.png',
        mimeType: 'image/png',
        buffer: TINY_PNG,
      })
      await page.locator('#product-model-asset-input').setInputFiles({
        name: 'new-cpu.glb',
        mimeType: 'model/gltf-binary',
        buffer: TINY_PNG,
      })
      // Staged previews show up locally, with no network call yet.
      await expect(page.getByAltText('new-cpu.png')).toBeVisible()
      await expect(page.getByText('new-cpu.glb')).toBeVisible()

      // These labels are plain text siblings, not <label for>-associated, so
      // getByLabel can't find them — react-hook-form's register() puts the
      // field name on the input itself, which is the reliable hook here.
      await page.locator('input[name="name"]').fill(uniqueName)
      await page.locator('input[name="series"]').fill('Test Series')
      await page.locator('input[name="processorLine"]').fill('Test Line')
      await page.locator('input[name="processorNumber"]').fill('Test-9000')
      await page.locator('input[name="cores"]').fill('6')
      await page.locator('input[name="threads"]').fill('12')

      await page.getByRole('button', { name: 'บันทึกสินค้า' }).click()
      await expect(page).toHaveURL(/\/inventory\/cpu$/)

      const created = await prisma.product.findFirstOrThrow({ where: { name: uniqueName } })
      const [images, modelAssets] = await Promise.all([
        prisma.productImage.findMany({ where: { productId: created.id } }),
        prisma.productModelAsset.findMany({ where: { productId: created.id } }),
      ])
      expect(images.map((i) => i.altText)).toContain('new-cpu.png')
      expect(modelAssets.map((m) => m.fileName)).toContain('new-cpu.glb')
    } finally {
      const created = await prisma.product.findFirst({ where: { name: uniqueName } })
      if (created) await prisma.product.delete({ where: { id: created.id } })
      await deleteFixtureAdmin(admin.id)
    }
  })
})
