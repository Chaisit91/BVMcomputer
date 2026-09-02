import { prisma } from '../../lib/prisma'

export const bannerRepository = {
  findMany: () => prisma.banner.findMany(),
  findById: (id: string) => prisma.banner.findUnique({ where: { id } }),
  create: (data: any) => prisma.banner.create({ data }),
  update: (id: string, data: any) => prisma.banner.update({ where: { id }, data }),
  remove: (id: string) => prisma.banner.delete({ where: { id } }),
}
