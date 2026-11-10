import { Banner, assertValidBannerDates } from './banner.model'

export const bannerRepository = {
  findMany: () => Banner.findMany(),
  findById: (id: string) => Banner.findUnique({ where: { id } }),
  create: (data: any) => {
    const coercedDates = assertValidBannerDates(data)
    return Banner.create({ data: { ...data, ...coercedDates } })
  },
  update: (id: string, data: any) => {
    const coercedDates = assertValidBannerDates(data)
    return Banner.update({ where: { id }, data: { ...data, ...coercedDates } })
  },
  remove: (id: string) => Banner.delete({ where: { id } }),
}
