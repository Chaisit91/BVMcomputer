import { prisma } from '../../lib/prisma'

const include = {
  createdBy: { select: { firstName: true, lastName: true } },
  roleHistory: { orderBy: { date: 'desc' as const } },
  loginHistory: { orderBy: { date: 'desc' as const } },
}

// admin-web's AdminAccount.createdBy expects a display name, not the raw FK —
// resolve the self-relation into the same string shape the mock used to return.
function shape(row: any) {
  if (!row) return row
  const { createdBy, ...own } = row
  return {
    ...own,
    createdBy: createdBy ? `${createdBy.firstName} ${createdBy.lastName}` : '- (บัญชีเริ่มต้นระบบ)',
  }
}

export const adminRepository = {
  findMany: async (role?: string) =>
    (await prisma.adminAccount.findMany({ where: role ? { role: role as any } : undefined, include })).map(shape),
  findById: async (id: string) => shape(await prisma.adminAccount.findUnique({ where: { id }, include })),
  // plain lookup for auth only — no need to resolve createdBy/history there
  findByEmail: (email: string) => prisma.adminAccount.findUnique({ where: { email } }),
  findByPasswordSetupTokenHash: (tokenHash: string) =>
    prisma.adminAccount.findUnique({ where: { passwordSetupTokenHash: tokenHash } }),
  // personalEmail isn't a unique column (older accounts predate it and share
  // the "" default) — findFirst is fine here since only accounts with a real,
  // distinct personalEmail can ever receive a reset link in the first place.
  findByPersonalEmail: (personalEmail: string) => prisma.adminAccount.findFirst({ where: { personalEmail } }),
  create: (data: any) => prisma.adminAccount.create({ data }),
  update: (id: string, data: any) => prisma.adminAccount.update({ where: { id }, data }),
  remove: (id: string) => prisma.adminAccount.delete({ where: { id } }),
}
