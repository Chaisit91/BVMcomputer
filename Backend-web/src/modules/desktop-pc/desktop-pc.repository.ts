import { prisma } from '../../lib/prisma'

export const desktopPcRepository = {
  findMany: () => prisma.desktopPc.findMany(),
  findById: (id: string) => prisma.desktopPc.findUnique({ where: { id } }),
  create: (data: any) => prisma.desktopPc.create({ data }),
  update: (id: string, data: any) => prisma.desktopPc.update({ where: { id }, data }),
  remove: (id: string) => prisma.desktopPc.delete({ where: { id } }),
}
