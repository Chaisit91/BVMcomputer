import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const motherboardRepository = createProductAnchoredRepository('motherboard', prisma.motherboard)
