import { prisma } from '../../lib/prisma'

export const customBuildRepository = {
  findMany: () => prisma.customBuild.findMany(),
  findById: (id: string) => prisma.customBuild.findUnique({ where: { id } }),
  create: (data: any) => prisma.customBuild.create({ data }),
  update: (id: string, data: any) => prisma.customBuild.update({ where: { id }, data }),
  remove: (id: string) => prisma.customBuild.delete({ where: { id } }),
}
