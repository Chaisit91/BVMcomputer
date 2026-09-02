import { prisma } from '../../lib/prisma'

export const cpuRepository = {
  findMany: () => prisma.cpu.findMany(),
  findById: (id: string) => prisma.cpu.findUnique({ where: { id } }),
  create: (data: any) => prisma.cpu.create({ data }),
  update: (id: string, data: any) => prisma.cpu.update({ where: { id }, data }),
  remove: (id: string) => prisma.cpu.delete({ where: { id } }),
}
