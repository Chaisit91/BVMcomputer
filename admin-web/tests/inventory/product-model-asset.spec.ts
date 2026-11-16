import { test, expect } from '@playwright/test'
import { loginAs } from '../support/login'
import { createFixtureAdmin, deleteFixtureAdmin, prisma } from '../support/fixtures'

// Minimal valid 1x1 PNG — stands in for a real sculpted-model file (.glb/.obj/.fbx);
// the upload endpoint accepts any file type, so a tiny image is enough to exercise it.
const TINY_FILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

test.describe('Product model asset upload (admin-only, for the AI 3D-assembly pipeline)', () => {
  test('uploading and deleting a model file on a CPU edit page', async ({ page, context }) => {
    const admin = await createFixtureAdmin('inventory_manager')
    try {
      const cpu = await prisma.product.findFirst({ where: { category: 'cpu' } })
      test.skip(!cpu, 'no CPU product is seeded — nothing to attach a model file to')

      await loginAs(context, admin.id, admin.role)
      await page.goto(`/inventory/cpu/${cpu!.id}/edit`)

      await expect(page.getByText('ยังไม่มีไฟล์โมเดลปั้น')).toBeVisible()

      await page.locator('#product-model-asset-input').setInputFiles({
        name: 'cpu-model.glb',
        mimeType: 'model/gltf-binary',
        buffer: TINY_FILE,
      })
      await expect(page.getByText('cpu-model.glb')).toBeVisible()

      const row = page.locator('div').filter({ hasText: 'cpu-model.glb' }).last()
      await row.getByRole('button').click()
      await page.getByRole('button', { name: 'ยืนยัน' }).click()
      await expect(page.getByText('cpu-model.glb')).toHaveCount(0)
    } finally {
      await prisma.productModelAsset.deleteMany({ where: { product: { category: 'cpu' }, fileName: 'cpu-model.glb' } })
      await deleteFixtureAdmin(admin.id)
    }
  })
})
