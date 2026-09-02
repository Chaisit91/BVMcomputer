import { prisma } from '../../lib/prisma'

export const motherboardRepository = {
  findMany: () => prisma.motherboard.findMany(),
  findById: (id: string) => prisma.motherboard.findUnique({ where: { id } }),
  create: (data: any) => prisma.motherboard.create({ data }),
  update: (id: string, data: any) => prisma.motherboard.update({ where: { id }, data }),
  remove: (id: string) => prisma.motherboard.delete({ where: { id } }),
}
