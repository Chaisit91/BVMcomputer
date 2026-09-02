import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const caseRepository = createProductAnchoredRepository('case', prisma.case)
