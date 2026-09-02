import { prisma } from './prisma'
import type { PartCategory } from '../../generated/prisma'

const specInclude = {
  product: {
    include: {
      specValues: { include: { field: true } },
      extraSpecs: true,
      videoLinks: true,
    },
  },
} as const

function shapeRow(row: any) {
  if (!row) return row
  const { product, ...own } = row
  return {
    ...own,
    id: own.productId,
    specs: Object.fromEntries(product.specValues.map((v: any) => [v.field.key, v.value])),
    extraSpecs: product.extraSpecs.map(({ id, name, detail }: any) => ({ id, name, detail })),
    videoLinks: product.videoLinks.map((v: any) => v.url),
  }
}

async function upsertSpecValues(category: PartCategory, productId: string, specs: Record<string, unknown> | undefined) {
  if (!specs) return
  for (const [key, value] of Object.entries(specs)) {
    const field = await prisma.specField.upsert({
      where: { category_key: { category, key } },
      update: {},
      create: { category, key, label: key },
    })
    await prisma.productSpecValue.upsert({
      where: { productId_fieldId: { productId, fieldId: field.id } },
      update: { value: String(value) },
      create: { productId, fieldId: field.id, value: String(value) },
    })
  }
}

async function replaceExtraSpecs(productId: string, extraSpecs: { name: string; detail: string }[] | undefined) {
  if (!extraSpecs) return
  await prisma.extraSpec.deleteMany({ where: { productId } })
  if (extraSpecs.length) {
    await prisma.extraSpec.createMany({ data: extraSpecs.map((s) => ({ productId, name: s.name, detail: s.detail })) })
  }
}

async function replaceVideoLinks(productId: string, videoLinks: string[] | undefined) {
  if (!videoLinks) return
  await prisma.productVideoLink.deleteMany({ where: { productId } })
  if (videoLinks.length) {
    await prisma.productVideoLink.createMany({ data: videoLinks.map((url) => ({ productId, url })) })
  }
}

// ponytail: `delegate: any` — the 7 Prisma model delegates (Gpu/Motherboard/...)
// are structurally identical here (productId PK + product relation) but not
// nominally the same type, and typing that properly needs a mapped-type per
// delegate for little real benefit on what's already a passthrough scaffold.
export function createProductAnchoredRepository(category: PartCategory, delegate: any) {
  return {
    findMany: async () => (await delegate.findMany({ include: specInclude })).map(shapeRow),

    findById: async (productId: string) => shapeRow(await delegate.findUnique({ where: { productId }, include: specInclude })),

    create: async (data: any) => {
      const { specs, extraSpecs, videoLinks, ...own } = data
      const created = await delegate.create({ data: { ...own, product: { create: { category } } } })
      await upsertSpecValues(category, created.productId, specs)
      await replaceExtraSpecs(created.productId, extraSpecs)
      await replaceVideoLinks(created.productId, videoLinks)
      return delegate.findUnique({ where: { productId: created.productId }, include: specInclude }).then(shapeRow)
    },

    update: async (productId: string, data: any) => {
      const { specs, extraSpecs, videoLinks, ...own } = data
      await delegate.update({ where: { productId }, data: own })
      await upsertSpecValues(category, productId, specs)
      await replaceExtraSpecs(productId, extraSpecs)
      await replaceVideoLinks(productId, videoLinks)
      return delegate.findUnique({ where: { productId }, include: specInclude }).then(shapeRow)
    },

    // delete the shared Product anchor, not the category row directly — Gpu/Motherboard/...
    // cascade off Product, but the reverse isn't true, and deleting the category row alone
    // would orphan the Product plus its ProductSpecValue/ExtraSpec/ProductVideoLink rows.
    remove: (productId: string) => prisma.product.delete({ where: { id: productId } }),
  }
}
