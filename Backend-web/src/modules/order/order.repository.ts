import { prisma } from '../../lib/prisma'
import { assertValidOrderItems } from '../../schemas/orderItem.schema'

// Line items are nested writes (Order 1-N OrderLineItem), not a plain column,
// so create/update need the { items: { create: [...] } } shape Prisma expects.
export const orderRepository = {
  findMany: () => prisma.order.findMany({ include: { items: true } }),
  findById: (id: string) => prisma.order.findUnique({ where: { id }, include: { items: true } }),
  create: (data: any) => {
    const { items, ...rest } = data
    assertValidOrderItems(items)
    return prisma.order.create({
      data: { ...rest, items: { create: items ?? [] } },
      include: { items: true },
    })
  },
  update: async (id: string, data: any) => {
    const { items, ...rest } = data
    if (items) assertValidOrderItems(items)

    await prisma.order.update({ where: { id }, data: rest })

    if (items) {
      await prisma.orderLineItem.deleteMany({ where: { orderId: id } })
      if (items.length) {
        await prisma.orderLineItem.createMany({ data: items.map((item: any) => ({ ...item, orderId: id })) })
      }
    }

    return prisma.order.findUnique({ where: { id }, include: { items: true } })
  },
  remove: (id: string) => prisma.order.delete({ where: { id } }),
}
