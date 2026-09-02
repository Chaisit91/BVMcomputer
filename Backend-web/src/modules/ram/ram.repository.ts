import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const ramRepository = createProductAnchoredRepository('ram', prisma.ram)
