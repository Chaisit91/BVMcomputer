import { prisma } from '../../lib/prisma'

export const gpuRepository = {
  findMany: () => prisma.gpu.findMany(),
  findById: (id: string) => prisma.gpu.findUnique({ where: { id } }),
  create: (data: any) => prisma.gpu.create({ data }),
  update: (id: string, data: any) => prisma.gpu.update({ where: { id }, data }),
  remove: (id: string) => prisma.gpu.delete({ where: { id } }),
}
