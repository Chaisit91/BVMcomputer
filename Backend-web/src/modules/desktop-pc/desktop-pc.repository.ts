import { prisma } from '../../lib/prisma'
import { deriveStockStatus, normalizeStoredStatus } from '../../lib/stockStatus'
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

async function shape(row: any) {
  const { components, highlights, ...own } = row
  const specs: Record<string, string> = { os: own.os, warranty: own.warranty }
  for (const c of components) {
    specs[SLOT_TO_SPEC_KEY[c.slot]] = await getProductName(c.slot, c.productId)
  }
  return {
    ...own,
    status: deriveStockStatus(own.status, own.stock),
    specs,
    highlights: highlights.map((h: any) => h.text),
  }
}

export const desktopPcRepository = {
  findMany: async () => {
    const rows = await prisma.desktopPc.findMany({ include: { components: true, highlights: true } })
    return Promise.all(rows.map(shape))
  },

  findById: async (id: string) => {
    const row = await prisma.desktopPc.findUnique({ where: { id }, include: { components: true, highlights: true } })
    return row ? shape(row) : null
  },

  // ponytail: expects `components` as { <slot>: productId } — the frontend
  // form still sends free-text names for these slots, so create/update won't
  // work correctly until that form is switched to pick real catalog products.
  create: async (data: any) => {
    const { components, highlights, ...own } = data
    const created = await prisma.desktopPc.create({
      data: {
        ...own,
        status: normalizeStoredStatus(own.status, 'discontinued'),
        components: { create: Object.entries(components ?? {}).map(([slot, productId]) => ({ slot, productId })) as any },
        highlights: { create: (highlights ?? []).map((text: string) => ({ text })) },
      },
    })
    return desktopPcRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { components, highlights, ...own } = data
    await prisma.desktopPc.update({
      where: { id },
      data: { ...own, ...(own.status ? { status: normalizeStoredStatus(own.status, 'discontinued') } : {}) },
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

  remove: (id: string) => prisma.desktopPc.delete({ where: { id } }),
}
