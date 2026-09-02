import { prisma } from '../../lib/prisma'
import { getProductName } from '../../lib/productLookup'

async function shape(row: any) {
  const { components, ...own } = row
  const shapedComponents: Record<string, string> = {}
  const prices: Record<string, number> = {}
  for (const c of components) {
    shapedComponents[c.slot] = await getProductName(c.slot, c.productId)
    prices[c.slot] = Number(c.price)
  }
  const total = Object.values(prices).reduce((sum, price) => sum + price, 0)
  return { ...own, components: shapedComponents, prices, total }
}

export const customBuildRepository = {
  findMany: async () => {
    const rows = await prisma.customBuild.findMany({ include: { components: true } })
    return Promise.all(rows.map(shape))
  },

  findById: async (id: string) => {
    const row = await prisma.customBuild.findUnique({ where: { id }, include: { components: true } })
    return row ? shape(row) : null
  },

  // ponytail: expects `components` as { <slot>: productId } and `prices` as
  // { <slot>: number } (snapshotted per component) — see desktop-pc.repository.ts
  create: async (data: any) => {
    const { components, prices, ...own } = data
    const created = await prisma.customBuild.create({
      data: {
        ...own,
        components: {
          create: Object.entries(components ?? {}).map(([slot, productId]) => ({
            slot,
            productId,
            price: prices?.[slot] ?? 0,
          })) as any,
        },
      },
    })
    return customBuildRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { components, prices, ...own } = data
    await prisma.customBuild.update({ where: { id }, data: own })

    if (components) {
      await prisma.customBuildComponent.deleteMany({ where: { customBuildId: id } })
      await prisma.customBuildComponent.createMany({
        data: Object.entries(components).map(([slot, productId]) => ({
          customBuildId: id,
          slot,
          productId,
          price: prices?.[slot] ?? 0,
        })) as any,
      })
    }

    return customBuildRepository.findById(id)
  },

  remove: (id: string) => prisma.customBuild.delete({ where: { id } }),
}
