import { prisma } from '../../lib/prisma'

export const ramRepository = {
  findMany: () => prisma.ram.findMany(),
  findById: (id: string) => prisma.ram.findUnique({ where: { id } }),
  create: (data: any) => prisma.ram.create({ data }),
  update: (id: string, data: any) => prisma.ram.update({ where: { id }, data }),
  remove: (id: string) => prisma.ram.delete({ where: { id } }),
}
