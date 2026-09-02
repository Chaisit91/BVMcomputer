import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const storageRepository = createProductAnchoredRepository('storage', prisma.storage)
