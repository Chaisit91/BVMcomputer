import { prisma } from '../../lib/prisma'
import { deriveDisplayStatus } from '../../lib/stockStatus'
import { assertValidProductPricing } from '../../schemas/product.schema'
import { getProductName } from '../../lib/productLookup'

const PRODUCT_FIELDS = [
  'sku',
  'name',
  'brand',
  'sellingPrice',
  'costPrice',
  'promoPrice',
  'stock',
  'status',
  'publishImmediately',
  'description',
]
const PROMO_SET_FIELDS = ['code', 'specSummary', 'notes']

function split(body: Record<string, unknown>) {
  const product: any = {}
  const promoSet: any = {}
  for (const [key, value] of Object.entries(body)) {
    if (PROMO_SET_FIELDS.includes(key)) promoSet[key] = value
    else if (PRODUCT_FIELDS.includes(key)) product[key] = value
  }
  return { product, promoSet }
}

async function shape(row: any) {
  const { promoSet, ...own } = row
  const components: Record<string, string> = {}
  for (const p of promoSet.parts) {
    components[p.slot] = await getProductName(p.productId)
  }
  return {
    ...own,
    code: promoSet.code,
    specSummary: promoSet.specSummary,
    notes: promoSet.notes,
    status: deriveDisplayStatus(own.status, own.stock),
    components,
    extraParts: promoSet.extraParts.map((e: any) => ({ id: e.id, name: e.name, value: e.value })),
    highlights: promoSet.highlights.map((h: any) => h.text),
    videoLinks: promoSet.videoLinks.map((v: any) => v.url),
  }
}

const include = {
  promoSet: { include: { parts: true, extraParts: true, highlights: true, videoLinks: true } },
} as const

export const promoSetRepository = {
  findMany: async () => {
    const rows = await prisma.product.findMany({ where: { category: 'promo_set' }, include })
    return Promise.all(rows.map(shape))
  },

  findById: async (id: string) => {
    const row = await prisma.product.findUnique({ where: { id }, include })
    return row ? shape(row) : null
  },

  // ponytail: expects `components` as { <slot>: productId } — see desktop-pc.repository.ts
  create: async (data: any) => {
    const { components, extraParts, highlights, videoLinks, ...body } = data
    const { product, promoSet } = split(body)
    assertValidProductPricing(product)

    const created = await prisma.product.create({
      data: {
        ...product,
        category: 'promo_set',
        promoSet: {
          create: {
            ...promoSet,
            parts: { create: Object.entries(components ?? {}).map(([slot, productId]) => ({ slot, productId })) as any },
            extraParts: { create: extraParts ?? [] },
            highlights: { create: (highlights ?? []).map((text: string) => ({ text })) },
            videoLinks: { create: (videoLinks ?? []).map((url: string) => ({ url })) },
          },
        },
      },
    })
    return promoSetRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { components, extraParts, highlights, videoLinks, ...body } = data
    const { product, promoSet } = split(body)
    assertValidProductPricing(product)

    await prisma.product.update({
      where: { id },
      data: { ...product, ...(Object.keys(promoSet).length ? { promoSet: { update: promoSet } } : {}) },
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

  remove: (id: string) => prisma.product.delete({ where: { id } }),
}
