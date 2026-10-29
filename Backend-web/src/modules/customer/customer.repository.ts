import { prisma } from '../../lib/prisma'

export const customerRepository = {
  findMany: () => prisma.customer.findMany(),
  findById: (id: string) =>
    prisma.customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } } },
    }),
  // customerCode is required+unique with no DB default, and the admin-web
  // create form (manually registering a customer) never collects one —
  // generate it here rather than leaving account creation permanently broken.
  create: (data: any) => prisma.customer.create({ data: { customerCode: `CUS-${Date.now()}`, ...data } }),
  update: (id: string, data: any) => prisma.customer.update({ where: { id }, data }),
  remove: (id: string) => prisma.customer.delete({ where: { id } }),
}
