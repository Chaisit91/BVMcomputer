import { prisma } from '../../lib/prisma'
import { assertValidBannerDates } from '../../schemas/banner.schema'

export const bannerRepository = {
  findMany: () => prisma.banner.findMany(),
  findById: (id: string) => prisma.banner.findUnique({ where: { id } }),
  create: (data: any) => {
    assertValidBannerDates(data)
    return prisma.banner.create({ data })
  },
  update: (id: string, data: any) => {
    assertValidBannerDates(data)
    return prisma.banner.update({ where: { id }, data })
  },
  remove: (id: string) => prisma.banner.delete({ where: { id } }),
}
