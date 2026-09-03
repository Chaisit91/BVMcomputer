import { prisma } from '../../lib/prisma'
import { deriveDisplayStatus } from '../../lib/stockStatus'
import { assertValidProductPricing } from '../../schemas/product.schema'
import { getProductName } from '../../lib/productLookup'

// admin-web's DesktopPcSpecs interface calls the motherboard slot "mainboard"
const SLOT_TO_SPEC_KEY: Record<string, string> = {
  cpu: 'cpu',
  gpu: 'gpu',
  motherboard: 'mainboard',
  ram: 'ram',
  storage: 'storage',
  psu: 'psu',
  case: 'case',
  cooling: 'cooling',
}

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
// DesktopPc.category (DesktopPcCategory: desktop/mini_pc/...) is a different
// axis than Product.category (always "desktop_pc" here) — kept as its own key.
const DESKTOP_PC_FIELDS = ['category', 'specSummary', 'os', 'warranty']

function split(body: Record<string, unknown>) {
  const product: any = {}
  const desktopPc: any = {}
  for (const [key, value] of Object.entries(body)) {
    if (DESKTOP_PC_FIELDS.includes(key)) desktopPc[key] = value
    else if (PRODUCT_FIELDS.includes(key)) product[key] = value
  }
  return { product, desktopPc }
}

async function shape(row: any) {
  const { desktopPc, components, ...own } = row
  const specs: Record<string, string> = { os: desktopPc.os, warranty: desktopPc.warranty }
  for (const c of components) {
    specs[SLOT_TO_SPEC_KEY[c.slot]] = await getProductName(c.productId)
  }
  return {
    ...own,
    category: desktopPc.category,
    status: deriveDisplayStatus(own.status, own.stock),
    specSummary: desktopPc.specSummary,
    specs,
    highlights: row.highlights.map((h: any) => h.text),
  }
}

export const desktopPcRepository = {
  findMany: async () => {
    const rows = await prisma.product.findMany({
      where: { category: 'desktop_pc' },
      include: { desktopPc: { include: { components: true, highlights: true } } },
    })
    return Promise.all(rows.map((r) => shape({ ...r, ...r.desktopPc })))
  },

  findById: async (id: string) => {
    const row = await prisma.product.findUnique({
      where: { id },
      include: { desktopPc: { include: { components: true, highlights: true } } },
    })
    return row ? shape({ ...row, ...row.desktopPc }) : null
  },

  // ponytail: expects `components` as { <slot>: productId } — the frontend
  // form still sends free-text names for these slots, so create/update won't
  // work correctly until that form is switched to pick real catalog products.
  create: async (data: any) => {
    const { components, highlights, ...body } = data
    const { product, desktopPc } = split(body)
    assertValidProductPricing(product)

    const created = await prisma.product.create({
      data: {
        ...product,
        category: 'desktop_pc',
        desktopPc: {
          create: {
            ...desktopPc,
            components: { create: Object.entries(components ?? {}).map(([slot, productId]) => ({ slot, productId })) as any },
            highlights: { create: (highlights ?? []).map((text: string) => ({ text })) },
          },
        },
      },
    })
    return desktopPcRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { components, highlights, ...body } = data
    const { product, desktopPc } = split(body)
    assertValidProductPricing(product)

    await prisma.product.update({
      where: { id },
      data: { ...product, ...(Object.keys(desktopPc).length ? { desktopPc: { update: desktopPc } } : {}) },
    })

    if (components) {
      await prisma.desktopPcComponent.deleteMany({ where: { desktopPcId: id } })
      await prisma.desktopPcComponent.createMany({
        data: Object.entries(components).map(([slot, productId]) => ({ desktopPcId: id, slot, productId })) as any,
      })
    }

    if (highlights) {
      await prisma.desktopPcHighlight.deleteMany({ where: { desktopPcId: id } })
      if (highlights.length) {
        await prisma.desktopPcHighlight.createMany({ data: highlights.map((text: string) => ({ desktopPcId: id, text })) })
      }
    }

    return desktopPcRepository.findById(id)
  },

  remove: (id: string) => prisma.product.delete({ where: { id } }),
}
