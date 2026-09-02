import { prisma } from '../../lib/prisma'

// Line items are nested writes (Order 1-N OrderLineItem), not a plain column,
// so create/update need the { items: { create: [...] } } shape Prisma expects.
export const orderRepository = {
  findMany: () => prisma.order.findMany({ include: { items: true } }),
  findById: (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),
  create: (data: any) => {
    const { items, ...rest } = data
    return prisma.order.create({
      data: { ...rest, items: { create: items ?? [] } },
      include: { items: true },
    })
  },
  update: (id: string, data: any) => {
    const { items, ...rest } = data
    return prisma.order.update({ where: { id }, data: rest, include: { items: true } })
  },
  remove: (id: string) => prisma.order.delete({ where: { id } }),
}
