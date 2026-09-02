import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const psuRepository = createProductAnchoredRepository('psu', prisma.psu)
