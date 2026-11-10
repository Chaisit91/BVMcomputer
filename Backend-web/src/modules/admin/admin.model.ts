import { prisma } from '../../lib/prisma'
import type { AdminAccount as AdminAccountRecord } from '../../../generated/prisma'

export const AdminAccount = prisma.adminAccount
export type { AdminAccountRecord }
