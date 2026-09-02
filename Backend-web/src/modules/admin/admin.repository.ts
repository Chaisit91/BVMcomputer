import { prisma } from '../../lib/prisma'

export const adminRepository = {
  findMany: () => prisma.adminAccount.findMany(),
  findById: (id: string) => prisma.adminAccount.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.adminAccount.findUnique({ where: { email } }),
  create: (data: any) => prisma.adminAccount.create({ data }),
  update: (id: string, data: any) => prisma.adminAccount.update({ where: { id }, data }),
  remove: (id: string) => prisma.adminAccount.delete({ where: { id } }),
}
