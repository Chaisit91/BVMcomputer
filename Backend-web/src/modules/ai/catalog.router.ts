import { createHash, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { prisma } from '../../lib/prisma'

// Server-to-server only. The browser uses the existing authenticated CRUD routes.
export const catalogRouter = Router()

export function catalogPublicationFilter() {
  return process.env.AI_INCLUDE_DRAFT_CATALOG === 'true'
    ? {}
    : { status: 'active' as const, publishImmediately: true }
}
catalogRouter.use((req, res, next) => {
  const token = process.env.AI_CATALOG_TOKEN?.trim()
  if (!token || token.length < 32) {
    res.status(503).json({ message: 'AI catalog access is not configured' })
    return
  }
  const digest = (value: string) => createHash('sha256').update(value).digest()
  if (!timingSafeEqual(digest(req.get('Authorization') ?? ''), digest(`Bearer ${token}`))) {
    res.status(401).json({ message: 'Invalid service credentials' })
    return
  }
  next()
})

catalogRouter.get('/catalog', async (_req, res) => {
  const items = await prisma.product.findMany({
    where: {
      category: { in: ['cpu', 'motherboard', 'gpu', 'ram', 'storage', 'case', 'psu', 'cooling'] },
      ...catalogPublicationFilter(),
    },
    orderBy: { id: 'asc' },
    // Explicit selection excludes cost prices, customer data and credentials.
    select: {
      id: true, category: true, name: true, brand: true, updatedAt: true,
      cpu: { select: {
        socket: true, cores: true, threads: true, baseFrequencyGhz: true,
        maxTurboFrequencyGhz: true, tdpWatts: true,
      } },
      gpu: { select: { chipsetModel: true, memorySize: true } },
      specValues: { select: { value: true, field: { select: { key: true, category: true } } } },
      images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }], take: 1, select: { url: true } },
    },
  })
  res.set('Cache-Control', 'no-store').json({ version: 1, source: 'backend-postgres', items: items.map(({ specValues, images, ...row }) => ({
    ...row,
    specs: Object.fromEntries(specValues.filter(v => v.field.category === row.category).map(v => [v.field.key, v.value])),
    image_url: images[0]?.url ?? '',
  })) })
})
