import { prisma } from '../../lib/prisma'

export const psuRepository = {
  findMany: () => prisma.psu.findMany(),
  findById: (id: string) => prisma.psu.findUnique({ where: { id } }),
  create: (data: any) => prisma.psu.create({ data }),
  update: (id: string, data: any) => prisma.psu.update({ where: { id }, data }),
  remove: (id: string) => prisma.psu.delete({ where: { id } }),
}
