import { prisma } from '../../lib/prisma'
import type { Customer as CustomerRecord } from '../../../generated/prisma'

export const Customer = prisma.customer
export type { CustomerRecord }
