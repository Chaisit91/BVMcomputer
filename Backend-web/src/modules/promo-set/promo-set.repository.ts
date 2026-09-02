import { prisma } from '../../lib/prisma'

export const promoSetRepository = {
  findMany: () => prisma.promoSet.findMany(),
  findById: (id: string) => prisma.promoSet.findUnique({ where: { id } }),
  create: (data: any) => prisma.promoSet.create({ data }),
  update: (id: string, data: any) => prisma.promoSet.update({ where: { id }, data }),
  remove: (id: string) => prisma.promoSet.delete({ where: { id } }),
}
