import { prisma } from '../../lib/prisma'

export const storageRepository = {
  findMany: () => prisma.storage.findMany(),
  findById: (id: string) => prisma.storage.findUnique({ where: { id } }),
  create: (data: any) => prisma.storage.create({ data }),
  update: (id: string, data: any) => prisma.storage.update({ where: { id }, data }),
  remove: (id: string) => prisma.storage.delete({ where: { id } }),
}
