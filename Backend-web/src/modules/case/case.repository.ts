import { prisma } from '../../lib/prisma'

export const caseRepository = {
  findMany: () => prisma.case.findMany(),
  findById: (id: string) => prisma.case.findUnique({ where: { id } }),
  create: (data: any) => prisma.case.create({ data }),
  update: (id: string, data: any) => prisma.case.update({ where: { id }, data }),
  remove: (id: string) => prisma.case.delete({ where: { id } }),
}
