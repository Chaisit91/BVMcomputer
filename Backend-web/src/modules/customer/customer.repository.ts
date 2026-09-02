import { prisma } from '../../lib/prisma'

export const customerRepository = {
  findMany: () => prisma.customer.findMany(),
  findById: (id: string) => prisma.customer.findUnique({ where: { id } }),
  create: (data: any) => prisma.customer.create({ data }),
  update: (id: string, data: any) => prisma.customer.update({ where: { id }, data }),
  remove: (id: string) => prisma.customer.delete({ where: { id } }),
}
