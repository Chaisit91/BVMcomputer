import { prisma } from '../../lib/prisma'

export const coolingRepository = {
  findMany: () => prisma.cooling.findMany(),
  findById: (id: string) => prisma.cooling.findUnique({ where: { id } }),
  create: (data: any) => prisma.cooling.create({ data }),
  update: (id: string, data: any) => prisma.cooling.update({ where: { id }, data }),
  remove: (id: string) => prisma.cooling.delete({ where: { id } }),
}
