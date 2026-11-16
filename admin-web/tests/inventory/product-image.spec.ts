import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

// Minimal valid 1x1 PNG.
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

test.describe('Product image upload (the real "รูปภาพสินค้า" section, not the old dead placeholder)', () => {
  test('uploading and deleting a product image on a CPU edit page', async ({ page, context }) => {
    const admin = await createFixtureAdmin('inventory_manager')
    try {
      const cpu = await prisma.product.findFirst({ where: { category: 'cpu' } })
      test.skip(!cpu, 'no CPU product is seeded — nothing to attach an image to')

      await loginAs(context, admin.id, admin.role)
      await page.goto(`/inventory/cpu/${cpu!.id}/edit`)

      await expect(page.getByText('ยังไม่มีรูปภาพ')).toBeVisible()

      await page.locator('#product-image-input').setInputFiles({
        name: 'cpu-photo.png',
        mimeType: 'image/png',
        buffer: TINY_PNG,
      })
      // Uploaded images render as a thumbnail <img>, not a filename link.
      await expect(page.getByAltText('cpu-photo.png')).toBeVisible()

      await page.locator('div.group').filter({ has: page.getByAltText('cpu-photo.png') }).getByRole('button').click()
      await page.getByRole('button', { name: 'ยืนยัน' }).click()
      await expect(page.getByAltText('cpu-photo.png')).toHaveCount(0)
    } finally {
      await prisma.productImage.deleteMany({ where: { product: { category: 'cpu' }, altText: 'cpu-photo.png' } })
      await deleteFixtureAdmin(admin.id)
    }
  })
})
