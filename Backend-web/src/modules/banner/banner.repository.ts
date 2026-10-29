import { prisma } from '../../lib/prisma'
import { assertValidBannerDates } from '../../schemas/banner.schema'

export const bannerRepository = {
  findMany: () => prisma.banner.findMany(),
  findById: (id: string) => prisma.banner.findUnique({ where: { id } }),
  create: (data: any) => {
    const coercedDates = assertValidBannerDates(data)
    return prisma.banner.create({ data: { ...data, ...coercedDates } })
  },
  update: (id: string, data: any) => {
    const coercedDates = assertValidBannerDates(data)
    return prisma.banner.update({ where: { id }, data: { ...data, ...coercedDates } })
  },
  remove: (id: string) => prisma.banner.delete({ where: { id } }),
}
