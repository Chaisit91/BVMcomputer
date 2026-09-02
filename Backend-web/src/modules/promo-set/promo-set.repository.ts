import { prisma } from '../../lib/prisma'
import { deriveStockStatus, normalizeStoredStatus } from '../../lib/stockStatus'
import { getProductName } from '../../lib/productLookup'

async function shape(row: any) {
  const { parts, extraParts, highlights, videoLinks, ...own } = row
  const components: Record<string, string> = {}
  for (const p of parts) {
    components[p.slot] = await getProductName(p.slot, p.productId)
  }
  return {
    ...own,
    status: deriveStockStatus(own.status, own.stock),
    components,
    extraParts: extraParts.map((e: any) => ({ id: e.id, name: e.name, value: e.value })),
    highlights: highlights.map((h: any) => h.text),
    videoLinks: videoLinks.map((v: any) => v.url),
  }
}

export const promoSetRepository = {
  findMany: async () => {
    const rows = await prisma.promoSet.findMany({
      include: { parts: true, extraParts: true, highlights: true, videoLinks: true },
    })
    return Promise.all(rows.map(shape))
  },

  findById: async (id: string) => {
    const row = await prisma.promoSet.findUnique({
      where: { id },
      include: { parts: true, extraParts: true, highlights: true, videoLinks: true },
    })
    return row ? shape(row) : null
  },

  // ponytail: expects `components` as { <slot>: productId } — see desktop-pc.repository.ts
  create: async (data: any) => {
    const { components, extraParts, highlights, videoLinks, ...own } = data
    const created = await prisma.promoSet.create({
      data: {
        ...own,
        status: normalizeStoredStatus(own.status, 'closed'),
        parts: { create: Object.entries(components ?? {}).map(([slot, productId]) => ({ slot, productId })) as any },
        extraParts: { create: extraParts ?? [] },
        highlights: { create: (highlights ?? []).map((text: string) => ({ text })) },
        videoLinks: { create: (videoLinks ?? []).map((url: string) => ({ url })) },
      },
    })
    return promoSetRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { components, extraParts, highlights, videoLinks, ...own } = data
    await prisma.promoSet.update({
      where: { id },
      data: { ...own, ...(own.status ? { status: normalizeStoredStatus(own.status, 'closed') } : {}) },
    })

    if (components) {
      await prisma.promoSetComponent.deleteMany({ where: { promoSetId: id } })
      await prisma.promoSetComponent.createMany({
        data: Object.entries(components).map(([slot, productId]) => ({ promoSetId: id, slot, productId })) as any,
      })
    }

    if (extraParts) {
      await prisma.promoSetExtraPart.deleteMany({ where: { promoSetId: id } })
      if (extraParts.length) {
        await prisma.promoSetExtraPart.createMany({
          data: extraParts.map((e: any) => ({ promoSetId: id, name: e.name, value: e.value })),
        })
      }
    }

    if (highlights) {
      await prisma.promoSetHighlight.deleteMany({ where: { promoSetId: id } })
      if (highlights.length) {
        await prisma.promoSetHighlight.createMany({ data: highlights.map((text: string) => ({ promoSetId: id, text })) })
      }
    }

    if (videoLinks) {
      await prisma.promoSetVideoLink.deleteMany({ where: { promoSetId: id } })
      if (videoLinks.length) {
        await prisma.promoSetVideoLink.createMany({ data: videoLinks.map((url: string) => ({ promoSetId: id, url })) })
      }
    }

    return promoSetRepository.findById(id)
  },

  remove: (id: string) => prisma.promoSet.delete({ where: { id } }),
}
