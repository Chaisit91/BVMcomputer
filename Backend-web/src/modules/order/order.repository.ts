import { Order, OrderLineItem, assertValidOrderItems } from './order.model'

// Line items are nested writes (Order 1-N OrderLineItem), not a plain column,
// so create/update need the { items: { create: [...] } } shape Prisma expects.
export const orderRepository = {
  findMany: () => Order.findMany({ include: { items: true } }),
  findById: (id: string) => Order.findUnique({ where: { id }, include: { items: true } }),
  create: (data: any) => {
    const { items, ...rest } = data
    assertValidOrderItems(items)
    return Order.create({
      data: { ...rest, items: { create: items ?? [] } },
      include: { items: true },
    })
  },
  update: async (id: string, data: any) => {
    const { items, ...rest } = data
    if (items) assertValidOrderItems(items)

    await Order.update({ where: { id }, data: rest })

    if (items) {
      await OrderLineItem.deleteMany({ where: { orderId: id } })
      if (items.length) {
        await OrderLineItem.createMany({ data: items.map((item: any) => ({ ...item, orderId: id })) })
      }
    }

    return Order.findUnique({ where: { id }, include: { items: true } })
  },
  remove: (id: string) => Order.delete({ where: { id } }),
}
